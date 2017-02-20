import { Action, Response } from 'denali';
import { authenticate } from '../../../lib';

export default class DeleteSessionAction extends Action.mixin(authenticate) {

  async respond() {
    await this.session.delete();
    return new Response(204);
  }

}
