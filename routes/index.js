import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

// Create router
const router = express.Router();

// GET status of server
router.get('/status', AppController.getStatus);

// GET stats of server
router.get('/stats', AppController.getStats);

// POST users to database
router.post('/users', UsersController.postNew);

// GET connect
router.get('/connect', AuthController.getConnect);

// GET disconnect
router.get('/disconnect', AuthController.getDisconnect);

// GET user me
router.get('/users/me', UsersController.getMe);

// POST files
router.post('/files', FilesController.postUpload);

// GET files
router.get('/files/:id', FilesController.getShow);

// GET files
router.get('/files', FilesController.getIndex);

// Export router
export default router;
