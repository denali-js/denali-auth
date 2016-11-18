import { Action, Response, Errors } from 'denali';

export default class SendEmailConfirmation extends Action {

  async respond(params) {
    let unconfirmedEmail = params.email;
    let User = this.modelFor(params.modelName);
    let user = await User.findOne({ unconfirmedEmail });
    if (!user) {
      throw new Errors.NotFound('That email is either already confirmed, or not on file for an existing user');
    }
    await user.sendConfirmationEmail(unconfirmedEmail);
    return new Response(204);
  }

}
