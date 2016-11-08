import { createMixin, eachPrototype, Errors } from 'denali';
import Promise from 'bluebird';
import uniq from 'lodash/uniq';

const STRATEGIES_CACHE_KEY = Symbol('authenticate-mixin-strategies');

export default createMixin((MixinBase, modelType = 'user') =>
  class AuthenticateMixin extends MixinBase {

    static before = [ 'authenticate' ];

    async authenticate(params) {
      let User = this.modelFor(modelType);
      let strategies = discoverAuthStrategies(this, User);

      if (strategies.length !== 0) {
        this.currentUser = await Promise.reduce(strategies, async (user, strategy) => {
          return user || Promise.try(() => strategy.call(User, this, params));
        }, null);

        if (!this.currentUser && this.protected !== false) {
          throw new Errors.Unauthorized('Invalid credentials');
        }
      }
    }

  }
);

function discoverAuthStrategies(action, User) {
  if (!action.constructor[STRATEGIES_CACHE_KEY]) {
    let strategies = [];
    eachPrototype(User, (mixin) => {
      if (mixin.authenticateRequest) {
        strategies.push(mixin.authenticateRequest);
      }
    });
    action.constructor[STRATEGIES_CACHE_KEY] = uniq(strategies);
  }
  return action.constructor[STRATEGIES_CACHE_KEY];
}
