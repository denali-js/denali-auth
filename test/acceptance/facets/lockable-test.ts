import test from 'ava';
import { AppAcceptanceTest } from 'denali';
import { resolve } from 'bluebird';
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
  let results = await resolve(times(10)).map(async () => {
    let { status } = await app.post('/users/auth/login', {
      email: loginCredentials.email,
      password: 'wrong'
    });
    return status;
  }, { concurrency: 1 });
  t.truthy(results.find((status) => status === 429));
});
