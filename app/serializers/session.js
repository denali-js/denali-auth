import { FlatSerializer } from 'denali';
import { kebabCase } from 'lodash';

export default class SessionSerializer extends FlatSerializer {

  attributes = [
    'token',
    'expiresAt'
  ]

  serializeAttributeName(name) {
    return kebabCase(name);
  }

}
