import { Errors, Action } from 'denali';

export default Action.extend({

  respond() {
    this.render(new Errors.MethodNotAllowed());
  }

});
