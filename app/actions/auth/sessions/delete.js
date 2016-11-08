import { Action, Response, mixin } from 'denali';
import { authenticate } from '../../../../lib';

export default class DeleteSessionAction extends mixin(Action, authenticate()) {

  serializer = 'session';

  async respond() {
    await this.session.delete();
    return new Response(204);
  }

}
