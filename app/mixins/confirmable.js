import { createMixin, hasMany, attr, Errors } from 'denali';
import { all } from 'bluebird';
import moment from 'moment';

export default createMixin((options) =>
  class ConfirmableMixin {

    static isConfirmable = true;
    static confirmableOptions = options;

    static emailConfirmationTokens = hasMany('confirmation-token');
    static unconfirmedEmail = attr('text');
    static emailConfirmed = attr('boolean');
    static emailConfirmedAt = attr('date');

    sendConfirmationEmail(email) {
      let ConfirmationToken = this.modelFor('confirmation-token');
      let token = new ConfirmationToken({
        email,
        target: this,
        expiresAt: moment() + (options.expireAfter || moment.duration(14, 'days'))
      });
      return token.save().then(() => {
        return this.service('mail').send(email, { user: this, token });
      });
    }

    confirmEmail(confirmationToken) {
      let ConfirmationToken = this.modelFor('confirmation-token');
      return ConfirmationToken.find({ target: this, value: confirmationToken })
        .then((token) => {
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
          return this.save();
        }).then(() => {
          this.emailConfirmationTokens().then((tokens) => {
            return all(tokens.map((token) => {
              token.deleted = true;
              return token.save();
            }));
          });
        });
    }

    save() {
      if (this.isDirty('email')) {
        // TODO how universal is support for dirty state / rollback?
        this.unconfirmedEmail = this.email;
        this.rollbackAttribute('email');
      }
      return super.save(...arguments).tap(() => {
        this.sendConfirmationEmail(this.unconfirmedEmail);
      });
    }

  }
);
