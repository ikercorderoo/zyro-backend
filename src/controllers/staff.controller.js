import * as staffService from '../services/staff.service.js';
import { z } from 'zod';

const staffSchema = z.object({
    name: z.string().min(2),
    role: z.string().optional(),
    imageUrl: z.string().optional()
});

const scheduleSchema = z.array(z.object({
    dayOfWeek: z.string(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    isAvailable: z.boolean().optional()
}));

const blockSchema = z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    reason: z.string().optional()
});

export const createStaff = async (req, res, next) => {
    try {
        const validatedData = staffSchema.parse(req.body);
        const staff = await staffService.createStaff(req.params.businessId, validatedData);
        res.status(201).json(staff);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const getStaff = async (req, res, next) => {
    try {
        const staff = await staffService.getStaffByBusiness(req.params.businessId);
        res.json(staff);
    } catch (error) {
        next(error);
    }
};

export const updateStaff = async (req, res, next) => {
    try {
        const validatedData = staffSchema.partial().parse(req.body);
        const staff = await staffService.updateStaff(req.params.id, validatedData);
        res.json(staff);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const deleteStaff = async (req, res, next) => {
    try {
        await staffService.deleteStaff(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const updateSchedule = async (req, res, next) => {
    try {
        const validatedSchedules = scheduleSchema.parse(req.body.schedules);
        const staff = await staffService.updateStaffSchedule(req.params.id, validatedSchedules);
        res.json(staff);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const createBlock = async (req, res, next) => {
    try {
        const { startTime, endTime, reason } = blockSchema.parse(req.body);
        const block = await staffService.createBlock(req.params.id, startTime, endTime, reason);
        res.status(201).json(block);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const deleteBlock = async (req, res, next) => {
    try {
        await staffService.deleteBlock(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
