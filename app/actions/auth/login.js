import { mixin, Action, Response } from 'denali';
import { authenticate } from '../../../lib';

export default class LoginAction extends mixin(Action,
  authenticate({ allowedStrategies: 'all' })
) {

  serializer = 'session';

  async respond(params) {
    let session = await this.currentUser.login(this, params);
    return new Response(201, session);
  }

}
