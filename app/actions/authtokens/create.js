import { inject, Action } from 'denali';

export default Action.extend({

  authentication: inject('service:authentication'),

  respond(credentials) {
    return this.authentication.login(credentials).then((authtoken) => {
      this.render(201, authtoken);
    });
  }

});


// LEFT OFF - update for latest denali
// Also - check how devise structures things (other auth frameworks too)? What
// is a good way to separate concerns here
