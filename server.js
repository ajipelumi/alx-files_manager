import express from 'express';
import router from './routes/index';

// Create Express server
const app = express();

// Use JSON
app.use(express.json());

// Use router
app.use('/', router);

// Get port from environment or default to 5000
const port = process.env.PORT || 5000;

// Listen on provided port
app.listen(port, () => console.log(`Server running on port ${port}`));
