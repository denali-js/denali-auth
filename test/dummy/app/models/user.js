import { attr, mixin, Model } from 'denali';
import {
  authenticatable,
  registerable,
  sessionable,
  passwordable,
  oauthable,
  confirmable,
  lockable,
  resetable,
  fetchable,
  trackable } from 'denali-auth';

export default class UserModel extends mixin(Model,
  authenticatable(),
  registerable(),
  sessionable(),
  oauthable({ providers: [ 'facebook' ] }),
  passwordable(),
  confirmable(),
  lockable(),
  resetable(),
  fetchable(),
  trackable()
) {

  static firstName = attr('text');
  static lastName = attr('text');

}
