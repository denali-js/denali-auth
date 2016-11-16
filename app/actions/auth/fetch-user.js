import { mixin, Action } from 'denali';
import { authenticate } from '../../../lib';

export default class FetchUserAction extends mixin(Action, authenticate()) {

  async respond() {
    return this.currentUser;
  }

}
