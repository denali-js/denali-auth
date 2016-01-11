import { inject, Action } from 'denali';
// import Validate from 'denali-validation';

export default Action.extend(/* Validate, */{

  authentication: inject('service:authentication'),

  expect: {
    wrapper: false,
    required: [ 'email', 'password' ],
    properties: {
      email: { type: 'string', minLength: 3, pattern: /.+@.+/ },
      password: { type: 'string', minLength: 1 }
    }
  },

  respond(credentials) {
    return this.authentication.login(credentials).then((authtoken) => {
      this.render(201, authtoken);
    });
  }

});
