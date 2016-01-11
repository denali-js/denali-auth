import { inject, Action } from 'denali';

export default Action.extend({

  authentication: inject('services:authentication'),

  respond(params) {
    return this.authentication.logout(params.id)
      .then(() => {
        return this.response.status(204).end();
      });
  }

});
