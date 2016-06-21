import { expect, Action, Response } from 'denali';

export default class CreateRegistration extends Action {

  respond(params) {
    let User = this.modelFor(params.modelName);
    let attributes = params.data.attributes;

    expect(attributes[User.usernameField], User.usernameField);

    if (User.isPasswordable) {
      expect(attributes.password, 'password');
    }

    return User.create(attributes).then((user) => {
      return new Response(201, user);
    });
  }

}

