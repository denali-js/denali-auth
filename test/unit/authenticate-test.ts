import test from 'ava';
import {
  createMixin,
  mixin,
  Errors,
  Action,
  Request,
  MockRequest,
  MockResponse,
  Model,
  Container } from 'denali';
import { authenticate, authenticatable } from 'denali-auth';

test.beforeEach((t) => {
  t.context.TestAction = class TestAction extends mixin(Action, authenticate()) {
    logger = {
      error() {
        console.log(...arguments); // eslint-disable-line no-console
      }
    };
    respond() {}
  };
  t.context.User = class User extends mixin(Model, authenticatable()) {};
  t.context.container = new Container();
  t.context.container.register('model:user', t.context.User);
  t.context.action = new t.context.TestAction({
    container: t.context.container,
    request: new Request(new MockRequest()),
    response: new MockResponse()
  });
});

test('401s when no credentials are provided for a protected action', async (t) => {
  let { container, User, action } = t.context;
  container.register('model:user', class FailingUser extends User {
    static async authenticateRequest() {
      throw new Errors.Unauthorized('Foobar');
    }
  });

  try {
    await action.run();
    t.fail();
  } catch (error) {
    t.regex(error.message, /Foobar/);
    t.true(error instanceof Errors.Unauthorized);
  }
});

test('tries strategies according to mixin order', async (t) => {
  let { container, User, action } = t.context;
  let sequence = [];
  let one = createMixin((Base) => {
    return class One extends Base {
      static async authenticateRequest() {
        sequence.push(2);
        return {};
      }
    };
  });
  let two = createMixin((Base) => {
    return class Two extends Base {
      static async authenticateRequest() {
        sequence.push(1);
        throw new Error();
      }
    };
  });
  container.register('model:user', class extends mixin(User, one(), two()) {});

  await action.run();
  t.deepEqual(sequence, [ 1, 2 ]);
});

test('a successful strategy skips remaining strategies', async (t) => {
  let { container, User, action } = t.context;
  t.plan(1);
  let one = createMixin((Base) => {
    return class One extends Base {
      static async authenticateRequest() {
        t.fail();
      }
    };
  });
  let two = createMixin((Base) => {
    return class Two extends Base {
      static async authenticateRequest() {
        t.pass();
        return {};
      }
    };
  });
  container.register('model:user', class extends mixin(User, one(), two()) {});

  await action.run();
});
