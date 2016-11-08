import { createMixin, hasMany, Errors } from 'denali';
import moment from 'moment';
import { all } from 'bluebird';

export default createMixin((MixinBase, options) =>
  class ResetableMixin extends MixinBase {

    static isResetable = true;

    static passwordResetTokens = hasMany('reset-token');

    sendResetPasswordEmail() {
      let ResetToken = this.modelFor('reset-token');
      let token = new ResetToken({
        target: this,
        expiresAt: moment() + (options.expireAfter || moment.duration(2, 'days'))
      });
      return this.passwordResetTokens().then((tokens) => {
        return all(tokens.map((t) => {
            t.deleted = true;
            return t.save();
          })).then(() => {
            return token.save().then(() => {
              this.service('mail').send(this.email, { user: this, token });
            });
          });
      });
    }

    resetPassword(resetToken, password) {
      let ResetToken = this.modelFor('reset-token');
      return ResetToken.find({ target: this, value: resetToken })
        .then((token) => {
          if (!token) {
            throw new Errors.UnprocessableEntity('Invalid token');
          }
          this.password = password;
          this.passwordResetAt = new Date();
          return this.save();
        }).then(() => {
          this.passwordResetTokens().then((tokens) => {
            return all(tokens.map((token) => {
              token.deleted = true;
              return token.save();
            }));
          });
        });
    }

  }
);

