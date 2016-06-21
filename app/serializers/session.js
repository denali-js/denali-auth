import { FlatSerializer } from 'denali';
import { kebabCase } from 'lodash';

export default class SessionSerializer extends FlatSerializer {

  static attributes = [
    'id',
    'token',
    'expiresAt'
  ]

  static serializeAttributeName(name) {
    return kebabCase(name);
  }

}
