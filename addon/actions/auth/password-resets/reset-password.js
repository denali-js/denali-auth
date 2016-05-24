import { Action, Response } from 'denali';

export default class ResetPasswordAction extends Action {

  respond(params) {
    let ResetToken = this.modelFor('reset-token');
    let token;
    return ResetToken.find(params.token)
      .then((t) => {
        if (!t) {
          throw new Error.UnprocessableEntity('Invalid reset token');
        }
        token = t;
        return token.user();
      })
      .then((user) => user.resetToken(token))
      .return(new Response(204));
  }

}

