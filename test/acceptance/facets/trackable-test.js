import test from 'ava';
import { AppAcceptanceTest } from 'denali';


test('tracks last login data', async (t) => {
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

  let db = app.lookup('orm-adapter:memory')._cache;
  t.truthy(db.users[1].lastLoginAt);
  t.truthy(db.users[1].lastIp);
  t.is(db.users[1].loginCount, 1);
});

test('tracks last seen time', async (t) => {
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
  let { body } = await app.post('/users/auth/sessions', loginCredentials);
  app.setHeader('Authorization', `TOKEN ${ body.token }`);
  await app.get('/');

  let db = app.lookup('orm-adapter:memory')._cache;
  t.truthy(db.users[1].lastSeen);
});
