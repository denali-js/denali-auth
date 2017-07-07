import { Action } from 'denali';
import { authenticate } from '../../../lib';
import { mix } from 'denali-typescript';

export default class SendInvitationAction extends mix(Action).add(authenticate) {

  async respond(params: any) {
    let email = params.email;
    let User = this.modelFor(params.modelName);
    return User.invite(email, this.currentUser);
  }

}
