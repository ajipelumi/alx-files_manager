import redis from 'redis';
import { promisify } from 'util';

// Create Redis Client Class
class RedisClient {
  // Constructor to create a Redis Client
  constructor() {
    // Set connection as true
    this.connect = true;
    // Create a Redis Client and listen for errors
    this.client = redis.createClient().on('error', (err) => {
      // Set connection as false
      this.connect = false;
      // Log the error
      console.log(`Error ${err}`);
    });
  }

  // Function to check if connection is a success
  isAlive() {
    // Return the connection status
    return this.connect;
  }

  // Function to get a key
  async get(key) {
    // Promisify the get function
    const getAsync = promisify(this.client.get).bind(this.client);
    // Get the value of the key
    const value = await getAsync(key);
    // Return the value
    return value;
  }

  // Function to set a key
  async set(key, value, duration) {
    // Promisify the set function
    const setAsync = promisify(this.client.set).bind(this.client);
    // Set the value of the key
    await setAsync(key, value);
    // Set the expiration of the key
    this.client.expire(key, duration);
  }

  // Function to delete a key
  async del(key) {
    // Promisify the del function
    const delAsync = promisify(this.client.del).bind(this.client);
    // Delete the key
    await delAsync(key);
  }
}

// Create an instance of Redis Client
const redisclient = new RedisClient();

// Export Redis Client
export default redisclient;
