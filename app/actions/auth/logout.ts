import { Action, Response } from 'denali';
import { authenticate } from '../../../lib';
import { mix } from 'denali-typescript';

export default class DeleteSessionAction extends mix(Action).add(authenticate) {

  async respond() {
    await this.session.delete();
    return new Response(204);
  }

}
