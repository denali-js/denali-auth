import { attr, hasOne, hasMany, mixin, Model } from 'denali';
import {
  Registerable,
  Sessionable,
  Passwordable } from '../../../../app';

export default class UserModel extends mixin(Model,
  Registerable(),
  Passwordable(),
  Sessionable()
) {

  static firstName = attr('text');
  static lastName = attr('text');

}

