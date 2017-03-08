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
import moment from 'moment';

export default class User extends mixin(Model,
  authenticatable(),
  registerable(),
  sessionable(),
  oauthable({ providers: [ 'facebook' ] }),
  passwordable(),
  confirmable({
    lockoutAfter: moment.duration(7, 'days')
  }),
  lockable(),
  resetable(),
  fetchable(),
  trackable()
) {

  static firstName = attr('text');
  static lastName = attr('text');

}
