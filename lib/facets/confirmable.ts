import {
  defaults
} from 'lodash';
import * as moment from 'moment';
import * as assert from 'assert';
import { createMixin, hasOne, attr, Errors, Model } from 'denali';
import { returnof } from 'denali-typescript';
import RegisterableMixin from './registerable';

const Registerable = returnof(RegisterableMixin._factory, Model);

export default createMixin((BaseModel: typeof Registerable, options) => {
  options = defaults(options, {
    expiresAfter: moment.duration(14, 'days'),
    lockoutAfter: false,
    reconfirmOnChange: true
  });

  /**
   * Adds email confirmation. New users will be sent an email at their email address with a link
   * which contains a token that can be used to confirm their email address is valid. The link is
   * set in the `confirm-email` mailer template - you should change it to map to your frontend,
   * which should then extract the token and hit the API to confirm it.
   *
   * This mixin leverages two hooks: canLogin() (to block login attempts for users with old
   * unconfirmed emails) and register() (to record their unconfirmed email and trigger the inital
   * confirmation email send).
   */
  return class ConfirmableMixin extends BaseModel {

    static isConfirmable = true;

    static emailConfirmationToken = hasOne('email-confirmation-token');
    static unconfirmedEmail = attr('text');
    static emailConfirmed = attr('boolean');
    static emailConfirmedAt = attr('date');

    async canLogin() {
      if (!this.emailConfirmed) {
        let ConfirmationToken = this.modelFor('email-confirmation-token');
        let token = await ConfirmationToken.findOne({ userId: this.id, userType: this.type });
        assert(token, `${ this } has an unconfirmed email with no email confirmation token - this shouldn't be possible.`);
        if (token.expiresAt < Date.now()) {
          throw new Errors.Forbidden(`Unconfirmed email: this account must confirm it's email address before logging in.`);
        }
      }
      return super.canLogin();
    }

    static async register(attributes: any) {
      attributes.unconfirmedEmail = attributes.email;
      attributes.emailConfirmed = false;
      let user = await super.register(attributes);
      await user.sendConfirmationEmail(user.unconfirmedEmail);
      return user;
    }

    async sendConfirmationEmail(email: string) {
      let ConfirmationToken = this.modelFor('email-confirmation-token');
      let token = new ConfirmationToken({
        email,
        userId: this.id,
        userType: this.type,
        expiresAt: moment() + options.lockoutAfter
      });
      await token.save();
      return (<any>this.service('mailer')).send('confirm-email', { to: email, user: this, token });
    }

    async confirmEmail(token: Model) {
      let ConfirmationToken = this.modelFor('email-confirmation-token');
      let inFlightToken = await ConfirmationToken.findOne({ userId: this.id, userType: this.type });
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

    // TODO: can we support dirty state like this at the Denali Model interface?
    // async save() {
      // if (options.reconfirmOnChange) {
      //   if (this.isDirty('email')) {
      //     this.unconfirmedEmail = this.email;
      //     this.rollbackAttribute('email');
      //   }
      //   let result = super.save(...arguments);
      //   this.sendConfirmationEmail(this.unconfirmedEmail);
      //   return result;
      // }
      // return super.save(...arguments);
    // }

  };
});
