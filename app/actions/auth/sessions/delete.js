import { Action, Response, mixin } from 'denali';
import { Authenticate } from '../../../index';

export default class DeleteSessionAction extends mixin(Action, Authenticate()) {

  serializer = 'session';

  respond(params) {
    return this.session.delete().then(() => {
      return new Response(204);
    });
  }

}
