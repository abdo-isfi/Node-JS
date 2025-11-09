require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server'); // Your Express app
const User = require('../src/models/user.model');
const Todo = require('../src/models/todo.model');

let token;
let userId;

beforeAll(async () => {
  // Connect to MongoDB for tests
  await mongoose.connect(process.env.MONGODB_URI);

  // Register a test user
  await User.deleteMany({});
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
    });
  expect(res.statusCode).toEqual(201);

  // Log in the test user to get a token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123',
    });
  expect(loginRes.statusCode).toEqual(200);
  token = loginRes.body.token;

  const user = await User.findOne({ email: 'test@example.com' });
  userId = user._id;
});

afterEach(async () => {
  await Todo.deleteMany({ user: userId });
});

afterAll(async () => {
  await User.deleteMany({}); // Clean up test user
  await mongoose.connection.close();
});

describe('Todo API', () => {
  it('should create a new todo for an authenticated user', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Todo',
        priority: 'medium',
        dueDate: '2025-12-31',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Todo');
    expect(res.body).toHaveProperty('completed', false);
    expect(res.body).toHaveProperty('user', userId.toString());
  });

  it('should not create a todo with a duplicate title for the same user', async () => {
    await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Duplicate Todo',
        priority: 'low',
        dueDate: '2025-12-30',
      });

    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Duplicate Todo',
        priority: 'high',
        dueDate: '2025-12-29',
      });
    expect(res.statusCode).toEqual(400); // Expect 400 Bad Request for duplicate title
    expect(res.body).toHaveProperty('message', 'You already have a todo with this title.');
  });

  it('should not create a todo for an unauthenticated user', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        title: 'Unauthorized Todo',
        priority: 'medium',
        dueDate: '2025-12-31',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Please authenticate.');
  });

  it('should not create a todo with invalid data', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        priority: 'invalid',
        dueDate: 'invalid-date',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message'); // Expect a validation error message
  });
});
