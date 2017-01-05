import { attr, createMixin, Errors, Response } from 'denali';
import createDebug from 'debug';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import forEach from 'lodash/forEach';
const debug = createDebug('denali-auth:oauthable');
const createError = Errors;

export default createMixin((MixinBase, options = {}) => {
  if (!options.providers || options.providers.length === 0) {
    throw new Error('You must provide at least one provider to the oauthable({ providers: [] }) mixin');
  }
  // Loop through requested providers, load the passport strategy for each, and
  // load it
  let providers = {};
  options.providers.forEach((providerConfig) => {
    let config;
    if (typeof providerConfig === 'string') {
      let type = providerConfig;
      config = providers[type] = { type };
    } else {
      config = providers[providerConfig.type] = providerConfig;
    }
    config.Strategy = require(`passport-${ config.type }`);
  });

  class OAuthableMixin extends MixinBase {

    static isOauthable = true;
    static strategyName = 'oauth';

    static authenticateRequest(action, params, User) {
      debug(`[${ action.request.id }]: attempting to authenticate`);
      let provider = providers[params.provider];
      if (!provider) {
        throw new Errors.Unauthorized(`${ params.provider } OAuth provider is not supported`);
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
        provider.strategy = new provider.Strategy(provider.options, (accessToken, refreshToken, profile, cb) => {
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
        strategy.success = async (results) => {
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
        strategy.fail = function fail(challenge, status = 401) {
          debug(`[${ action.request.id }]: strategy failed`);
          reject(createError(status, challenge));
        };
        strategy.redirect = function redirect(url, status = 302) {
          debug(`[${ action.request.id }]: strategy redirected to ${ url }`);
          resolve(new Response(status, { headers: { Location: url } }));
        };
        strategy.error = function error(err) {
          debug(`[${ action.request.id }]: strategy errored`);
          reject(err);
        };

        strategy.authenticate(action.request, params);
      });
    }

    static async registerFromProvider(type, results, User) {
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
    OAuthableMixin[`${ camelCase(provider.type) }Id`] = attr('text');
  });

  return OAuthableMixin;
});
