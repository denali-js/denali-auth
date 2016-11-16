import test from 'ava';
import { AppAcceptanceTest } from 'denali';
import { sentMailsFor } from 'denali-mailer';

const IS_UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

test('sends a password reset email', async (t) => {
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
  await app.post('/users/auth/send-reset-password', {
    email: loginCredentials.email
  });

  t.is(sentMailsFor(app)[0].envelope.to, 'dave@example.com');
  t.is(sentMailsFor(app)[0].subject, 'Reset your password');
  t.regex(sentMailsFor(app)[0].textContent(), IS_UUID);
});

test('resets passwords with valid reset token', async (t) => {
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
  await app.post('/users/auth/send-reset-password', {
    email: loginCredentials.email
  });
  let token = sentMailsFor(app)[0].textContent().match(IS_UUID)[0];

  let { status } = await app.post('/users/auth/reset-password', { token, password: '456' });
  t.is(status, 200);
});

test('fails to reset passwords with invalid token', async (t) => {
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
  await app.post('/users/auth/send-reset-password', {
    email: loginCredentials.email
  });

  let { status } = await app.post('/users/auth/reset-password', { token: 'wrong', password: '456' });
  t.is(status, 422);
});

test('fails to reset passwords without a new password', async (t) => {
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
  await app.post('/users/auth/send-reset-password', {
    email: loginCredentials.email
  });
  let token = sentMailsFor(app)[0].textContent().match(IS_UUID)[0];

  let { status } = await app.post('/users/auth/reset-password', { token });
  t.is(status, 422);
});
