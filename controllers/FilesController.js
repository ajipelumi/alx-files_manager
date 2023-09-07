import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import fs, { writeFile as writeFileCallback } from 'fs';
import { promisify } from 'util';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Create FilesController class that will handle requests to the routes
class FilesController {
  // Create new file in db
  static async postUpload(request, response) {
    // Get the authorization token
    const token = request.header('X-Token');
    // Check if authorization token is missing
    if (!token) {
      // Send error response
      return response.status(401).send({ error: 'Unauthorized' });
    }
    // Get the key for the token in Redis
    const key = `auth_${token}`;
    // Get the value of the key in Redis which is the user id
    const userId = await redisClient.get(key);
    // Check if the user id exists
    if (!userId) {
      // Send error response
      return response.status(401).send({ error: 'Unauthorized' });
    }
    // Get the file name from the request
    const { name } = request.body;
    // Check if file name is missing
    if (!name) {
      // Send error response
      return response.status(400).send({ error: 'Missing name' });
    }
    // Get the type from the request
    const { type } = request.body;
    // Check if type is missing
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      // Send error response
      return response.status(400).send({ error: 'Missing type' });
    }
    // Get the data from the request
    const { data } = request.body;
    // Check if type is file or image
    if (type === 'file' || type === 'image') {
      // Check if data is missing as it is required for file and image
      if (!data) {
        // Send error response
        return response.status(400).send({ error: 'Missing data' });
      }
    }
    // Get the parentId from the request which is optional
    const parentId = request.body.parentId || 0;
    // Get the isPublic from the request which is optional
    const isPublic = request.body.isPublic || false;
    // Check if parentId is not 0
    if (parentId !== 0) {
      // Get the files collection from the db
      const files = dbClient.db.collection('files');
      // Get the parent file
      const parentFile = await files.findOne({ _id: new ObjectId(parentId) });
      // Check if parent file exists
      if (!parentFile) {
        // Send error response
        return response.status(400).send({ error: 'Parent not found' });
      }
      // Check if parent file is not a folder
      if (parentFile.type !== 'folder') {
        // Send error response
        return response.status(400).send({ error: 'Parent is not a folder' });
      }
    }
    // Check if type is folder
    if (type === 'folder') {
      // Create new folder object
      const newFolder = {
        userId,
        name,
        type,
        isPublic,
        parentId,
      };
      // Get the files collection from the db
      const files = dbClient.db.collection('files');
      // Insert the new folder into the files collection
      await files.insertOne(newFolder);
      // Get the id of the new folder
      const { _id } = newFolder;
      // Send success response
      return response.status(201).send({
        id: _id,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    }
    // Get the folder path from environment variable
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    // Check if folder path does not exist
    if (!fs.existsSync(folderPath)) {
      // Create the folder path
      fs.mkdirSync(folderPath, { recursive: true });
    }
    // Create a local path in the folder path with the filename a UUID
    const localPath = `${folderPath}/${uuidv4()}`;
    // Create a buffer from the data
    const buffer = Buffer.from(data, 'base64');
    // Promisify the writeFileCallback function
    const writeFile = promisify(writeFileCallback);
    // Write the buffer to the local path
    await writeFile(localPath, buffer);
    // Create new file object
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    };
    // Get the files collection from the db
    const files = dbClient.db.collection('files');
    // Insert the new file into the files collection
    await files.insertOne(newFile);
    // Get the id of the new file
    const { _id } = newFile;
    // Send success response
    return response.status(201).send({
      id: _id,
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }

  // Get file from db
  static async getShow(request, response) {
    // Get the authorization token
    const token = request.header('X-Token');
    // Check if authorization token is missing
    if (!token) {
      // Send error response
      return response.status(401).send({ error: 'Unauthorized' });
    }
    // Get the key for the token in Redis
    const key = `auth_${token}`;
    // Get the value of the key in Redis which is the user id
    const userId = await redisClient.get(key);
    // Check if the user id exists
    if (!userId) {
      // Send error response
      return response.status(401).send({ error: 'Unauthorized' });
    }
    // Get the file id from the request
    const { id } = request.params;
    // Get the files collection from the db
    const files = dbClient.db.collection('files');
    // Get the file
    const file = await files.findOne({ _id: new ObjectId(id), userId });
    // Check if file exists
    if (!file) {
      // Send error response
      return response.status(404).send({ error: 'Not found' });
    }
    // Send success response
    return response.status(200).send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  // Get files from db
  static async getIndex(request, response) {
    // Get the authorization token
    const token = request.header('X-Token');
    // Check if authorization token is missing
    if (!token) {
      // Send error response
      return response.status(401).send({ error: 'Unauthorized' });
    }
    // Get the key for the token in Redis
    const key = `auth_${token}`;
    // Get the value of the key in Redis which is the user id
    const userId = await redisClient.get(key);
    // Check if the user id exists
    if (!userId) {
      // Send error response
      return response.status(401).send({ error: 'Unauthorized' });
    }
    // Get the parentId from the request, defaulting to 0
    const parentId = request.query.parentId || 0;
    // Get the page number from the request, defaulting to 0
    const page = Number(request.query.page) || 0;
    // Define the limit of files per page
    const limit = 20;
    // Calculate the skip value
    const skip = page * limit;
    // Get the files collection from the db
    const files = dbClient.db.collection('files');
    // If parentId is 0, get all files with userId
    if (parentId === 0) {
      // Get all files with userId and skip and limit
      const allFiles = await files.find({ userId }).skip(skip).limit(limit).toArray();
      // Send success response
      return response.status(200).send(allFiles.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      })));
    }
    // Get all files with userId and parentId and skip and limit
    const allFiles = await files.find({ userId, parentId }).skip(skip).limit(limit).toArray();
    // Send success response
    return response.status(200).send(allFiles.map((file) => ({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    })));
  }
}

// Export the class
export default FilesController;
