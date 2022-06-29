const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const ToDo = require('../lib/models/ToDo');

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
      .send({ task: 'finish assignment', completed: true });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      user_id: user.id,
      task: 'finish assignment',
      completed: true,
    });
  });

  it('PUT /api/v1/todos/:id updates a todo if associated with authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = await ToDo.insert({
      task: 'grab apples',
      user_id: user.id,
      completed: false,
    });
    const resp = await agent
      .put(`/api/v1/todos/${todo.id}`)
      .send({ completed: true });
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual({ ...todo, completed: true });
  });

  it('DELETE /api/v1/todos/:id deletes a todo if associated with authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = await ToDo.insert({
      task: 'clean desk',
      user_id: user.id,
      completed: true,
    });
    const resp = await agent.delete(`api/v1/todos/${todo.id}`);
    expect(resp.status).toBe(200);

    const check = await ToDo.getById(todo.id);
    expect(check).toBeNull();
  });

  afterAll(() => {
    pool.end();
  });
});
