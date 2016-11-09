import { Model, attr, hasOne } from 'denali';
import uuid from 'node-uuid';

export default class Session extends Model {

  static user = hasOne('user');
  static token = attr('text');
  static expiresAt = attr('date');

  save() {
    if (!this.token) {
      this.token = uuid();
    }
    return super.save(...arguments);
  }

}
