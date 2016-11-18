import { Action, Response, Errors } from 'denali';

export default class SendResetPassword extends Action {

  async respond(params) {
    let email = params.email;
    let User = this.modelFor(params.modelName);
    let user = await User.findOne({ email });
    if (!user) {
      throw new Errors.NotFound('No such user');
    }
    await user.sendResetPasswordEmail();
    return new Response(204);
  }

}
