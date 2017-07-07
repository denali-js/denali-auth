import { Action } from 'denali';
import { mix } from 'denali-typescript';
import { authenticate } from '../../../lib';

export default class FetchUserAction extends mix(Action).add(authenticate) {

  async respond() {
    return this.currentUser;
  }

}
