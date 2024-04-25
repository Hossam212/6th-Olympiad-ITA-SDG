const app = require('../server'); // Import the Express app object
const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from config file
dotenv.config({ path: '../config.env' });

let isConnected = false;

beforeAll(async () => {
  // Check if DATABASE environment variable is set
  if (!process.env.DATABASE) {
    console.error('DATABASE environment variable is not set.');
    process.exit(1); // Exit the process with an error code
  }

  // Establish the database connection only if it doesn't exist
  if (!isConnected) {
    const DB = process.env.DATABASE.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    );
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true; // Set the flag to true after the connection is established
  }
});

afterAll(async () => {
  // Close the database connection
  await mongoose.disconnect();
});

describe('Login Endpoint', () => {
  test('Login with correct credentials should return a token and status 200', async () => {
    const response = await request(app).post('/api/v1/users/login').send({
      email: 'doej@example.com',
      password: 'test1234',
    });

    expect(response.status).toBe(200);
  });

  test('Login with incorrect password should return status 401', async () => {
    const response = await request(app).post('/api/v1/users/login').send({
      email: 'doej@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
  });

  test('Login without email or password should return status 400', async () => {
    const response = await request(app).post('/api/v1/users/login').send({});

    expect(response.status).toBe(400);
  });
});
