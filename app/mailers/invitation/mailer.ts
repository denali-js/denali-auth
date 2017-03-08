import { Mailer } from 'denali-mailer';

export default class InvitationMailer extends Mailer {

  subject = "You're invited!";

  to({ invitation }) {
    return invitation.invitedEmail;
  }

}
