import { Buffer } from 'buffer';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Create AuthController class that will handle requests to the routes
class AuthController {
  // Sign in user by generating a new authentication token
  static async getConnect(request, response) {
    // Get the authorization header
    const auth = request.header('Authorization');
    // Check if authorization header is not missing
    if (!auth) {
      // Send error response
      response.status(401);
      response.send({ error: 'Unauthorized' });
    }
    // Get the base64 encoded string from the authorization header
    // Authorization header is in the format: 'Basic base64encodedstring'
    const encoded = auth.split(' ')[1];
    // Decode the base64 encoded string
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    // Get the email and password from the decoded string
    const [email, password] = decoded.split(':');
    // Check if email or password is missing
    if (!email || !password) {
      // Send error response
      response.status(401);
      response.send({ error: 'Unauthorized' });
    }
    // Create a SHA1 hash of the password
    const hashedPassword = crypto.createHash('sha1');
    hashedPassword.update(password, 'utf-8');
    const encryptedPassword = hashedPassword.digest('hex');
    // Get the users collection from the db
    const users = dbClient.db.collection('users');
    // Get the user with the email and password
    const user = await users.findOne({ email, password: encryptedPassword });
    // Check if user exists
    if (!user) {
      // Send error response
      response.status(401);
      response.send({ error: 'Unauthorized' });
    }
    // Create a new authentication token for the user
    const token = uuidv4();
    // Create a key for the token in Redis
    const key = `auth_${token}`;
    // Set the user id as the value of the key in Redis
    // Set the key to expire in 24 hours which is 86400 seconds
    await redisClient.set(key, user._id.toString(), 86400);
    // Send response with the authentication token
    response.status(200);
    response.send({ token });
  }

  // Sign out user by removing the authentication token
  static async getDisconnect(request, response) {
    // Get the authorization token
    const token = request.header('X-Token');
    // Check if authorization token is missing
    if (!token) {
      // Send error response
      response.status(401);
      response.send({ error: 'Unauthorized' });
    }
    // Get the key for the token in Redis
    const key = `auth_${token}`;
    // Get the value of the key in Redis which is the user id
    // If the value exists, it means the token is valid
    const value = await redisClient.get(key);
    // Check if value exists
    if (!value) {
      // Send error response
      response.status(401);
      response.send({ error: 'Unauthorized' });
    }
    // Delete the key in Redis
    await redisClient.del(key);
    // Send response with status code 204
    response.status(204);
    response.send();
  }
}

// Export the AuthController
export default AuthController;
