import { Action, mixin } from 'denali';
import { authenticate } from 'denali-auth';

export default class SendInvitationAction extends mixin(Action, authenticate()) {

  async respond(params) {
    let email = params.email;
    let User = this.modelFor(params.modelName);
    return User.invite(email, this.currentUser);
  }

}
