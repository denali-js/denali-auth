import { Model, attr } from 'denali';
import uuid from 'node-uuid';

export default class Session extends Model {

  static userId = attr('text');
  static token = attr('text');
  static expiresAt = attr('date');

  save() {
    if (!this.token) {
      this.token = uuid();
    }
    return super.save(...arguments);
  }

}
