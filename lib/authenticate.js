import { createMixin } from 'denali';
import upperFirst from 'lodash/upperFirst';

export default createMixin((MixinBase, modelType = 'user') =>
  class AuthenticateMixin extends MixinBase {

    static before = [ 'authenticate' ];

    async authenticate(params) {
      let User = this.modelFor(modelType);
      if (!User.isAuthenticatable) {
        throw new Error(`You tried to authenticate against the ${ upperFirst(modelType) } model, but did not apply the Authenticatable mixin to it.`);
      }
      this.currentUser = await User.authenticate(this, params);
    }

  }
);
