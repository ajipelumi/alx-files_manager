import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Create AppController class that will handle requests to the routes
class AppController {
  // GET status of redis and db
  static getStatus(request, response) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    response.status(200);
    response.send(JSON.stringify(status));
  }

  // GET stats of users and files in db
  static async getStats(request, response) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    const stats = {
      users: usersCount,
      files: filesCount,
    };
    response.status(200);
    response.send(JSON.stringify(stats));
  }
}

// Export the class
export default AppController;
