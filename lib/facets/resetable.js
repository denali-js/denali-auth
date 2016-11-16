import { createMixin, hasMany } from 'denali';
import moment from 'moment';
import { map } from 'bluebird';
import defaults from 'lodash/defaults';

export default createMixin((MixinBase, options = {}) => {
  options = defaults(options, {
    expiresAfter: moment.duration(2, 'days')
  });

  // TODO: ensure that the mixin base has passwordable applied (and do the same
  // elsewhere to ensure proper super overriding order)

  return class ResetableMixin extends MixinBase {

    static isResetable = true;

    static passwordResetTokens = hasMany('password-reset-token');

    async sendResetPasswordEmail() {
      let ResetToken = this.modelFor('reset-token');
      let tokens = await this.getPasswordResetTokens();
      await map(tokens, (t) => t.delete());
      let token = await ResetToken.create({
        userId: this.id,
        userType: this.constructor.type,
        expiresAt: moment() + (options.expireAfter)
      });
      await token.save();
      this.service('mailer').send('reset-password', { user: this, token });
    }

    async resetPassword(token, password) {
      this.password = password;
      this.passwordResetAt = new Date();
      await this.save();
      let tokens = await this.getPasswordResetTokens();
      map(tokens, (t) => t.delete());
    }

  };
});
