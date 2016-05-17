import { createMixin } from 'denali';

export default createMixin(() =>
  class AuthenticateMixin {

    before() {
      if (this.protected !== false) {
        let strategy = this.container.lookup(`auth-strategy:${ this.config.auth.strategy }`);
        return strategy.authenticate(this);
      }
    }

  }
);
