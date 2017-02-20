import { Action, Response } from 'denali';
import { authenticate } from '../../../lib';

export default class LoginAction extends Action.mixin(authenticate({ allowedStrategies: 'all' })) {

  serializer = 'session';

  async respond(params) {
    let session = await this.currentUser.login(this, params);
    return new Response(201, session);
  }

}
