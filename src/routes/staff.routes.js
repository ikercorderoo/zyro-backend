import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as staffController from '../controllers/staff.controller.js';

const router = express.Router();

router.use(authMiddleware);

// Relacionado al negocio (crear y leer todo el staff de un negocio)
router.post('/business/:businessId', staffController.createStaff);
router.get('/business/:businessId', staffController.getStaff);

// Modificar, Eliminar Staff en particular
router.patch('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

// Horarios y bloqueos
router.put('/:id/schedule', staffController.updateSchedule);
router.post('/:id/block', staffController.createBlock);
router.delete('/block/:id', staffController.deleteBlock);

export default router;
