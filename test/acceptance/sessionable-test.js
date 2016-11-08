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

  let { status, body } = await app.post('/users/auth/sessions', loginCredentials);
  t.is(status, 201);
  t.truthy(body.token);
  t.falsey(body.password);
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
  await app.post('/users/auth/sessions', loginCredentials);

  let { status } = await this.app.delete('/users/auth/sessions');
  t.is(status, 204);
});

test.todo('fails if not logged in');
