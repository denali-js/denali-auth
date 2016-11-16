import { Errors, createMixin, hasMany } from 'denali';
import moment from 'moment';
import cookie from 'cookie';
import createDebug from 'debug';
import upperFirst from 'lodash/upperFirst';
import defaults from 'lodash/defaults';

const debug = createDebug('denali-auth:sessionable');

export default createMixin((MixinBase, options = {}) => {
  options = defaults(options, {
    transports: [ 'header' ],
    schemes: [ 'TOKEN' ],
    cookieName: 'session',
    queryParam: 'session',
    ttl: moment.duration(2, 'weeks')
  });

  return class SessionableMixin extends MixinBase {

    static isSessionable = true;

    static sessions = hasMany('session');

    async canLogin() {
      return true;
    }

    async login(action, params) {
      await this.canLogin(action, params);
      let Session = this.modelFor('session');
      let session = new Session({
        userId: this.id,
        userType: this.constructor.type,
        expiresAt: moment().add(options.sessionTTL, 'seconds').toDate()
      });
      return session.save();
    }

    static async authenticateRequest(action) {
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

    static extractSessionToken(action) {
      for (let transport of options.transports) {
        let extractor = this[`extract${ upperFirst(transport) }`];
        let result = extractor.call(this, action);
        if (result) {
          return result;
        }
      }
    }

    static extractHeader(action) {
      let authorizationHeader = action.request.get('authorization') || '';
      let [ scheme, sessionToken ] = authorizationHeader.split(' ');
      if (options.schemes.includes(scheme)) {
        return sessionToken;
      }
    }

    static extractCookie(action) {
      let cookies = action.request.get('cookie');
      if (cookies) {
        return cookie.parse(cookies)[options.cookieName];
      }
    }

    static extractQuery(action) {
      return action.request.query[options.queryParam];
    }

  };
});
