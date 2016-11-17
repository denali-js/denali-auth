import test from 'ava';
import { AppAcceptanceTest } from 'denali';
import { sentMailsFor } from 'denali-mailer';

const IS_UUID = /[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/i;

test('sends an invite to users', async (t) => {
  let app = new AppAcceptanceTest();
  let loginCredentials = {
    email: 'dave@example.com',
    password: '123',
    invitation: 'foo'
  };
  let db = app.lookup('orm-adapter:memory')._cache;
  let invitations = db.invitation = {};
  invitations[100] = { token: 'foo', userType: 'user', fromType: 'user', fromId: -1 };
  await app.post('/invitable-users/auth/register', {
    data: {
      type: 'user',
      attributes: loginCredentials
    }
  });
  let { body } = await app.post('/invitable-users/auth/login', loginCredentials);
  app.setHeader('Authorization', `TOKEN ${ body.token }`);

  let { status } = await app.post('/invitable-users/auth/send-invitation', {
    email: 'foo@bar.com'
  });
  t.is(status, 200);
  t.is(sentMailsFor(app)[0].envelope.to[0], 'foo@bar.com');
  t.is(sentMailsFor(app)[0].subject, "You're invited!");
  t.regex(sentMailsFor(app)[0].textContent(), IS_UUID);
});
