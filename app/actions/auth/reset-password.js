import { Action, Response } from 'denali';

export default class ResetPasswordAction extends Action {

  lookupToken(token) {
    return this.modelFor('reset-token').find({ token });
  }

  async respond(params) {
    let token = await this.lookupToken(params.token);
    if (!token) {
      throw new Error.UnprocessableEntity('Invalid reset token');
    }
    let User = this.modelFor(params.modelName);
    let user = await User.find(token.userId);
    await user.resetPassword(token, params.password);
    return new Response(204);
  }

}
