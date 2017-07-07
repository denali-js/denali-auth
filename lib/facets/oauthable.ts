import {
  upperFirst,
  camelCase,
  forEach
} from 'lodash';
import { attr, createMixin, Errors, Response, Model, Action } from 'denali';
import * as createDebug from 'debug';

const debug = createDebug('denali-auth:oauthable');
const createError = Errors;

export interface ProviderConfig {
  type: string;
  Strategy: any;
  strategy: any;
  options?: object;
  attributesFromProfile(results: any): object;
}

export default createMixin((BaseModel: typeof Model, options: { providers?: (string | { type: string })[] } = {}) => {
  if (!options.providers || options.providers.length === 0) {
    throw new Error('You must provide at least one provider to the oauthable({ providers: [] }) mixin');
  }
  // Loop through requested providers, load the passport strategy for each, and
  // load it
  let providers: { [type: string]: ProviderConfig } = {};
  options.providers.forEach((providerConfig) => {
    let config;
    if (typeof providerConfig === 'string') {
      let type = providerConfig;
      config = providers[type] = <ProviderConfig>{ type };
    } else {
      config = providers[providerConfig.type] = <ProviderConfig>providerConfig;
    }
    config.Strategy = require(`passport-${ config.type }`);
  });

  class OAuthableMixin extends BaseModel {

    [attr: string]: any;

    static isOauthable = true;
    static strategyName = 'oauth';

    static authenticateRequest(action: Action, params: any, User: Model) {
      debug(`[${ action.request.id }]: attempting to authenticate`);
      if (!params.provider) {
        throw new Errors.BadRequest(`No OAuth provider was specified, unable to attempt OAuth login`);
      }
      let provider = providers[params.provider];
      if (!provider) {
        throw new Errors.BadRequest(`${ params.provider } OAuth provider is not supported`);
      }
      // If no options were provided inline in the mixin config, then load them
      // from the application config
      if (!provider.options) {
        debug(`no inline provider options supplied, caching ${ provider.type } options from config/environment.js`);
        let authConfig = action.container.config.auth || {};
        let oauthConfig = authConfig.oauthProviders || {};
        provider.options = oauthConfig[provider.type];
      }
      // If this is the first request against this provider, instantiate and
      // cache the strategy for later use
      if (!provider.strategy) {
        debug(`caching ${ provider.type } strategy instance`);
        provider.strategy = new provider.Strategy(provider.options, (accessToken: string, refreshToken: string, profile: any, cb: (err: Error, data: any) => void) => {
          // We hijack this callback - normally, you pass back the user, but we
          // override below since we don't have a reference to the model class up
          // here yet. So we just kick all the data out and handle the rest in our
          // authenticateRequest method below.
          cb(null, { accessToken, refreshToken, profile });
        });
      }
      // Shim around the passport API to take advantage of their strategies
      return new Promise((resolve, reject) => {
        let strategy = Object.create(provider.strategy);
        debug(`[${ action.request.id }]: augmenting strategy instance for this request`);
        strategy.success = async (results: { accessToken: string, refreshToken: string, profile: any }) => {
          debug(`[${ action.request.id }]: success! third party granted access token, trying to lookup matching user by profile id`);
          // This method is invoked by the cb from above. Here, we find the user
          // that matches those credentials now that we have a reference to the
          // User class itself
          try {
            // We associate third-party profiles with our own user accounts via
            // provider id fields, i.e. twitterId, facebookId
            let user = await User.findOne({ [`${ camelCase(provider.type) }Id`]: results.profile.id });
            if (!user) {
              debug(`[${ action.request.id }]: no user was found with that profile id, registering a new user now`);
              // There's no user that exists for that third-party profile, so
              // create one
              user = await this.registerFromProvider(provider.type, results, User);
            }
            resolve(user);
          } catch (error) {
            reject(error);
          }
        };
        strategy.fail = function fail(challenge: any, status = 401) {
          debug(`[${ action.request.id }]: strategy failed`);
          reject(createError(status, challenge));
        };
        strategy.redirect = function redirect(url: string, status = 302) {
          debug(`[${ action.request.id }]: strategy redirected to ${ url }`);
          resolve(new Response(status, { headers: { Location: url } }));
        };
        strategy.error = function error(err: Error) {
          debug(`[${ action.request.id }]: strategy errored`);
          reject(err);
        };

        strategy.authenticate(action.request, params);
      });
    }

    static async registerFromProvider(type: string, results: any, User: Model) {
      let attributes;
      let providerSpecificMapper = `attributesFrom${ upperFirst(type) }Profile`;
      if (User[providerSpecificMapper]) {
        attributes = User[providerSpecificMapper](results);
      } else if (providers[type].attributesFromProfile) {
        attributes = providers[type].attributesFromProfile(results);
      } else {
        attributes = Object.assign({}, results.profile, {
          [`${ type }Id`]: results.profile.id
        });
        delete attributes.id;
      }
      let user = await User.register(attributes);
      return user;
    }

  }

  forEach(providers, (provider) => {
    (<any>OAuthableMixin)[`${ camelCase(provider.type) }Id`] = attr('text');
  });

  return OAuthableMixin;
});
