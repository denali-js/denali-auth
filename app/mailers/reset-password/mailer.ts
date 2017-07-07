import { Mailer } from 'denali-mailer';
import { Model } from 'denali';

export default class InvitationMailer extends Mailer {

  subject = 'Reset your password';

  to({ user }: { user: Model }) {
    return user.email;
  }

}
