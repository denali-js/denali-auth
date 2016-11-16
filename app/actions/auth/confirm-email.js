import { Action, Response } from 'denali';

export default class ConfirmEmailAction extends Action {

  lookupToken(token) {
    let ConfirmationToken = this.modelFor('confirmation-token');
    return ConfirmationToken.find({ token });
  }

  async respond(params) {
    let token = await this.lookupToken(params.token);
    if (!token) {
      throw new Error.UnprocessableEntity('Invalid confirmation token');
    }
    let User = this.modelFor(params.modelName);
    let user = await User.find(token.userId);
    await user.confirmEmail(token);
    return new Response(204);
  }

}
