import { createMixin, hasMany, Errors } from 'denali';
import moment from 'moment';
import { map } from 'bluebird';

export default createMixin((MixinBase, options = {}) => {
  options.expireAfter = options.expireAfter || moment.duration(2, 'days');

  return class ResetableMixin extends MixinBase {

    static isResetable = true;

    static passwordResetTokens = hasMany('reset-token');

    async sendResetPasswordEmail() {
      let ResetToken = this.modelFor('reset-token');
      let tokens = await ResetToken.find({ target: this });
      await map(tokens, (t) => {
        t.deleted = true;
        return t.save();
      });
      let token = await ResetToken.create({
        target: this,
        expiresAt: moment() + (options.expireAfter)
      });
      await token.save();
      this.service('mail').send(this.email, { user: this, token });
    }

    async resetPassword(resetToken, password) {
      let ResetToken = this.modelFor('reset-token');
      let token = await ResetToken.find({ target: this, value: resetToken });
      if (!token) {
        throw new Errors.UnprocessableEntity('Invalid token');
      }
      this.password = password;
      this.passwordResetAt = new Date();
      await this.save();
      let tokens = await ResetToken.find({ target: this });
      return map(tokens, (t) => {
        t.deleted = true;
        return t.save();
      });
    }

  };
});
