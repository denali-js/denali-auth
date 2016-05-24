import { Action, Response } from 'denali';

export default class CreateRegistration extends Action {

  respond(params) {
    let User = this.modelFor(params.modelName);
    return User.create(params);
  }

}

