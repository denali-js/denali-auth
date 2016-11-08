import { mixin, Action, Response, Errors } from 'denali';
import { Authenticate } from '../../../../lib';

export default class CreateSessionAction extends mixin(Action, Authenticate()) {

  serializer = 'session';

  async respond() {
    let session = await this.currentUser.createSession();
    return new Response(201, session);
  }

}
