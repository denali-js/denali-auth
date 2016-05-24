import { Action, Response } from 'denali';

export default class ConfirmEmailAction extends Action {

  respond(params) {
    let ConfirmationToken = this.modelFor('confirmation-token');
    let token;
    return ConfirmationToken.find(params.token)
      .then((t) => {
        if (!t) {
          throw new Error.UnprocessableEntity('Invalid confirmation token');
        }
        token = t;
        return token.user();
      }).then((user) => {
        return user.confirmEmail(token);
      }).then(() => {
        return new Response(204);
      });
  }

}
