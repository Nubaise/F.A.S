jest.mock("../config/database", () => ({
    user: {
        findMany: jest.fn(),
    },
    ticket: {
        findMany: jest.fn(),
    },
    appointmentRequest: {
        findMany: jest.fn(),
    },
    timetable: {
        findMany: jest.fn(),
    },
    notification: {
        findMany: jest.fn(),
    },
}));

const prisma = require("../config/database");
const { generateBackup } = require("../controllers/backupController");

const mockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn();

    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("generateBackup", () => {

    test("rejects non-admin users", async () => {
        const req = {
            user: {
                role: "STUDENT",
            },
        };

        const res = mockResponse();

        await generateBackup(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Access denied",
        });

        expect(prisma.user.findMany).not.toHaveBeenCalled();
        expect(prisma.ticket.findMany).not.toHaveBeenCalled();
    });

    test("rejects faculty users", async () => {
        const req = {
            user: {
                role: "FACULTY",
            },
        };

        const res = mockResponse();

        await generateBackup(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Access denied",
        });

        expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    test("allows admin users to generate a database backup", async () => {
        const req = {
            user: {
                role: "ADMIN",
            },
        };

        const res = mockResponse();

        prisma.user.findMany.mockResolvedValue([
            { id: 1, name: "Admin" },
        ]);

        prisma.ticket.findMany.mockResolvedValue([
            { id: 10 },
        ]);

        prisma.appointmentRequest.findMany.mockResolvedValue([
            { id: 20 },
        ]);

        prisma.timetable.findMany.mockResolvedValue([
            { id: 30 },
        ]);

        prisma.notification.findMany.mockResolvedValue([
            { id: 40 },
        ]);

        await generateBackup(req, res);

        expect(prisma.user.findMany).toHaveBeenCalled();
        expect(prisma.ticket.findMany).toHaveBeenCalled();
        expect(prisma.appointmentRequest.findMany).toHaveBeenCalled();
        expect(prisma.timetable.findMany).toHaveBeenCalled();
        expect(prisma.notification.findMany).toHaveBeenCalled();

        expect(res.setHeader).toHaveBeenCalledWith(
            "Content-Type",
            "application/json"
        );

        expect(res.setHeader).toHaveBeenCalledWith(
            "Content-Disposition",
            "attachment; filename=database_backup.json"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
    });

    test("returns 500 when backup generation fails", async () => {
        const req = {
            user: {
                role: "ADMIN",
            },
        };

        const res = mockResponse();

        prisma.user.findMany.mockRejectedValue(
            new Error("Database unavailable")
        );

        await generateBackup(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            error: "Failed to generate backup file",
            details: "Database unavailable",
        });
    });
});