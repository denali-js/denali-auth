import { mixin, Action, Response } from 'denali';
import { authenticate } from '../../../../lib';

export default class CreateSessionAction extends mixin(Action, authenticate()) {

  serializer = 'session';

  async respond() {
    let session = await this.currentUser.createSession();
    return new Response(201, session);
  }

}
