import { attr, mixin, Model } from 'denali';
import {
  authenticatable,
  registerable,
  sessionable,
  passwordable,
  invitable,
  fetchable } from 'denali-auth';

export default class InvitableUser extends mixin(Model,
  authenticatable(),
  registerable(),
  sessionable(),
  passwordable(),
  fetchable(),
  invitable()
) {

  static firstName = attr('text');
  static lastName = attr('text');

}
