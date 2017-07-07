import { Mailer } from 'denali-mailer';
import { Model } from 'denali';

export default class InvitationMailer extends Mailer {

  subject = "You're invited!";

  to({ invitation }: { invitation: Model }) {
    return invitation.invitedEmail;
  }

}
