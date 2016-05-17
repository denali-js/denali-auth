import { inject, Action } from 'denali';

export default Action.extend({

  adapter: inject('config:adapters/auth'),

  respond(params) {
    this.render(this.adapter().findAuthtoken(params.id));
  }

});
