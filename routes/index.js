import express from 'express';
import AppController from '../controllers/app.controller';

// Create router
const router = express.Router();

// GET status of server
router.get('/status', AppController.getStatus);

// GET stats of server
router.get('/stats', AppController.getStats);

// Export router
export default router;
