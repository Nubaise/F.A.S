const {
    getAvailability,
    createAvailability,
    deleteAvailability,
} = require("../controllers/availController");

const prisma = require("../config/database.js");

jest.mock("../config/database.js", () => ({
    facultyAvailability: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    appointmentRequest: {
        findMany: jest.fn(),
    },
    busyblocks: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    },
}));

const mockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("createAvailability", () => {

    test("rejects availability creation from a non-faculty user", async () => {
        const req = {
            user: {
                role: "STUDENT",
            },
            body: {
                start: "2026-08-28T10:00:00.000Z",
                end: "2026-08-28T11:00:00.000Z",
            },
        };

        const res = mockResponse();

        await createAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Only faculty members can create availability slots",
        });
    });

    test("rejects an availability slot when start is after end", async () => {
        const req = {
            user: {
                role: "FACULTY",
                facultyProfile: {
                    id: 10,
                },
            },
            body: {
                start: "2026-08-28T12:00:00.000Z",
                end: "2026-08-28T11:00:00.000Z",
            },
        };

        const res = mockResponse();

        await createAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Start time must be before end time",
        });
    });

    test("rejects an availability slot that overlaps an existing slot", async () => {
        prisma.facultyAvailability.findFirst.mockResolvedValue({
            id: 25,
            facultyId: 10,
        });

        const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const req = {
            user: {
                role: "FACULTY",
                facultyProfile: {
                    id: 10,
                },
            },
            body: {
                start: start.toISOString(),
                end: end.toISOString(),
            },
        };

        const res = mockResponse();

        await createAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "This time slot overlaps with an existing availability slot",
        });
    });

    test("creates a valid availability slot", async () => {
        prisma.facultyAvailability.findFirst.mockResolvedValue(null);

        const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const createdSlot = {
            id: 50,
            facultyId: 10,
            start,
            end,
        };

        prisma.facultyAvailability.create.mockResolvedValue(createdSlot);

        const req = {
            user: {
                role: "FACULTY",
                facultyProfile: {
                    id: 10,
                },
            },
            body: {
                start: start.toISOString(),
                end: end.toISOString(),
            },
        };

        const res = mockResponse();

        await createAvailability(req, res);

        expect(prisma.facultyAvailability.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdSlot);
    });
});

describe("deleteAvailability", () => {

    test("rejects deletion from a non-faculty user", async () => {
        const req = {
            user: {
                role: "STUDENT",
            },
            body: {
                start: "2026-08-28T10:00:00.000Z",
                end: "2026-08-28T11:00:00.000Z",
            },
        };

        const res = mockResponse();

        await deleteAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Only faculty members can delete availability slots",
        });
    });

    test("rejects deletion when the slot overlaps a busy block", async () => {
        prisma.busyblocks.findFirst.mockResolvedValue({
            id: 100,
            facultyId: 10,
        });

        const req = {
            user: {
                role: "FACULTY",
                facultyProfile: {
                    id: 10,
                },
            },
            body: {
                start: "2026-08-28T10:00:00.000Z",
                end: "2026-08-28T11:00:00.000Z",
            },
        };

        const res = mockResponse();

        await deleteAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "This time slot overlaps with an existing busy block",
        });
    });

    test("creates a busy block when deleting availability", async () => {
        prisma.busyblocks.findFirst.mockResolvedValue(null);

        const createdBlock = {
            id: 101,
            facultyId: 10,
        };

        prisma.busyblocks.create.mockResolvedValue(createdBlock);

        const req = {
            user: {
                role: "FACULTY",
                facultyProfile: {
                    id: 10,
                },
            },
            body: {
                start: "2026-08-28T10:00:00.000Z",
                end: "2026-08-28T11:00:00.000Z",
            },
        };

        const res = mockResponse();

        await deleteAvailability(req, res);

        expect(prisma.busyblocks.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdBlock);
    });
});

describe("getAvailability", () => {

    test("returns free availability after subtracting appointments and busy blocks", async () => {
        const now = new Date(Date.now() + 60 * 60 * 1000);
        const slotStart = new Date(now);
        const slotEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const appointmentStart = new Date(now.getTime() + 30 * 60 * 1000);
        const appointmentEnd = new Date(now.getTime() + 60 * 60 * 1000);

        prisma.facultyAvailability.findMany.mockResolvedValue([
            {
                facultyId: 10,
                start: slotStart,
                end: slotEnd,
                faculty: {
                    user: {
                        name: "Test Faculty",
                        email: "faculty@test.com",
                    },
                    department: "Computer Science",
                    designation: "Professor",
                },
            },
        ]);

        prisma.appointmentRequest.findMany.mockResolvedValue([
            {
                facultyId: 10,
                start: appointmentStart,
                end: appointmentEnd,
            },
        ]);

        prisma.busyblocks.findMany.mockResolvedValue([]);

        const req = {
            query: {
                facultyId: "10",
            },
            user: {},
        };

        const res = mockResponse();

        await getAvailability(req, res);

        expect(res.json).toHaveBeenCalled();

        const result = res.json.mock.calls[0][0];

        expect(result).toHaveLength(2);
        expect(result[0].facultyId).toBe(10);
        expect(result[0].start).toEqual(slotStart);
        expect(result[0].end).toEqual(appointmentStart);

        expect(result[1].start).toEqual(appointmentEnd);
        expect(result[1].end).toEqual(slotEnd);
    });
});