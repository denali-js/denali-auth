import { Action, Response } from 'denali';
import { mix } from 'denali-typescript';
import { authenticate } from '../../../lib';

export default class LoginAction extends mix(Action).add(authenticate({ allowedStrategies: 'all' })) {

  serializer = 'session';

  async respond(params: any) {
    let session = await this.currentUser.login(this, params);
    return new Response(201, session);
  }

}
