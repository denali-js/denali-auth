import { createMixin, attr, Errors } from 'denali';
import Promise from 'bluebird';
import bcrypt from 'bcryptjs';
import captialize from 'lodash/capitalize';

export default createMixin((MixinBase, options = {}) => {
  let secretField = options.secretField || 'password';
  let hashedField = options.hashedSecretField || `hashed${ captialize(secretField) }`;
  let hashRounds = options.rounds || 12;

  class PasswordableMixin extends MixinBase {

    static isPasswordable = true;
    static authenticationStrategyName = 'password';

    static authenticateRequest(action, params) {
      let usernameField = this.usernameField;
      let username = params[usernameField];
      let secret = params[secretField];
      return this.find({ [usernameField]: username }).then((user) => {
        if (!user) {
          throw new Errors.Unauthorized('No such user');
        }
        return user.isCorrectSecret(secret);
      });
    }

    isCorrectSecret(password) {
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, this[hashedField], (err, isCorrect) => {
          if (isCorrect) {
            resolve(this);
          } else {
            reject(new Errors.Unauthorized(`Incorrect ${ this.constructor.usernameField } or ${ secretField }.`));
          }
        });
      });
    }

    save() {
      if (this[secretField]) {
        return new Promise((resolve, reject) => {
            let environment = this.container.lookup('config:environment').environment;
            let rounds = environment === 'test' ? 1 : hashRounds;
            bcrypt.hash(this[secretField], rounds, (err, hashed) => {
              return err ? reject(err) : resolve(hashed);
            });
          }).then((hashed) => {
            this[hashedField] = hashed;
            return super.save(...arguments);
          });
      }
      return super.save(...arguments);
    }

  }

  PasswordableMixin[hashedField] = attr('text');

  return PasswordableMixin;
});

