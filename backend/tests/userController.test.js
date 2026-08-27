jest.mock("../config/database", () => ({
    user: {
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
    },
}));

const prisma = require("../config/database");
const {
    addUser,
    deleteUser,
    getUsers,
    updateUser,
} = require("../controllers/userController");

const mockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Admin role authorization", () => {

    test("rejects non-admin users from adding users", async () => {
        const req = {
            user: {
                role: "STUDENT",
            },
            body: {},
        };

        const res = mockResponse();

        await addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            Error: "Unauthorised",
        });

        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    test("rejects non-admin users from deleting users", async () => {
        const req = {
            user: {
                role: "FACULTY",
            },
            params: {
                id: "10",
            },
        };

        const res = mockResponse();

        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            Error: "Unauthorised",
        });

        expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    test("rejects non-admin users from viewing all users", async () => {
        const req = {
            user: {
                role: "STUDENT",
            },
        };

        const res = mockResponse();

        await getUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            Error: "Unauthorised",
        });

        expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    test("rejects non-admin users from updating users", async () => {
        const req = {
            user: {
                role: "FACULTY",
            },
            params: {
                id: "10",
            },
            body: {},
        };

        const res = mockResponse();

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            Error: "Unauthorised",
        });

        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    test("allows an admin to add a student", async () => {
        const req = {
            user: {
                role: "ADMIN",
            },
            body: {
                name: "Test Student",
                email: "student@test.com",
                role: "STUDENT",
                roll: "B123",
                program: "CSE",
                dept: "CSE",
            },
        };

        const res = mockResponse();

        prisma.user.create.mockResolvedValue({
            id: 1,
            name: "Test Student",
            email: "student@test.com",
            role: "STUDENT",
        });

        await addUser(req, res);

        expect(prisma.user.create).toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: {
                id: 1,
                name: "Test Student",
                email: "student@test.com",
                role: "STUDENT",
            },
        });
    });

    test("allows an admin to delete a user", async () => {
        const req = {
            user: {
                role: "ADMIN",
            },
            params: {
                id: "10",
            },
        };

        const res = mockResponse();

        prisma.user.delete.mockResolvedValue({
            id: 10,
        });

        await deleteUser(req, res);

        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: {
                id: 10,
            },
        });

        expect(res.json).toHaveBeenCalledWith({
            success: true,
        });
    });

    test("allows an admin to view all users", async () => {
        const req = {
            user: {
                role: "ADMIN",
            },
        };

        const res = mockResponse();

        const users = [
            {
                id: 1,
                name: "Student",
                role: "STUDENT",
            },
            {
                id: 2,
                name: "Faculty",
                role: "FACULTY",
            },
        ];

        prisma.user.findMany.mockResolvedValue(users);

        await getUsers(req, res);

        expect(prisma.user.findMany).toHaveBeenCalledWith({
            include: {
                studentProfile: true,
                facultyProfile: true,
            },
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(users);
    });

    test("allows an admin to update a user", async () => {
        const req = {
            user: {
                role: "ADMIN",
            },
            params: {
                id: "10",
            },
            body: {
                name: "Updated User",
                email: "updated@test.com",
                role: "STUDENT",
                roll: "B456",
                program: "CSE",
                dept: "CSE",
            },
        };

        const res = mockResponse();

        const updatedUser = {
            id: 10,
            name: "Updated User",
            email: "updated@test.com",
            role: "STUDENT",
        };

        prisma.user.update.mockResolvedValue(updatedUser);

        await updateUser(req, res);

        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: 10,
                },
            })
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: updatedUser,
        });
    });
});