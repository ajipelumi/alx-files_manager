import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

// Create router
const router = express.Router();

// GET status of server
router.get('/status', AppController.getStatus);

// GET stats of server
router.get('/stats', AppController.getStats);

// POST users to database
router.post('/users', UsersController.postNew);

// Export router
export default router;
