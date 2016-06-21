import { createMixin, eachPrototype, Errors } from 'denali';
import Promise from 'bluebird';
import uniq from 'lodash/uniq';

let strategyCacheKey = Symbol('authenticate-mixin-strategies');

export default createMixin((MixinBase, modelType = 'user') =>
  class AuthenticateMixin extends MixinBase {

    static before = [ 'authenticate' ];

    authenticate(params) {
      if (this.protected !== false) {
        let User = this.modelFor(modelType);
        let strategies = discoverAuthStrategies(this, User);

        if (strategies.length !== 0) {
          return Promise.map(strategies, (strategy) => {
            return Promise.try(() => strategy.call(User, this, params))
              .then((user) => {
                // If the strategy resolves, it found the user and was
                // successful. So we return a rejected promise that rejects
                // with the user data. This trips the parent `.each()` and
                // skips the remaining auth strategies.
                return Promise.reject(user);
              }, (e) => {
                // If the strategy rejects, then it wasn't successful, so we
                // swallow the rejection here so the parent `.each()` will
                // continue on to the next strategy
              });
            // We have to use catch here for the success case because we need
            // to leverage `.each()`'s halting behavior on rejected promises.
            }, { concurrency: 1 }).then(() => {
              // If we made it through all the strategies and none rejeced,
              // that means none were successful, so throw our 401 here
              throw new Errors.Unauthorized('Invalid credentials');
            }, (currentUser) => {
              // If one of the strategies rejected, it means it worked, so store
              // the current user info on the action and continue on.
              this.currentUser = currentUser;
            });
        }
      }
    }

  }
);

function discoverAuthStrategies(action, User) {
  if (!action.constructor[strategyCacheKey]) {
    let strategies = [];
    eachPrototype(User, (mixin) => {
      if (mixin.authenticateRequest) {
        strategies.push(mixin.authenticateRequest);
      }
    });
    action.constructor[strategyCacheKey] = uniq(strategies);
  }
  return action.constructor[strategyCacheKey];
}
