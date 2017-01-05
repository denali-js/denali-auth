import { createMixin } from 'denali';
import upperFirst from 'lodash/upperFirst';
import filter from 'lodash/filter';
import defaults from 'lodash/defaults';

export default createMixin((MixinBase, options = {}) => {
  defaults(options, {
    modelTypes: null,
    allowedStrategies: [ 'session' ]
  });

  return class AuthenticateMixin extends MixinBase {

    static before = [ 'authenticate' ];

    async authenticate(params) {
      let Models = this._findAuthenticatableModels();
      let failureReason;
      while (Models.length > 0) {
        let Model = Models.shift();
        if (!Model.isAuthenticatable) {
          throw new Error(`You tried to authenticate against the ${ upperFirst(Model.type) } model, but did not apply the Authenticatable mixin to it.`);
        }
        let user;
        try {
          user = await Model.authenticate(this, params, options.allowedStrategies);
          this.currentUser = user;
          return;
        } catch (e) {
          failureReason = e;
        }
      }
      throw failureReason;
    }

    _findAuthenticatableModels() {
      if (!this._authenticatableModels) {
        if (typeof options.modelTypes === 'string') {
          this._authenticatableModels = this.container.lookup(`model:${ options.modelTypes }`);
        } else if (Array.isArray(options.modelTypes)) {
          this._authenticatableModels = options.modelTypes.map((type) => {
            return this.container.lookup(`model:${ type }`);
          });
        } else {
          let models = this.container.lookupAll('model');
          this._authenticatableModels = filter(models, 'isAuthenticatable');
        }
      }
      return this._authenticatableModels.slice(0);
    }

  };
});
