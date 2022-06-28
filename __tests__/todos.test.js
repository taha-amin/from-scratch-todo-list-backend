const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const ToDo = require('../lib/models/ToDo');
const User = require('../lib/models/User');

const mockUser = {
  email: 'benny@example.com',
  password: '123456',
};

const mockUser2 = {
  email: 'julie@example.com',
  password: '123456',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  const user = await UserService.create({ ...mockUser, ...userProps });

  // ...then sign in
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('users', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('GET /api/v1/todos/ lists all todos for the authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const user2 = await UserService.create(mockUser2);
    const user1Todo = await ToDo.insert({
      id: '1',
      task: 'go to gym',
      completed: 'true',
      user_id: user.id,
    });
    await ToDo.insert({
      id: '2',
      task: 'finish hw',
      completed: 'true',
      user_id: user2.id,
    });
    const resp = await agent.get('/api/v1/todos');
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual([user1Todo]);
  });

  it('POST /api/v1/todos/ creates a new todo for the authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const resp = await agent
      .post('/api/v1/todos')
      .send({ task: 'finish assignment', completed: 'true' });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      user_id: user.id,
      task: 'finish assignment',
      completed: 'true',
    });
  });

  afterAll(() => {
    pool.end();
  });
});
