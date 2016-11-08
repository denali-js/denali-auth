import { createMixin, attr, Errors } from 'denali';
import moment from 'moment';

export default createMixin((MixinBase) =>
  class LockableMixin extends MixinBase {

    static isLockable = true;

    static lockedOut = attr('boolean');
    static lastAuthenticationAttempt = attr('date');
    static failedAuthenticationAttempts = attr('integer');

    async authenticate() {
      if (this.failedAuthenticationAttempts > 0) {
        let delay = this.calculateDelay(this.failedAuthenticationAttempts);
        let unlockTime = moment(this.lastAuthenticationAttempt).add(delay, 'seconds');
        let timeTillUnlocked = unlockTime - moment();
        if (timeTillUnlocked > 0) {
          throw new Errors.Forbidden(`This account is temporarily locked after too many failed attempts at authentication. Please wait ${ moment.duration(timeTillUnlocked).humanize() }`);
        }
      }
      try {
        await super.authenticate();
      } catch (error) {
        if (error instanceof Errors.Unauthorized) {
          this.failedAuthenticationAttempts += 1;
          await this.save();
        }
        throw error;
      }
    }

    authenticationDelay(attempts) {
      let delay = 0.5 * (Math.pow(2, attempts) - 1);
      let max = options.maxLockoutDelay || moment.duration(30, 'minutes');
      return Math.min(max, delay * 1000);
    }

  }
);
