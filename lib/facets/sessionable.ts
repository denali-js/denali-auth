import { Errors, createMixin, hasMany, Model, Action } from 'denali';
import * as moment from 'moment';
import * as cookie from 'cookie';
import * as createDebug from 'debug';
import {
  upperFirst,
  defaults
} from 'lodash';

const debug = createDebug('denali-auth:sessionable');

export default createMixin((BaseModel: typeof Model, options = {}) => {
  options = defaults(options, {
    transports: [ 'header' ],
    schemes: [ 'TOKEN' ],
    cookieName: 'session',
    queryParam: 'session',
    ttl: moment.duration(2, 'weeks')
  });

  return class SessionableMixin extends BaseModel {

    static isSessionable = true;
    static strategyName = 'session';

    static sessions = hasMany('session');

    async canLogin(action: Action, params: any) {
      return true;
    }

    async login(action: Action, params: any) {
      await this.canLogin(action, params);
      let Session = this.modelFor('session');
      let session = new Session({
        userId: this.id,
        userType: this.type,
        expiresAt: moment().add(options.sessionTTL, 'seconds').toDate()
      });
      return session.save();
    }

    static async authenticateRequest(action: Action) {
      debug(`[${ action.request.id }]: attempting to authenticate via session token`);
      let token = this.extractSessionToken(action);
      if (!token) {
        throw new Errors.Unauthorized(`No session credentials found. Allowed session transports: ${ options.transports.join(', ') }`);
      }
      let Session = action.modelFor('session');
      let session = await Session.findOne({ token });
      if (!session) {
        throw new Errors.Unauthorized('Invalid or expired session token');
      }
      action.session = session;
      session.expiresAt = moment().add(options.sessionTTL, 'seconds').toDate();
      session.save();
      return session.getUser();
    }

    static extractSessionToken(action: Action) {
      for (let transport of options.transports) {
        let extractor = (<any>this)[`extract${ upperFirst(transport) }`];
        let result = extractor.call(this, action);
        if (result) {
          return result;
        }
      }
    }

    static extractHeader(action: Action) {
      let authorizationHeader = action.request.get('authorization') || '';
      let [ scheme, sessionToken ] = authorizationHeader.split(' ');
      if (options.schemes.includes(scheme)) {
        return sessionToken;
      }
    }

    static extractCookie(action: Action) {
      let cookies = action.request.get('cookie');
      if (cookies) {
        return cookie.parse(cookies)[options.cookieName];
      }
    }

    static extractQuery(action: Action) {
      return action.request.query[options.queryParam];
    }

  };
});
