const {
    postAppointmentRequest,
    studentCancelAppointment,
    rescheduleAppointment,
} = require("../controllers/appointmentController");

const prisma = require("../config/database.js");
const sendEmail = require("../utils/mailer");
const notificationService = require("../services/notificationService");

jest.mock("../config/database.js", () => ({
    facultyAvailability: {
        findFirst: jest.fn(),
    },
    appointmentRequest: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    facultyProfile: {
        findUnique: jest.fn(),
    },
    studentProfile: {
        findUnique: jest.fn(),
    },
    appointmentUsers: {
        create: jest.fn(),
    },
    busyblocks: {
        findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
}));

jest.mock("../utils/mailer", () => jest.fn());

jest.mock("../services/notificationService", () => ({
    createNotification: jest.fn(),
}));

jest.mock("../emails/appointmentRequest", () => jest.fn());
jest.mock("../emails/appointmentApproved", () => jest.fn());
jest.mock("../emails/appointmentRejected", () => jest.fn());

const mockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

beforeEach(() => {
    jest.clearAllMocks();

    prisma.$transaction.mockImplementation(async (operations) => {
        if (Array.isArray(operations)) {
            return Promise.all(operations);
        }

        return operations;
    });
});

describe("postAppointmentRequest", () => {

    test("rejects appointment creation from a non-student", async () => {
        const req = {
            user: {
                role: "FACULTY",
            },
            body: {},
        };

        const res = mockResponse();

        await postAppointmentRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Only students can create appointment requests",
        });
    });

    test("rejects appointment creation when required fields are missing", async () => {
        const req = {
            user: {
                role: "STUDENT",
            },
            body: {
                facultyId: 1,
                start: "2026-09-01T10:00:00.000Z",
            },
        };

        const res = mockResponse();

        await postAppointmentRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing required fields",
        });
    });

    test("rejects an appointment when the faculty is unavailable", async () => {
        prisma.facultyAvailability.findFirst.mockResolvedValue(null);

        const req = {
            user: {
                role: "STUDENT",
                studentProfile: {
                    id: 10,
                },
            },
            body: {
                facultyId: 1,
                start: "2026-09-01T10:00:00.000Z",
                duration: 30,
                purpose: "Project discussion",
            },
        };

        const res = mockResponse();

        await postAppointmentRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "The selected time slot is not available for the chosen faculty member",
        });
    });

    test("rejects an appointment that overlaps an approved appointment", async () => {
        prisma.facultyAvailability.findFirst.mockResolvedValue({
            id: 1,
        });

        prisma.appointmentRequest.findFirst.mockResolvedValue({
            id: 99,
            status: "APPROVED",
        });

        const req = {
            user: {
                role: "STUDENT",
                studentProfile: {
                    id: 10,
                },
            },
            body: {
                facultyId: 1,
                start: "2026-09-01T10:00:00.000Z",
                duration: 30,
                purpose: "Project discussion",
            },
        };

        const res = mockResponse();

        await postAppointmentRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "The selected time slot overlaps with an already approved appointment",
        });
    });
});

describe("studentCancelAppointment", () => {

    test("rejects cancellation from a non-student", async () => {
        const req = {
            user: {
                role: "FACULTY",
            },
            params: {
                id: "1",
            },
        };

        const res = mockResponse();

        await studentCancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Only students can cancel",
        });
    });

    test("rejects cancellation when the appointment belongs to another student", async () => {
        prisma.appointmentRequest.findUnique.mockResolvedValue({
            id: 1,
            studentId: 999,
        });

        const req = {
            user: {
                role: "STUDENT",
                studentProfile: {
                    id: 10,
                },
            },
            params: {
                id: "1",
            },
        };

        const res = mockResponse();

        await studentCancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Unauthorized",
        });
    });

    test("cancels an appointment belonging to the student", async () => {
        prisma.appointmentRequest.findUnique.mockResolvedValue({
            id: 1,
            studentId: 10,
        });

        prisma.appointmentRequest.update.mockResolvedValue({
            id: 1,
            status: "CANCELLED",
        });

        const req = {
            user: {
                role: "STUDENT",
                studentProfile: {
                    id: 10,
                },
            },
            params: {
                id: "1",
            },
        };

        const res = mockResponse();

        await studentCancelAppointment(req, res);

        expect(prisma.appointmentRequest.update).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
            data: {
                status: "CANCELLED",
                cancellationNote: "Cancelled by student",
            },
        });

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            update: {
                id: 1,
                status: "CANCELLED",
            },
        });
    });
});

describe("rescheduleAppointment", () => {

    test("rejects rescheduling from a non-faculty user", async () => {
        const req = {
            user: {
                role: "STUDENT",
            },
            params: {
                id: "1",
            },
        };

        const res = mockResponse();

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Only faculty can reschedule",
        });
    });

    test("rejects rescheduling of an appointment belonging to another faculty member", async () => {
        prisma.appointmentRequest.findUnique.mockResolvedValue({
            id: 1,
            facultyId: 999,
            status: "APPROVED",
        });

        const req = {
            user: {
                role: "FACULTY",
                facultyProfile: {
                    id: 10,
                },
            },
            params: {
                id: "1",
            },
        };

        const res = mockResponse();

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: "Appointment not found",
        });
    });

    test("rejects rescheduling when appointment is not approved", async () => {
        prisma.appointmentRequest.findUnique.mockResolvedValue({
            id: 1,
            facultyId: 10,
            status: "PENDING",
        });

        const req = {
            user: {
                role: "FACULTY",
                facultyProfile: {
                    id: 10,
                },
            },
            params: {
                id: "1",
            },
        };

        const res = mockResponse();

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Only approved appointments can be rescheduled",
        });
    });
});