import { Action, Response, Errors } from 'denali';

export default class SendEmailConfirmation extends Action {

  respond(params) {
    let unconfirmedEmail = params.email;
    let User = params.modelType;
    return User.find({ unconfirmedEmail }).then((user) => {
      if (!user) {
        throw new Errors.NotFound('That email is either already confirmed, or not on file for an existing user');
      }
      return user.sendConfirmationEmail(unconfirmedEmail);
    }).return(new Response(204));
  }

}

