import { createMixin, attr } from 'denali';
import createDebug from 'debug';

const debug = createDebug('denali-auth:trackable');

export default createMixin((MixinBase) =>
  class TrackableMixin extends MixinBase {

    static isTrackable = true;

    static lastLoginAt = attr('date');
    static lastIp = attr('date');
    static loginCount = attr('date');

    async login(action) {
      debug('updating tracking data for current user');
      let session = await super.login(...arguments);
      let user = await session.getUser();
      user.lastLoginAt = new Date();
      user.lastIp = action.request.ip;
      if (user.loginCount == null) {
        user.loginCount = 0;
      }
      user.loginCount += 1;
      user.save();
      return session;
    }

    // TODO: need a way to hook into successful request auths
    // static async authenticateRequest() {
    //   let user = await super.authenticateRequest(...arguments);
    //   user.lastSeen = new Date();
    //   user.save();
    //   return user;
    // }

  }
);
