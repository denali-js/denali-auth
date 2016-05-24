import { Action, Response, Errors } from 'denali';

export default class SendResetPassword extends Action {

  respond(params) {
    let email = params.email;
    let User = params.modelType;
    return User.find({ email }).then((user) => {
        if (!user) {
          throw new Errors.NotFound('No such user');
        }
        return user.sendResetPasswordEmail();
      }).return(new Response(204));
  }

}


