import { createMixin, hasMany, Errors } from 'denali';
import capitalize from 'lodash/capitalize';
import cookie from 'cookie';

export default createMixin((options) => {
  let allowedTransports = options.transports || [ 'header' ];
  let allowedHeaderSchemes = options.schemes || [ 'AUTHTOKEN' ];
  let sessionKey = options.sessionKey || 'authtoken';

  return class SessionableMixin {

    static isSessionable = true;
    static authenticateType = 'session';

    static sessionTokens = hasMany('session-token');

    authenticateRequest(action) {
      let sessionId = this.extractSessionId(action, allowedTransports);
      if (!sessionId) {
        throw new Errors.Unauthorized('No credentials provided.');
      }
      let SessionToken = this.modelFor('session-token');
      return SessionToken.find(sessionId).then((token) => {
          if (!token) {
            throw new Errors.Unauthorized('Invalid or expired session token');
          }
          token.expiresAt = moment() + expiresAfter;
          token.save();
        });
    }

    extractSessionId(action, transports) {
      for (let i = 0; i < transports.length; i++) {
        let transport = transports[i];
        let transportExtractor = this[`extract${ capitalize(transport) }`];
        let sessionId = transportExtractor(action);
        if (sessionId) {
          return sessionId;
        }
      }
      return false;
    }

    extractHeader(action) {
      let authorizationHeader = action.request.get('authorization') || '';
      let [ scheme, sessionId ] = authorizationHeader.split(' ');
      if (!allowedHeaderSchemes.includes(scheme)) {
        return false;
      }
      return sessionId || false;
    }

    extractCookie(action) {
      let cookies = action.request.get('cookie') || '';
      if (!cookies) {
        return false;
      }
      cookies = cookie.parse(cookies);
      return cookies[sessionKey] || false;
    }

    extractQuery(action) {
      let query = action.request.query;
      if (!query[sessionKey]) {
        return false;
      }
      return query[sessionKey] || false;
    }

    createSession() {
      let SessionToken = this.modelFor('session-token');
      let token = new SessionToken({ target: this });
      return token.save();
    }

  };
});
