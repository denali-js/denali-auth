import { Action, Response } from 'denali';

export default class ConfirmEmailAction extends Action {

  async respond(params) {
    let ConfirmationToken = this.modelFor('confirmation-token');
    let token = await ConfirmationToken.find(params.token);
    if (!token) {
      throw new Error.UnprocessableEntity('Invalid confirmation token');
    }
    let user = await token.user();
    await user.confirmEmail(token);
    return new Response(204);
  }

}
