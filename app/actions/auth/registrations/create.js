import { Errors, Action, Response } from 'denali';

export default class CreateRegistration extends Action {

  async respond(params) {
    let User = this.modelFor(params.modelName);
    let attributes = params.data.attributes;

    if (!attributes[User.usernameField]) {
      throw new Errors.UnprocessableEntity(`Missing ${ User.usernameField }`);
    }
    if (!attributes.password) {
      throw new Errors.UnprocessableEntity(`Missing password`);
    }

    let user = await User.create(attributes);
    return new Response(201, user);
  }

}
