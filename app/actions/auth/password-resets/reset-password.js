import { Action, Response } from 'denali';

export default class ResetPasswordAction extends Action {

  async respond(params) {
    let ResetToken = this.modelFor('reset-token');
    let token = await ResetToken.find(params.token);
    if (!token) {
      throw new Error.UnprocessableEntity('Invalid reset token');
    }
    let user = await token.user();
    await user.resetPassword(token);
    return new Response(204);
  }

}
