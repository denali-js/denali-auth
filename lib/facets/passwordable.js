import { createMixin, attr, Errors } from 'denali';
import { fromNode } from 'bluebird';
import bcrypt from 'bcryptjs';
import captialize from 'lodash/capitalize';

export default createMixin((MixinBase, options = {}) => {
  let secretField = options.secretField || 'password';
  let hashedField = options.hashedSecretField || `hashed${ captialize(secretField) }`;
  let hashRounds = options.rounds || 12;

  return class PasswordableMixin extends MixinBase {

    static isPasswordable = true;
    static authenticationStrategyName = 'password';
    static [hashedField] = attr('text');

    static async authenticateRequest(action, params) {
      let usernameField = this.usernameField;
      let username = params[usernameField];
      let secret = params[secretField];
      if (!username || !secret) {
        return;
      }
      let user = (await this.find({ [usernameField]: username }))[0];
      if (!user) {
        throw new Errors.Unauthorized('Invalid credentials');
      }
      return user.isCorrectSecret(secret);
    }

    async isCorrectSecret(password) {
      let isCorrect = await fromNode((cb) => bcrypt.compare(password, this[hashedField], cb));
      if (!isCorrect) {
        throw new Errors.Unauthorized(`Incorrect ${ this.constructor.usernameField } or ${ secretField }.`);
      }
      return this;
    }

    async save() {
      if (this[secretField]) {
        let environment = this.container.lookup('config:environment').environment;
        let rounds = environment === 'test' ? 1 : hashRounds;
        let hashed = await fromNode((cb) => bcrypt.hash(this[secretField], rounds, cb));
        this[hashedField] = hashed;
      }
      return super.save(...arguments);
    }

  };
});
