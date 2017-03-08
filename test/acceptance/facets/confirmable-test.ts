import test from 'ava';
import { AppAcceptanceTest } from 'denali';
import { sentMailsFor } from 'denali-mailer';
import moment from 'moment';
import MockDate from 'mockdate';

const IS_UUID = /[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/i;

test('sends a confirmation email to new users', async (t) => {
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

  t.is(sentMailsFor(app)[0].envelope.to[0], 'dave@example.com');
  t.is(sentMailsFor(app)[0].subject, 'Confirm your email');
  t.regex(sentMailsFor(app)[0].textContent(), IS_UUID);
});

test('confirms emails with valid token', async (t) => {
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
  let token = sentMailsFor(app)[0].textContent().match(IS_UUID)[0];

  let { status } = await app.post('/users/auth/confirm-email', { token });
  t.is(status, 204);
});

test('fails to confirm emails with invalid token', async (t) => {
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

  let { status } = await app.post('/users/auth/confirm-email', { token: 'foo' });
  t.is(status, 422);
});

test('locks out users who have not confirmed after N days if `lockoutAfter` is true', async (t) => {
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
  MockDate.set(moment().add(1, 'year').toDate());

  let { status } = await app.post('/users/auth/login', loginCredentials);
  t.is(status, 403);
  MockDate.reset();
});
