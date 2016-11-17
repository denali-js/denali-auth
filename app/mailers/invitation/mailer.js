import { Mailer } from 'denali-mailer';

export default class InvitationMailer extends Mailer {

  subject = "You're invited!";

  to({ invitation }) {
    return invitation.invitedEmail;
  }

  async from({ invitation }) {
    let User = this.modelFor(invitation.fromType);
    let fromUser = await User.findOne(invitation.fromId);
    return fromUser.email;
  }

}
