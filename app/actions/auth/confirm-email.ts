import { Action, Response, Errors } from 'denali';

export default class ConfirmEmailAction extends Action {

  lookupToken(token: string) {
    let ConfirmationToken = this.modelFor('email-confirmation-token');
    return ConfirmationToken.findOne({ token });
  }

  async respond(params: any) {
    let token = await this.lookupToken(params.token);
    if (!token) {
      throw new Errors.UnprocessableEntity('Invalid confirmation token');
    }
    let User = this.modelFor(params.modelName);
    let user = await User.find(token.userId);
    await user.confirmEmail(token);
    return new Response(204);
  }

}
