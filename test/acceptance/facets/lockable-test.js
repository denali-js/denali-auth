import test from 'ava';
import { AppAcceptanceTest } from 'denali';
import { all } from 'bluebird';
import times from 'lodash/times';

test('locks out login attempts for short period after several failed attempts', async (t) => {
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

  let results = await all(times(10, async () => {
    let { status } = await app.post('/users/auth/login', {
      email: loginCredentials.email,
      password: 'wrong'
    });
    return status;
  }));
  console.log(results);
  t.truthy(results.find((status) => status === 429));
});
