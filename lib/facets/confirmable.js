import { createMixin, hasMany, attr, Errors } from 'denali';
import { all } from 'bluebird';
import moment from 'moment';

export default createMixin((MixinBase, options) =>
  class ConfirmableMixin extends MixinBase {

    static isConfirmable = true;
    static confirmableOptions = options;

    static emailConfirmationTokens = hasMany('confirmation-token');
    static unconfirmedEmail = attr('text');
    static emailConfirmed = attr('boolean');
    static emailConfirmedAt = attr('date');

    async sendConfirmationEmail(email) {
      let ConfirmationToken = this.modelFor('confirmation-token');
      let token = new ConfirmationToken({
        email,
        target: this,
        expiresAt: moment() + (options.expireAfter || moment.duration(14, 'days'))
      });
      await token.save();
      return this.service('mail').send(email, { user: this, token });
    }

    async confirmEmail(confirmationToken) {
      let ConfirmationToken = this.modelFor('confirmation-token');
      let token = ConfirmationToken.find({ target: this, value: confirmationToken });
      if (!token) {
        throw new Errors.UnprocessableEntity('Invalid token');
      }
      if (token.email !== this.unconfirmedEmail) {
        throw new Errors.UnprocessableEntity('Stale email');
      }
      this.email = token.email;
      delete this.unconfirmedEmail;
      this.emailConfirmed = true;
      this.emailConfirmedAt = new Date();
      await this.save();
      let tokens = await this.emailConfirmationTokens();
      return all(tokens.map((t) => {
        t.deleted = true;
        return t.save();
      }));
    }

    async save() {
      if (this.isDirty('email')) {
        // TODO how universal is support for dirty state / rollback?
        this.unconfirmedEmail = this.email;
        this.rollbackAttribute('email');
      }
      let result = super.save(...arguments);
      this.sendConfirmationEmail(this.unconfirmedEmail);
      return result;
    }

  }
);
