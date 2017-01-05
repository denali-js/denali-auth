import { createMixin, Errors as createError, Response } from 'denali';

export default createMixin((MixinBase, options = {}) => {
  let Strategy;
  if (typeof options.strategy === 'string') {
    Strategy = require(`passport-${ options.strategy }`);
    Strategy = Strategy.default || Strategy;
  } else {
    Strategy = options.strategy;
  }

  let strategy = new Strategy(options);

  return class PassportableMixin extends MixinBase {

    static strategyName = 'passport';

    static authenticateRequest(action, invocationOptions) {
      return new Promise((resolve, reject) => {
        let reqStrategy = Object.create(strategy);
        reqStrategy.fail = function fail(challenge, status = 401) {
          reject(createError(status, challenge));
        };
        reqStrategy.success = function success(user, info) {
          resolve({ user, info });
        };
        reqStrategy.redirect = function redirect(url, status = 302) {
          resolve(new Response(status, { headers: { Location: url } }));
        };
        reqStrategy.error = function error(err) {
          reject(err);
        };
        reqStrategy.authenticate(action.request, invocationOptions);
      });
    }

  };
});
