import test from 'ava';
import {
  mixin,
  Action,
  Model,
  Errors,
  Request,
  MockRequest,
  MockResponse } from 'denali';
import MemoryAdapter from 'denali/app/orm-adapters/memory';
import { authenticate, sessionable } from 'denali-auth';
import Session from 'denali-auth/app/models/session';
import setupBasicContainer from '../helpers/setup-basic-container';


test('allows requests with valid session tokens', async (t) => {
  t.plan(3);
  let container = setupBasicContainer({
    'model:user': class User extends mixin(Model, sessionable()) {}
  });
  class TestAction extends mixin(Action, authenticate()) {
    respond() {
      t.pass();
      return {};
    }
  }
  class MockSession extends Session {
    static container = container;
    static get adapter() {
      return MemoryAdapter;
    }
    static find({ token }) {
      t.pass();
      let session = new MockSession({ token, user: true });
      return [ session ];
    }
    async save() {
      t.pass();
    }
  }
  container.register('model:session', MockSession);
  let action = new TestAction({
    container,
    request: new Request(new MockRequest({
      headers: {
        Authorization: 'TOKEN foo'
      }
    })),
    response: new MockResponse()
  });

  await action.run();
});

test('does not authenticate requests with invalid auth header', async (t) => {
  let container = setupBasicContainer({
    'model:user': class User extends mixin(Model, sessionable()) {},
    'model:session': Session
  });
  class TestAction extends mixin(Action, authenticate()) {
    respond() {
      t.fail();
    }
  }
  let action = new TestAction({
    container,
    request: new Request(new MockRequest({
      headers: {
        Authorization: 'TOKEN'
      }
    })),
    response: new MockResponse()
  });

  let result = action.run();
  t.throws(result, Errors.Unauthorized);
  t.throws(result, /Missing credentials/);
});
