import { createMixin, Errors as createError, Response, Model, Action } from 'denali';

export default createMixin((BaseModel: typeof Model, options = {}) => {
  let Strategy;
  if (typeof options.strategy === 'string') {
    Strategy = require(`passport-${ options.strategy }`);
    Strategy = Strategy.default || Strategy;
  } else {
    Strategy = options.strategy;
  }

  let strategy = new Strategy(options);

  return class PassportableMixin extends BaseModel {

    static strategyName = 'passport';

    static authenticateRequest(action: Action, invocationOptions: any) {
      return new Promise((resolve, reject) => {
        let reqStrategy = Object.create(strategy);
        reqStrategy.fail = function fail(challenge: any, status = 401) {
          reject(createError(status, challenge));
        };
        reqStrategy.success = function success(user: Model, info: any) {
          resolve({ user, info });
        };
        reqStrategy.redirect = function redirect(url: string, status = 302) {
          resolve(new Response(status, { headers: { Location: url } }));
        };
        reqStrategy.error = function error(err: Error) {
          reject(err);
        };
        reqStrategy.authenticate(action.request, invocationOptions);
      });
    }

  };
});
