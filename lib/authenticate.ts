import {
  upperFirst,
  filter,
  defaults
} from 'lodash';
import { createMixin, Action, Model } from 'denali';
import { IAuthenticable } from './facets/authenticatable';

export default createMixin(function(BaseAction: typeof Action, options: any) {
  defaults(options, {
    modelTypes: null,
    allowedStrategies: [ 'session' ]
  });

  abstract class AuthenticateMixin extends BaseAction {

    static before = [ 'authenticate' ];

    currentUser: Model = null;

    async authenticate(params: any) {
      let Models = this._findAuthenticatableModels();
      let failureReason;
      while (Models.length > 0) {
        let Model = Models.shift();
        if (!Model.isAuthenticatable) {
          throw new Error(`You tried to authenticate against the ${ upperFirst(Model.type) } model, but did not apply the Authenticatable mixin to it.`);
        }
        let user;
        try {
          user = await (<Model & IAuthenticable>Model).authenticate(this, params, options.allowedStrategies);
          this.currentUser = user;
          return;
        } catch (e) {
          failureReason = e;
        }
      }
      throw failureReason;
    }

    private _authenticatableModels: Model[];

    _findAuthenticatableModels() {
      if (!this._authenticatableModels) {
        if (typeof options.modelTypes === 'string') {
          this._authenticatableModels = this.container.lookup(`model:${ options.modelTypes }`);
        } else if (Array.isArray(options.modelTypes)) {
          this._authenticatableModels = options.modelTypes.map((type: string) => {
            return this.container.lookup(`model:${ type }`);
          });
        } else {
          let models = this.container.lookupAll('model');
          this._authenticatableModels = filter(models, 'isAuthenticatable');
        }
      }
      return this._authenticatableModels.slice(0);
    }

  }

  return AuthenticateMixin;
});
