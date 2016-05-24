import { createMixin, eachPrototype } from 'denali';
import { resolve } from 'bluebird';

export default createMixin((modelType = 'user') =>
  class AuthenticateMixin {

    static before = [ 'authenticate' ];

    authenticate(params) {
      if (this.protected !== false) {
        let User = this.modelFor(modelType);
        let strategies = [];
        eachPrototype(User.prototype, (mixin) => {
          if (mixin.authenticateRequest) {
            strategies.push(mixin.authenticateRequest);
          }
        });
        return resolve(strategies).any((strategy) => {
            return strategy.call(this, this, params);
          }).then((currentUser) => {
            this.currentUser = currentUser;
          });
      }
    }

  }
);
