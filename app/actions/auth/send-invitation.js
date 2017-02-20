import { Action } from 'denali';
import { authenticate } from '../../../lib';

export default class SendInvitationAction extends Action.mixin(authenticate) {

  async respond(params) {
    let email = params.email;
    let User = this.modelFor(params.modelName);
    return User.invite(email, this.currentUser);
  }

}
