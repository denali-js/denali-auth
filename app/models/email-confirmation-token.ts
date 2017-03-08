import { attr } from 'denali';
import Token from './token';

export default class EmailConfirmationToken extends Token {
  static email = attr('text');
}
