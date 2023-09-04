import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// Create UsersController class that will handle requests to the routes
class UsersController {
  // Create new user in db
  static async postNew(request, response) {
    // Get the email and password from the request body
    const { email, password } = request.body;
    // Check if email is not missing
    if (!email) {
      // Send error response
      response.status(400);
      response.send({ error: 'Missing email' });
    }
    // Check if password is not missing
    if (!password) {
      // Send error response
      response.status(400);
      response.send({ error: 'Missing password' });
    }
    // Check if email already exists in db
    // Get the number of users with the email
    const user = await dbClient.nbUsers({ email });
    if (user > 0) {
      // Send error response
      response.status(400);
      response.send({ error: 'Already exist' });
    } else {
      // Create a SHA1 hash of the password
      const hashedPassword = crypto.createHash('sha1');
      hashedPassword.update(password, 'utf-8');
      const encryptedPassword = hashedPassword.digest('hex');
      // Create new user object
      const newUser = { email, password: encryptedPassword };
      // Get the users collection from the db
      const users = dbClient.db.collection('users');
      // Insert the new user into the users collection
      await users.insertOne(newUser);
      // Get the id of the new user
      const { _id } = newUser;
      // Send success response
      response.status(201);
      response.send({ id: _id, email });
    }
  }

  // Get user by token
  static async getMe(request, response) {
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
    // Get the users collection from the db
    const users = dbClient.db.collection('users');
    // Get the user with the value as id
    const user = await users.findOne({ _id: new ObjectId(value) });
    // Send success response
    response.status(200);
    response.send({ id: user._id, email: user.email });
  }
}

// Export the class
export default UsersController;
