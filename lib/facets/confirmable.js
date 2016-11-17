import { createMixin, hasMany, attr, Errors } from 'denali';
import moment from 'moment';
import assert from 'assert';
import defaults from 'lodash/defaults';

export default createMixin((MixinBase, options) => {
  options = defaults(options, {
    expiresAfter: moment.duration(14, 'days'),
    lockoutAfter: false,
    reconfirmOnChange: true
  });

  return class ConfirmableMixin extends MixinBase {

    static isConfirmable = true;

    static emailConfirmationTokens = hasMany('email-confirmation-token');
    static unconfirmedEmail = attr('text');
    static emailConfirmed = attr('boolean');
    static emailConfirmedAt = attr('date');

    async canLogin() {
      if (!this.emailConfirmed) {
        let token = await this.getEmailConfirmationToken();
        assert(token, `User ${ this } has an unconfirmed email with no email confirmation token - this shouldn't be possible.`);
        if (token.expiresAt < Date.now() && options.lockoutAfter) {
          throw new Errors.BadRequest(`Unconfirmed email: this account must confirm it's email address before logging in.`);
        }
      }
      return super.canLogin();
    }

    static async register(attributes) {
      attributes.unconfirmedEmail = attributes.email;
      attributes.emailConfirmed = false;
      return super.register(attributes);
    }

    async sendConfirmationEmail(email) {
      let ConfirmationToken = this.modelFor('confirmation-token');
      let token = new ConfirmationToken({
        email,
        userId: this.id,
        userType: this.constructor.type,
        expiresAt: moment() + options.expiresAfter
      });
      await token.save();
      return this.service('mailer').send('confirm-email', { to: email, user: this, token });
    }

    async confirmEmail(token) {
      let inFlightToken = await this.getEmailConfirmationToken();
      if (inFlightToken) {
        await inFlightToken.delete();
      }
      if (token.email !== this.unconfirmedEmail) {
        throw new Errors.UnprocessableEntity('Stale email - user may have changed email before confirming the original, which this token was issued for');
      }
      this.email = token.email;
      delete this.unconfirmedEmail;
      this.emailConfirmed = true;
      this.emailConfirmedAt = new Date();
      await this.save();
      token.delete();
    }

    async save() {
      // TODO: can we support dirty state like this at the Denali Model interface?
      // if (options.reconfirmOnChange) {
      //   if (this.isDirty('email')) {
      //     this.unconfirmedEmail = this.email;
      //     this.rollbackAttribute('email');
      //   }
      //   let result = super.save(...arguments);
      //   this.sendConfirmationEmail(this.unconfirmedEmail);
      //   return result;
      // }
      return super.save(...arguments);
    }

  };
});
