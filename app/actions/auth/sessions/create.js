import { mixin, Action, Response, Errors } from 'denali';
import { Authenticate } from '../../../index';

export default class CreateSessionAction extends mixin(Action, Authenticate()) {

  protected = true;

  serializer = 'session';

  respond(params) {
    let user = this.currentUser;
    return user.createSession().then((session) => {
      return new Response(201, session);
    });
  }

}
