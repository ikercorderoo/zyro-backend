import * as businessService from '../services/business.service.js';
import { z } from 'zod';

const businessSchema = z.object({
    name: z.string().min(2),
    minLeadTime: z.number().min(0).optional(),
    maxBookingWindow: z.number().min(1).optional(),
    cancellationWindow: z.number().min(0).optional(),
    bufferTime: z.number().min(0).optional(),
    slotInterval: z.number().min(5).optional(),
    description: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    address: z.string().min(5, "La ubicación es obligatoria"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    imageUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
});

const blockSchema = z.object({
    staffId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    reason: z.string().optional()
});

export const createBusiness = async (req, res, next) => {
    try {
        const validatedData = businessSchema.parse(req.body);
        const business = await businessService.createBusiness(validatedData, req.user.id);
        res.status(201).json(business);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const getMyBusinesses = async (req, res, next) => {
    try {
        const businesses = await businessService.getBusinessesByOwner(req.user.id);
        res.json(businesses);
    } catch (error) {
        next(error);
    }
};

export const getBusiness = async (req, res, next) => {
    try {
        const business = await businessService.getBusinessById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Business not found' });
        res.json(business);
    } catch (error) {
        next(error);
    }
};

export const updateBusiness = async (req, res, next) => {
    try {
        const data = businessSchema.partial().parse(req.body);
        const business = await businessService.updateBusiness(req.params.id, data);
        res.json(business);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const createBlock = async (req, res, next) => {
    try {
        const { staffId, startTime, endTime, reason } = blockSchema.parse(req.body);
        const block = await businessService.createBlock(req.params.id, staffId, startTime, endTime, reason);
        res.status(201).json(block);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const getBlocks = async (req, res, next) => {
    try {
        const blocks = await businessService.getBlocks(req.params.id);
        res.json(blocks);
    } catch (error) {
        next(error);
    }
};

export const deleteBlock = async (req, res, next) => {
    try {
        await businessService.deleteBlock(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

