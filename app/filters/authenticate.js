import { Filter, Errors, inject } from 'denali';

export default Filter.extend({

  name: 'denali-can:authorize',

  authentication: inject('service:authentication'),

  before() {
    let headerValue = this.request.get('Authorization');
    if (headerValue) {
      let [ scheme, value ] = headerValue.split(' ');
      if (scheme === 'AUTHTOKEN') {
        return this.authentication.adapter().lookupAuthtokenAndUser(value).then(({ user, authtoken }) => {
          this.user = user;
          this.authtoken = authtoken;
          return this.authentication.adapter().renewAuthtokenExpiration(authtoken);
        });
      }
      this.render(new Errors.BadRequest(`Unsupported Authorization header scheme: "${ scheme }". Only AUTHTOKEN is supported.`));
    }
  }

});
