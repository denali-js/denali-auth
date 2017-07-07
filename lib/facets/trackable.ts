import { createMixin, attr, Model, Action } from 'denali';
import * as createDebug from 'debug';
import SessionableMixin from './sessionable';
import { returnof } from 'denali-typescript';

const debug = createDebug('denali-auth:trackable');
const Sessionable = returnof(SessionableMixin._factory, Model);

export default createMixin((BaseModel: typeof Sessionable) =>
  class TrackableMixin extends BaseModel {

    static isTrackable = true;

    static lastLoginAt = attr('date');
    static lastIp = attr('text');
    static loginCount = attr('number');

    async login(action: Action, params: any) {
      debug('updating tracking data for current user');
      let session = await super.login(action, params);
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
