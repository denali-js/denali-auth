import { createMixin, attr, Errors } from 'denali';
import { fromNode } from 'bluebird';
import bcrypt from 'bcryptjs';
import createDebug from 'debug';
import upperFirst from 'lodash/upperFirst';
import defaults from 'lodash/defaults';

const debug = createDebug('denali-auth:passwordable');

export default createMixin((MixinBase, options = {}) => {
  options = defaults(options, {
    usernameField: 'email',
    secretField: 'password',
    hashRounds: 12
  });
  options = defaults(options, {
    hashedSecretField: `hashed${ upperFirst(options.secretField) }`
  });

  return class PasswordableMixin extends MixinBase {

    static isPasswordable = true;
    static authenticationStrategyName = 'password';
    static usernameField = options.usernameField;

    static [options.hashedSecretField] = attr('text');
    static [options.usernameField] = attr('text');

    static async authenticateRequest(action, params, User) {
      debug(`[${ action.request.id }]: attempting to authenticate via ${ options.usernameField }/${ options.secretField }`);
      let username = params[options.usernameField];
      let secret = params[options.secretField];
      if (!username || !secret) {
        throw new Errors.Unauthorized(`Missing ${ options.usernameField } and ${ options.secretField }`);
      }
      let user = await User.findOne({ [options.usernameField]: username });
      if (!user) {
        throw new Errors.Unauthorized(`Incorrect ${ options.usernameField } or ${ options.secretField }.`);
      }
      let isCorrect = await user.isCorrectSecret(secret);
      if (!isCorrect) {
        throw new Errors.Unauthorized(`Incorrect ${ options.usernameField } or ${ options.secretField }.`);
      }
      return user;
    }

    async isCorrectSecret(password) {
      return await fromNode((cb) => bcrypt.compare(password, this[options.hashedField], cb));
    }

    async save() {
      if (this[options.secretField]) {
        let environment = this.container.lookup('config:environment').environment;
        let rounds = environment === 'test' ? 1 : options.hashRounds;
        let hashed = await fromNode((cb) => bcrypt.hash(this[options.secretField], rounds, cb));
        this[options.hashedField] = hashed;
        delete this[options.secretField];
      }
      return super.save(...arguments);
    }

  };
});
