const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../app');
const User = require('../models/User');
const Document = require('../models/Document');

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-google-docs-test';

beforeAll(async () => {
  // Disconnect any existing connections first
  await mongoose.disconnect();
  await mongoose.connect(TEST_MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear collections
  await User.deleteMany({});
  await Document.deleteMany({});
});

describe('Document Sharing API Tests', () => {
  it('should create a document and share it with another user, verifying permissions and updates', async () => {
    // 1. Create two test users (equivalent to User 1 and User 2)
    const user1 = new User({
      email: 'user1@example.com',
      password: 'password123',
      name: 'User One',
    });
    const user2 = new User({
      email: 'user2@example.com',
      password: 'password123',
      name: 'User Two',
    });
    await user1.save();
    await user2.save();

    // 2. Login User 1
    const loginRes1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@example.com', password: 'password123' });

    expect(loginRes1.statusCode).toBe(200);
    expect(loginRes1.body).toHaveProperty('token');
    const token1 = loginRes1.body.token;

    // 3. Login User 2
    const loginRes2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user2@example.com', password: 'password123' });

    expect(loginRes2.statusCode).toBe(200);
    expect(loginRes2.body).toHaveProperty('token');
    const token2 = loginRes2.body.token;
    const user2Id = loginRes2.body.user.id;

    // 4. User 1 creates a new document
    const createRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'Shared Test Doc', content: '<p>Testing rich text</p>' });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty('_id');
    expect(createRes.body.title).toBe('Shared Test Doc');
    expect(createRes.body.sharedWith).toHaveLength(0);
    const docId = createRes.body._id;

    // 5. User 1 shares the document with User 2
    const shareRes = await request(app)
      .post(`/api/documents/${docId}/share`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ email: 'user2@example.com' });

    expect(shareRes.statusCode).toBe(200);
    expect(shareRes.body).toHaveProperty('sharedWith');
    expect(shareRes.body.sharedWith).toHaveLength(1);
    expect(shareRes.body.sharedWith[0]._id.toString()).toBe(user2Id.toString());

    // 6. User 1 attempts to share the document with User 2 again (duplicate share prevention)
    const duplicateShareRes = await request(app)
      .post(`/api/documents/${docId}/share`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ email: 'user2@example.com' });

    expect(duplicateShareRes.statusCode).toBe(400);
    expect(duplicateShareRes.body.message).toBe('Document already shared with this user');

    // 7. Verify User 2 can now fetch the document
    const getDocRes = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(getDocRes.statusCode).toBe(200);
    expect(getDocRes.body.title).toBe('Shared Test Doc');

    // 8. Verify a 3rd random user cannot access the document
    const user3 = new User({
      email: 'user3@example.com',
      password: 'password123',
    });
    await user3.save();

    const loginRes3 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user3@example.com', password: 'password123' });
    const token3 = loginRes3.body.token;

    const unauthorizedGetRes = await request(app)
      .get(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${token3}`);

    expect(unauthorizedGetRes.statusCode).toBe(403);
    expect(unauthorizedGetRes.body.message).toBe('Not authorized to access this document');
  });
});
