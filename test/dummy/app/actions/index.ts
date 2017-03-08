import { Action, mixin, Response } from 'denali';
import { authenticate } from 'denali-auth';

export default class IndexAction extends mixin(Action, authenticate()) {

  respond() {
    return new Response(200, { hello: 'world' }, { raw: true });
  }

}
