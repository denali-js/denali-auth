import test from 'ava';
import {
  createMixin,
  mixin,
  Errors,
  Action,
  Request,
  MockRequest,
  MockResponse,
  Container } from 'denali';
import { authenticate } from 'denali-auth';


test('401s when no credentials are provided for a protected action', async (t) => {
  class TestAction extends mixin(Action, authenticate()) {
    respond() {}
  }
  let container = new Container();
  container.register('model:user', {
    authenticateRequest() {
      return null;
    }
  });
  let action = new TestAction({
    container,
    request: new Request(new MockRequest()),
    response: new MockResponse()
  });

  let result = action.run();
  t.throws(result, /Missing credentials/);
  t.throws(result, Errors.Unauthorized);
});

test('returns errors from strategies that throw/reject', async (t) => {
  class TestAction extends mixin(Action, authenticate()) {
    respond() {}
  }
  let container = new Container();
  container.register('model:user', {
    authenticateRequest() {
      throw new Errors.BadRequest('Improperly formatted foo param');
    }
  });
  let action = new TestAction({
    container,
    request: new Request(new MockRequest()),
    response: new MockResponse()
  });

  let result = action.run();
  t.throws(result, /Improperly formatted foo param/);
  t.throws(result, Errors.BadRequest);
});

test('tries strategies according to mixin order', async (t) => {
  let sequence = [];
  class TestAction extends mixin(Action, authenticate()) {
    respond() {}
  }
  class Model {}
  let one = createMixin((Base) => {
    return class extends Base {
      static authenticateRequest() {
        sequence.push(1);
        return null;
      }
    };
  });
  let two = createMixin((Base) => {
    return class extends Base {
      static authenticateRequest() {
        sequence.push(2);
        return {};
      }
    };
  });
  class User extends mixin(Model, one(), two()) {}
  let container = new Container();
  container.register('model:user', User);
  let action = new TestAction({
    container,
    request: new Request(new MockRequest()),
    response: new MockResponse()
  });

  await action.run();
  t.deepEqual(sequence, [ 1, 2 ]);
});

test('a successful strategy skips subsequent strategies', async (t) => {
  t.plan(1);
  class TestAction extends mixin(Action, authenticate()) {
    respond() {}
  }
  class Model {}
  let one = createMixin((Base) => {
    return class extends Base {
      static authenticateRequest() {
        t.pass();
        return {};
      }
    };
  });
  let two = createMixin((Base) => {
    return class extends Base {
      static authenticateRequest() {
        t.fail();
      }
    };
  });
  class User extends mixin(Model, one(), two()) {}
  let container = new Container();
  container.register('model:user', User);
  let action = new TestAction({
    container,
    request: new Request(new MockRequest()),
    response: new MockResponse()
  });

  await action.run();
});
