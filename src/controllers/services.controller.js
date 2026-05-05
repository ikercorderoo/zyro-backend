import * as businessService from '../services/business.service.js';

export const createService = async (req, res, next) => {
    try {
        // Find the business owned by the authenticated professional
        const businesses = await businessService.getBusinessesByOwner(req.user.id);

        if (!businesses || businesses.length === 0) {
            return res.status(400).json({ message: 'Primero debes crear un perfil de negocio en Ajustes' });
        }

        const businessId = businesses[0].id;

        const service = await businessService.createService({
            ...req.body,
            businessId
        });
        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};

export const getServices = async (req, res, next) => {
    try {
        const { businessId } = req.query;
        const services = await businessService.getServicesByBusiness(businessId);
        res.json(services);
    } catch (error) {
        next(error);
    }
};

export const getServiceById = async (req, res, next) => {
    try {
        const service = await businessService.getServiceById(req.params.id);
        if (!service || !service.active) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        res.json(service);
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req, res, next) => {
    try {
        const service = await businessService.updateServiceForOwner(req.params.id, req.user.id, req.body);
        res.json(service);
    } catch (error) {
        next(error);
    }
};

export const deleteService = async (req, res, next) => {
    try {
        await businessService.deleteServiceForOwner(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const createAddon = async (req, res, next) => {
    try {
        const { serviceId } = req.params;
        const addon = await businessService.createAddon(serviceId, req.user.id, req.body);
        res.status(201).json(addon);
    } catch (error) {
        next(error);
    }
};

export const updateAddon = async (req, res, next) => {
    try {
        const addon = await businessService.updateAddon(req.params.id, req.user.id, req.body);
        res.json(addon);
    } catch (error) {
        next(error);
    }
};

export const deleteAddon = async (req, res, next) => {
    try {
        await businessService.deleteAddon(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
