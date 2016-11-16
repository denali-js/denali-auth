import { Action, Response } from 'denali';

export default class CreateRegistration extends Action {

  async respond(params) {
    let User = this.modelFor(params.modelName);
    let attributes = params.data.attributes;
    let user = await User.register(attributes);
    return new Response(201, user);
  }

}
