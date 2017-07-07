import {
  upperFirst
} from 'lodash';
import { createMixin, eachPrototype, Errors, Model, Action } from 'denali';
import * as createDebug from 'debug';
import { reject } from 'bluebird';

const debug = createDebug('denali-auth:authenticatable');

export interface AuthStrategy {
  strategyName: string;
  authenticateRequest(action: Action, params: any, model: typeof Model): Promise<Model>;
}

export interface IAuthenticable {
  isAuthenticatable: true;
  authenticate(action: Action, params: any, allowedStrategies: string[] | string): Promise<Model>
}

export default createMixin((BaseModel: typeof Model) => {

  /**
   * Adds the ability to authenticate a user model. Authentication happens via strategies, each of
   * which represents a different method of authentication (i.e. username/password, OAuth, etc).
   *
   * Authenticatable models will attempt each strategy in order (determined by mixin order). The
   * first one to succeed will result in the request being authenticated. If none succeed, the first
   * strategy's failure message is used as the error message in the response, and the request is
   * terminated.
   */
  return class AuthenticatableMixin extends BaseModel {

    static isAuthenticatable = true;

    /**
     * Auth strategies are cached on the class itself after first lookup.
     */
    static _strategies: AuthStrategy[];

    /**
     * Given an Action, it's params, and a set of allowed strategy names, check each strategy in
     * turn to see if any can successfully authenticate the request.
     */
    static async authenticate(action: Action, params: any, allowedStrategies: string[] | string) {
      let failureReason: Error;
      let attemptNextStrategy = async (strategies: AuthStrategy[]): Promise<Model> => {
        let currentStrategy = strategies.shift();
        if (!currentStrategy) {
          return reject(failureReason);
        }
        if (allowedStrategies !== 'all' && !allowedStrategies.includes(currentStrategy.strategyName)) {
          return attemptNextStrategy(strategies);
        }
        let currentUser;
        try {
          currentUser = await currentStrategy.authenticateRequest(action, params, this);
        } catch (error) {
          debug(`${ currentStrategy.strategyName } failed with "${ error.message }", ${ strategies.length } strategies remaining`);
          failureReason = failureReason || error;
          return attemptNextStrategy(strategies);
        }
        if (!currentUser) {
          throw new Error(`${ currentStrategy.strategyName }.authenticateRequest() should have returned the current user or errored, but instead it returned ${ currentUser }`);
        }
        debug(`${ currentStrategy.strategyName } succeeded, request is authenticated`);
        return currentUser;
      };

      // Cache strategy methods
      if (!this._strategies) {
        this._strategies = [];
        eachPrototype(this, (mixin) => {
          if (mixin.hasOwnProperty('authenticateRequest')) {
            this._strategies.push(mixin);
          }
        });
      }

      if (this._strategies.length === 0) {
        throw new Errors.InternalServerError(`You tried to authenticate with a ${ upperFirst(this.type) } model, but you haven't applied any authentication mixins (i.e. passwordable, oauthable, sessionable).`);
      }

      let strategies = this._strategies.filter(({ strategyName }) => {
        return allowedStrategies === 'all' || allowedStrategies.includes(strategyName);
      });

      if (strategies.length === 0) {
        throw new Errors.InternalServerError(`None of the available authentication strategies for this user model are allowed on this action, so authentication is impossible. You must allow at least one strategy, or remove the authenticate filter entirely. Available strategies are: ${ this._strategies.map((s) => s.strategyName) }, and allowed stratgies are: ${ allowedStrategies }`);
      }

      debug(`[${ action.request.id }]: attempting to authenticate with: ${ strategies.map((s) => s.strategyName).join(', ') }`);
      return attemptNextStrategy(this._strategies.slice(0));
    }

  };
});
