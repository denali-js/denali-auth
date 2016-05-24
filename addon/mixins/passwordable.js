import { createMixin, attr, Errors } from 'denali';
import Promise from 'bluebird';
import bcrypt from 'bcryptjs';
import captialize from 'lodash/capitalize';

export default createMixin((options) => {
  let idField = options.idField || 'email';
  let secretField = options.secretField || 'password';
  let hashedField = options.hashedSecretField || `hashed${ captialize(secretField) }`;

  class PasswordableMixin {

    static isPasswordable = true;
    static authenticateType = 'password';

    isCorrectSecret(password) {
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, this[hashedField], (err, isCorrect) => {
          return isCorrect ? resolve() : reject();
        });
      });
    }

    save() {
      if (this[secretField]) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(this[secretField], 10, (err, hashed) => {
              return err ? reject(err) : resolve(hashed);
            });
          }).then((hashed) => {
            this[hashedField] = hashed;
            return super.save(...arguments);
          });
      }
      return super.save(...arguments);
    }

    authenticateRequest(action, params) {
      let id = params[idField];
      let secret = params[secretField];
      this.find({ [idField]: id }).then((user) => {
        if (!user) {
          throw new Errors.Unauthorized('No such user');
        }
        return user.isCorrectSecret(secret);
      });
    }

  }

  PasswordableMixin[idField] = attr('text');
  PasswordableMixin[hashedField] = attr('text');

  return PasswordableMixin;
});

