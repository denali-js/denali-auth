import { attr, mixin, Model } from 'denali';
import { registerable, sessionable, passwordable } from 'denali-auth';

export default class UserModel extends mixin(Model,
  registerable(),
  passwordable(),
  sessionable()
) {

  static firstName = attr('text');
  static lastName = attr('text');

}
