import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplace.controller.js';

const router = Router();

router.get('/search', marketplaceController.searchBusinesses);
router.get('/recommendations', marketplaceController.getRecommendations);
router.get('/business/:slug', marketplaceController.getBusinessBySlug);

export default router;
