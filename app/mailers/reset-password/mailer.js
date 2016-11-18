import { Mailer } from 'denali-mailer';

export default class InvitationMailer extends Mailer {

  subject = 'Reset your password';

  to({ user }) {
    return user.email;
  }

}
