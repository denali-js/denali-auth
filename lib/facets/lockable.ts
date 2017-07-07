import {
  defaults
} from 'lodash';
import { createMixin, attr, Errors, Model } from 'denali';
import * as assert from 'assert';
import * as moment from 'moment';
import * as createDebug from 'debug';
import { returnof } from 'denali-typescript';
import PasswordableMixin from './passwordable';

const debug = createDebug('denali-auth:lockable');
const Passwordable = returnof(PasswordableMixin._factory, Model);

export default createMixin((BaseModel: typeof Passwordable, options = {}) => {
  options = defaults(options, {
    maxLockoutDelay: 1000 * 60 * 60 * 3 // 3h
  });

  assert(BaseModel.isPasswordable, 'The lockable mixin must be applied after the passwordable mixin');

  return class LockableMixin extends BaseModel {

    static isLockable = true;

    static lockedOut = attr('boolean');
    static lastAuthenticationAttempt = attr('date');
    static failedAuthenticationAttempts = attr('number');

    // Override the password checker used by passwordable. First, immediately
    // fail if there are too many failed requests. If not, then check the
    // password with the original checker implementation, and record failures
    async isCorrectPassword(password: string) {
      if (this.failedAuthenticationAttempts > 0) {
        let delay = this.authenticationDelay(this.failedAuthenticationAttempts);
        debug(`enforcing ${ delay }ms delay with ${ this.failedAuthenticationAttempts } failed attempts`);
        let unlockTime = moment(this.lastAuthenticationAttempt).valueOf() + delay;
        let timeTillUnlocked = unlockTime - moment().valueOf();
        if (timeTillUnlocked > 0) {
          debug(`blocking login attempt - account is locked for another ${ timeTillUnlocked }ms`);
          throw new Errors.TooManyRequests(`This account is temporarily locked after too many failed attempts at authentication. Please wait ${ moment.duration(timeTillUnlocked).humanize() } and try again.`);
        }
      }
      let isCorrect = await super.isCorrectPassword(password);
      if (!isCorrect) {
        debug('authentication failed, incrementing failure counter');
        if (Number.isNaN(this.failedAuthenticationAttempts)) {
          this.failedAuthenticationAttempts = 0;
        }
        this.failedAuthenticationAttempts += 1;
        await this.save();
      } else if (this.failedAuthenticationAttempts > 0) {
        debug('authentication succeeded, resetting failure counter');
        this.failedAuthenticationAttempts = 0;
        this.lastAuthenticationAttempt = null;
        await this.save();
      }
      return isCorrect;
    }

    authenticationDelay(attempts: number) {
      let delay = Math.pow(attempts, 1.2) - 4; // y = 1.2^x - 4
      return Math.min(options.maxLockoutDelay, delay * 1000);
    }

  };
});
