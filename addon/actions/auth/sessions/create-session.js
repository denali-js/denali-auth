import { Action, Response, Errors } from 'denali';

export default class CreateSessionAction extends Action {

  respond(params) {
    let user = this.currentUser;
    return user.createSession();
  }

}



