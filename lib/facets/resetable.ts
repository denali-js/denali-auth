import { createMixin, hasMany } from 'denali';
import moment from 'moment';
import { map } from 'bluebird';
import defaults from 'lodash/defaults';
import createDebug from 'debug';

const debug = createDebug('denali-auth:resetable');

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
      let ResetToken = this.modelFor('password-reset-token');
      debug(`password reset requested for ${ this.email }, clearing out existing reset tokens first`);
      let tokens = await this.getPasswordResetTokens();
      await map(tokens, (t) => t.delete());
      let token = await ResetToken.create({
        userId: this.id,
        userType: this.type,
        expiresAt: moment() + (options.expireAfter)
      });
      await token.save();
      debug(`sending password reset email to ${ this.email }`);
      return this.service('mailer').send('reset-password', { user: this, token });
    }

    async resetPassword(token, password) {
      debug(`resetting password for ${ this.type } ${ this.id }`);
      this.password = password;
      this.passwordResetAt = new Date();
      await this.save();
      debug(`clearing any outstanding reset tokens`);
      let tokens = await this.getPasswordResetTokens();
      map(tokens, (t) => t.delete());
    }

  };
});
