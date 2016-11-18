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
  t.is(body.email, 'dave@example.com');
  t.falsy(body.password);
});
