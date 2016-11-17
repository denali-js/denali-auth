import { attr } from 'denali';
import Token from './token';

export default class Invitation extends Token {

  static used = attr('boolean');
  static usedAt = attr('date');

}
