import mongodb from 'mongodb';

// Create a MongoDB class
class DBClient {
  // Create a constructor
  constructor() {
    // Get the host from the environment variable
    const host = process.env.DB_HOST || 'localhost';
    // Get the port from the environment variable
    const port = process.env.DB_PORT || 27017;
    // Get the database from the environment variable
    const database = process.env.DB_DATABASE || 'files_manager';
    // Get the URL
    const url = `mongodb://${host}:${port}`;
    // Create a new MongoClient
    this.client = new mongodb.MongoClient(url, { useUnifiedTopology: true });
    // Connect to the database
    this.client.connect()
      .then(() => {
        // Get the database
        this.db = this.client.db(database);
      })
      .catch((err) => {
        // Log the error
        console.log(err.message);
      });
  }

  // Function to check if the connection is a success
  isAlive() {
    // Check if the connection is a success
    return this.client.isConnected();
  }

  // Function to get the number of documents in users collection
  async nbUsers() {
    // Get the users collection
    const users = this.db.collection('users');
    // Return the number of users
    return users.countDocuments();
  }

  // Function to get the number of documents in files collection
  async nbFiles() {
    // Get the files collection
    const files = this.db.collection('files');
    // Return the number of files
    return files.countDocuments();
  }
}

// Create an instance of DBClient
const dbClient = new DBClient();

// Export DBClient
export default dbClient;
