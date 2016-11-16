import { FlatSerializer } from 'denali';
import { kebabCase } from 'lodash';

export default class SessionSerializer extends FlatSerializer {

  static attributes = [
    'token',
    'expiresAt'
  ]

  static serializeAttributeName(name) {
    return kebabCase(name);
  }

}
