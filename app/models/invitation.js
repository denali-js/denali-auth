import { attr } from 'denali';
import Token from './token';

export default class Invite extends Token {

  static used = attr('boolean');
  static usedAt = attr('date');

}
