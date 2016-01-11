import { inject, Action } from 'denali';

export default Action.extend({

  authentication: inject('service:authentication'),

  respond(params) {
    this.render(this.authentication.adapter().findAuthtoken(params.id));
  }

});
