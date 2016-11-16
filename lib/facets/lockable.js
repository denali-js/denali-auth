import { createMixin, attr, Errors } from 'denali';
import assert from 'assert';
import moment from 'moment';
import defaults from 'lodash/defaults';
import createDebug from 'debug';

const debug = createDebug('denali-auth:lockable');

export default createMixin((MixinBase, options = {}) => {
  options = defaults(options, {
    maxLockoutDelay: 1000 * 60 * 60 * 3 // 3h
  });

  assert(MixinBase.isPasswordable, 'The lockable mixin must be applied after the passwordable mixin');

  return class LockableMixin extends MixinBase {

    static isLockable = true;

    static lockedOut = attr('boolean');
    static lastAuthenticationAttempt = attr('date');
    static failedAuthenticationAttempts = attr('integer');

    // Override the password checker used by passwordable. First, immediately
    // fail if there are too many failed requests. If not, then check the
    // password with the original checker implementation, and record failures
    async isCorrectSecret() {
      debug('checking for lockout delay');
      if (this.failedAuthenticationAttempts > 0) {
        let delay = this.authenticationDelay(this.failedAuthenticationAttempts);
        debug(`${ this.failedAuthenticationAttempts } failed authentication attempts, enforcing ${ delay }ms delay`);
        let unlockTime = moment(this.lastAuthenticationAttempt) + delay;
        let timeTillUnlocked = unlockTime - moment();
        if (timeTillUnlocked > 0) {
          throw new Errors.Forbidden(`This account is temporarily locked after too many failed attempts at authentication. Please wait ${ moment.duration(timeTillUnlocked).humanize() } and try again.`);
        }
      }
      let isCorrect = await super.isCorrectSecret(...arguments);
      if (!isCorrect) {
        this.failedAuthenticationAttempts += 1;
        await this.save();
      } else if (this.failedAuthenticationAttempts > 0) {
        this.failedAuthenticationAttempts = 0;
        this.lastAuthenticationAttempt = null;
        await this.save();
      }
      return isCorrect;
    }

    authenticationDelay(attempts) {
      let delay = Math.pow(1.2, attempts) - 4; // y = 1.2^x - 4
      return Math.min(options.maxLockoutDelay, delay * 1000);
    }

  };
});
