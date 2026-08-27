const mockVerifyIdToken = jest.fn();

jest.mock("../config/database.js", () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("google-auth-library", () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
    })),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
}));

const { callback } = require("../controllers/authController");
const prisma = require("../config/database.js");
const jwt = require("jsonwebtoken");

const mockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);

    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockReset();

    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost/callback";
    process.env.REDIRECT_URI = "http://localhost";
    process.env.JWT_SECRET = "test-secret";

    global.fetch = jest.fn();
});

describe("callback", () => {

    test("rejects authentication when authorization code is missing", async () => {
        const req = {
            query: {},
        };

        const res = mockResponse();

        await callback(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            error: "Authorization code is missing",
        });

        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("rejects authentication when Google token exchange fails", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                error: "invalid_grant",
            }),
        });

        const req = {
            query: {
                code: "invalid-code",
            },
        };

        const res = mockResponse();

        await callback(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            error: "Error fetching tokens",
        });
    });

    test("redirects unknown users instead of issuing a JWT", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                id_token: "google-id-token",
            }),
        });

        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({
                email: "unknown@example.com",
            }),
        });

        prisma.user.findUnique.mockResolvedValue(null);

        const req = {
            query: {
                code: "valid-code",
            },
        };

        const res = mockResponse();

        await callback(req, res);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: {
                email: "unknown@example.com",
            },
        });

        expect(res.redirect).toHaveBeenCalledWith(
            process.env.REDIRECT_URI
        );

        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test("authenticates an existing user and issues a JWT containing user identity and role", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                id_token: "google-id-token",
            }),
        });

        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({
                email: "student@example.com",
                picture: "https://example.com/profile.jpg",
            }),
        });

        prisma.user.findUnique.mockResolvedValue({
            id: 42,
            email: "student@example.com",
            role: "STUDENT",
            profilePic: "existing-picture",
        });

        jwt.sign.mockReturnValue("generated-jwt");

        const req = {
            query: {
                code: "valid-code",
            },
        };

        const res = mockResponse();

        await callback(req, res);

        expect(jwt.sign).toHaveBeenCalledWith(
            {
                userId: 42,
                role: "STUDENT",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30m",
            }
        );

        expect(res.redirect).toHaveBeenCalledWith(
            `${process.env.REDIRECT_URI}/login?token=generated-jwt`
        );
    });

    test("updates the profile picture when the existing user has no profile picture", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                id_token: "google-id-token",
            }),
        });

        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({
                email: "faculty@example.com",
                picture: "https://example.com/faculty.jpg",
            }),
        });

        prisma.user.findUnique.mockResolvedValue({
            id: 99,
            email: "faculty@example.com",
            role: "FACULTY",
            profilePic: "",
        });

        prisma.user.update.mockResolvedValue({});

        jwt.sign.mockReturnValue("faculty-jwt");

        const req = {
            query: {
                code: "valid-code",
            },
        };

        const res = mockResponse();

        await callback(req, res);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: {
                email: "faculty@example.com",
            },
            data: {
                profilePic: "https://example.com/faculty.jpg",
            },
        });

        expect(jwt.sign).toHaveBeenCalledWith(
            {
                userId: 99,
                role: "FACULTY",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30m",
            }
        );

        expect(res.redirect).toHaveBeenCalledWith(
            `${process.env.REDIRECT_URI}/login?token=faculty-jwt`
        );
    });
});