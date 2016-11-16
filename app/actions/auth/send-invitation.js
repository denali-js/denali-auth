import { Action, Response, Errors } from 'denali';

export default class Invite extends Action {

  async respond(params) {
    let email = params.email;
    let User = this.modelFor(params.modelType);
    let user = await User.find({ email });
    if (user) {
      throw new Errors.Conflict('User already exists');
    }
    let Invitation = this.modelFor('invitation');
    let invitation = await Invitation.find({ invitedEmail: email });
    if (invitation && !params.resend) {
      throw new Errors.Conflict('Invitation already sent');
    }
    await User.sendInvitationEmail(email, invitation);
    return new Response(204);
  }

}
