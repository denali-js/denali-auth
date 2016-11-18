import test from 'ava';
import { AppAcceptanceTest } from 'denali';


test('allows users to create a session', async (t) => {
  let app = new AppAcceptanceTest();
  let loginCredentials = {
    email: 'dave@example.com',
    password: '123'
  };
  await app.post('/users/auth/register', {
    data: {
      type: 'user',
      attributes: loginCredentials
    }
  });

  let { status, body } = await app.post('/users/auth/login', loginCredentials);
  t.is(status, 201);
  t.truthy(body.token);
  t.falsy(body.password);
});

test('allows users to delete a session (logout)', async (t) => {
  let app = new AppAcceptanceTest();
  let loginCredentials = {
    email: 'dave@example.com',
    password: '123'
  };
  await app.post('/users/auth/register', {
    data: {
      type: 'user',
      attributes: loginCredentials
    }
  });
  let { body } = await app.post('/users/auth/login', loginCredentials);

  let { status } = await app.delete('/users/auth/logout', {
    headers: {
      Authorization: `TOKEN ${ body.token }`
    }
  });
  t.is(status, 204);
});

test('allows requests with valid session tokens', async (t) => {
  let app = new AppAcceptanceTest();
  let loginCredentials = {
    email: 'dave@example.com',
    password: '123'
  };
  await app.post('/users/auth/register', {
    data: {
      type: 'user',
      attributes: loginCredentials
    }
  });
  let { body } = await app.post('/users/auth/login', loginCredentials);
  t.truthy(body.token);
  app.setHeader('Authorization', `TOKEN ${ body.token }`);

  let { status } = await app.get('/');
  t.is(status, 200);
});

test('does not authenticate requests with invalid auth header', async (t) => {
  let app = new AppAcceptanceTest();
  let loginCredentials = {
    email: 'dave@example.com',
    password: '123'
  };
  await app.post('/users/auth/register', {
    data: {
      type: 'user',
      attributes: loginCredentials
    }
  });
  await app.post('/users/auth/login', loginCredentials);
  app.setHeader('Authorization', 'TOKEN foo');

  let { status } = await app.get('/');
  t.is(status, 401);
});
