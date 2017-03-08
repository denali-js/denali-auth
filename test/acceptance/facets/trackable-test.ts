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
  await app.post('/users/auth/login', loginCredentials);

  let db = app.lookup('orm-adapter:memory')._cache;
  t.truthy(db.user[1].lastLoginAt);
  t.truthy(db.user[1].lastIp);
  t.is(db.user[1].loginCount, 1);
});

test.failing('tracks last seen time', async (t) => {
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
  app.setHeader('Authorization', `TOKEN ${ body.token }`);
  await app.get('/');

  let db = app.lookup('orm-adapter:memory')._cache;
  t.truthy(db.user[1].lastSeen);
});
