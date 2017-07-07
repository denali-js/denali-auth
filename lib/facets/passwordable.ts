import { createMixin, attr, Errors, Model, Action } from 'denali';
import { fromNode } from 'bluebird';
import * as bcrypt from 'bcryptjs';
import * as createDebug from 'debug';
import {
  upperFirst,
  defaults
} from 'lodash';

const debug = createDebug('denali-auth:passwordable');

interface PasswordableOptions {
  usernameField?: string,
  passwordField?: string,
  hashRounds?: number,
  hashedPasswordField?: string
}

export default createMixin((BaseModel: typeof Model, options: PasswordableOptions = {}) => {
  options = defaults(options, {
    usernameField: 'email',
    passwordField: 'password',
    hashRounds: 12
  });
  options = defaults(options, {
    hashedPasswordField: `hashed${ upperFirst(options.passwordField) }`
  });

  class PasswordableMixin extends BaseModel {

    static isPasswordable = true;
    static strategyName = 'password';
    static authenticationStrategyName = 'password';
    static usernameField = options.usernameField;

    static async authenticateRequest(action: Action, params: any, User: Model) {
      debug(`[${ action.request.id }]: attempting to authenticate via ${ options.usernameField }/${ options.passwordField }`);
      let username = params[options.usernameField];
      let secret = params[options.passwordField];
      if (!username || !secret) {
        throw new Errors.Unauthorized(`Missing ${ options.usernameField } and ${ options.passwordField }`);
      }
      let user = await User.findOne({ [options.usernameField]: username });
      if (!user) {
        debug(`[${ action.request.id }]: no ${ User.type } with ${ options.usernameField } = ${ username } found, failing`);
        throw new Errors.Unauthorized(`Incorrect ${ options.usernameField } or ${ options.passwordField }.`);
      }
      debug(`[${ action.request.id }]: matching user found, checking secret`);
      let isCorrect = await user.isCorrectSecret(secret);
      if (!isCorrect) {
        throw new Errors.Unauthorized(`Incorrect ${ options.usernameField } or ${ options.passwordField }.`);
      }
      return user;
    }

    async isCorrectPassword(password: string) {
      return await fromNode((cb) => bcrypt.compare(password, this[options.hashedPasswordField], cb));
    }

    async save(options?: any) {
      if (this[options.secretField]) {
        let environment = this.container.lookup('config:environment').environment;
        let rounds = environment === 'test' ? 1 : options.hashRounds;
        let hashed = await fromNode((cb) => bcrypt.hash(this[options.secretField], rounds, cb));
        this[options.hashedSecretField] = hashed;
        delete this[options.secretField];
      }
      return super.save(options);
    }

  };

  (<any>PasswordableMixin)[options.hashedPasswordField] = attr('text');
  (<any>PasswordableMixin)[options.usernameField] = attr('text');

  return PasswordableMixin;

});
