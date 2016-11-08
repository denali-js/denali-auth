import { createMixin, hasMany, Errors } from 'denali';
import capitalize from 'lodash/capitalize';
import moment from 'moment';
import cookie from 'cookie';

export default createMixin((MixinBase, options = {}) => {
  let allowedTransports = options.transports || [ 'header' ];
  let allowedHeaderSchemes = options.schemes || [ 'TOKEN' ];
  let sessionKey = options.sessionKey || 'authtoken';
  let sessionTTL = options.sessionTTL || moment.duration(2, 'weeks').as('s');

  return class SessionableMixin extends MixinBase {

    static isSessionable = true;
    static authenticationStrategyName = 'session';

    static sessionTTL = sessionTTL;
    static sessions = hasMany('session');

    static async authenticateRequest(action) {
      let sessionToken = this.extractSessionToken(action, allowedTransports);
      if (!sessionToken) {
        throw new Errors.Unauthorized('No credentials provided.');
      }
      let Session = this.modelFor('session');
      let session = await Session.find({ token: sessionToken });
      if (!session) {
        throw new Errors.Unauthorized('Invalid or expired session token');
      }
      action.session = session;
      session.expiresAt = moment().add(sessionTTL, 'seconds').toDate();
      return session.save();
    }

    static extractSessionToken(action, transports) {
      for (let i = 0; i < transports.length; i++) {
        let transport = transports[i];
        let transportExtractor = this[`extract${ capitalize(transport) }`];
        let sessionToken = transportExtractor(action);
        if (sessionToken) {
          return sessionToken;
        }
      }
      return false;
    }

    static extractHeader(action) {
      let authorizationHeader = action.request.get('authorization') || '';
      let [ scheme, sessionToken ] = authorizationHeader.split(' ');
      if (!allowedHeaderSchemes.includes(scheme)) {
        return false;
      }
      return sessionToken || false;
    }

    static extractCookie(action) {
      let cookies = action.request.get('cookie') || '';
      if (!cookies) {
        return false;
      }
      cookies = cookie.parse(cookies);
      return cookies[sessionKey] || false;
    }

    static extractQuery(action) {
      let query = action.request.query;
      if (!query[sessionKey]) {
        return false;
      }
      return query[sessionKey] || false;
    }

    createSession() {
      let Session = this.modelFor('session');
      let session = new Session({
        userId: this.id,
        expiresAt: moment().add(sessionTTL, 'seconds').toDate()
      });
      return session.save();
    }

  };
});
