import test from 'ava';
import { AppAcceptanceTest } from 'denali';


test('allows users to register', async (t) => {
  let app = new AppAcceptanceTest();
  let newUser = {
    data: {
      type: 'user',
      attributes: {
        email: 'dave@example.com',
        password: '123'
      }
    }
  };
  let { status, body } = await app.post('/users/auth/register', newUser);
  t.is(status, 201);
  t.is(body.data.attributes.email, 'dave@example.com');
  t.falsey(body.data.attributes.password);
});

test('should reject registration payloads without an email', async (t) => {
  let app = new AppAcceptanceTest();
  let newUser = {
    data: {
      type: 'user',
      attributes: {
        password: '123'
      }
    }
  };
  let { status } = await app.post('/users/auth/register', newUser);
  t.is(status, 422);
});

test('should reject registration payloads without a password', async (t) => {
  let app = new AppAcceptanceTest();
  let newUser = {
    data: {
      type: 'user',
      attributes: {
        email: 'dave@example.com'
      }
    }
  };
  let { status } = await app.post('/users/auth/register', newUser);
  t.is(status, 422);
});
