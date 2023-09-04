import crypto from 'crypto';
import dbClient from '../utils/db';

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
}

// Export the class
export default UsersController;
