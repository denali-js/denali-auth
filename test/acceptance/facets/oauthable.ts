import test from 'ava';
import nock from 'nock';
import querystring from 'querystring';
import { AppAcceptanceTest } from 'denali';

test('checks access tokens against third party API', async (t) => {
  /* eslint-disable camelcase */
  let app = new AppAcceptanceTest();
  nock('https://graph.facebook.com')
    .post('/oauth/access_token')
    .reply(200, querystring.stringify({
      access_token: 'foo',
      refresh_token: 'bar'
    }));
  nock('https://graph.facebook.com/')
    .get('/v2.5/me')
    .query({ access_token: 'foo' })
    .reply(200, {
      id: '123'
    });

  let login = await app.post('/users/auth/oauth/facebook?code=abc123');
  t.is(login.status, 201);
  app.setHeader('Authorization', `TOKEN ${ login.body.token }`);

  let me = await app.get('/users/auth/me');
  t.is(me.status, 200);
  t.is(me.body.facebookId, '123');
  /* eslint-enable camelcase */
});
