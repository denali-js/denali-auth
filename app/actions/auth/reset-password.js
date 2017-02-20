import { Action, Response, Errors } from 'denali';

export default class ResetPasswordAction extends Action {

  lookupToken(token) {
    return this.modelFor('password-reset-token').findOne({ token });
  }

  async respond(params) {
    let token = await this.lookupToken(params.token);
    if (!token) {
      throw new Errors.UnprocessableEntity('Invalid reset token');
    }
    let User = this.modelFor(params.modelName);
    let user = await User.find(token.userId);
    if (!params.password) {
      throw new Errors.UnprocessableEntity('You must supply a new `password` to reset the password for this account.');
    }
    await user.resetPassword(token, params.password);
    return new Response(204);
  }

}
