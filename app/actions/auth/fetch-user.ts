import { Action } from 'denali';
import { authenticate } from '../../../lib';

export default class FetchUserAction extends Action.mixin(authenticate) {

  async respond() {
    return this.currentUser;
  }

}
