import { Action, Response, mixin } from 'denali';
import { Authenticate } from '../../../index';

export default class DeleteSessionAction extends mixin(Action, Authenticate()) {

  serializer = 'session';

  async respond(params) {
    await this.session.delete();
    return new Response(204);
  }

}
