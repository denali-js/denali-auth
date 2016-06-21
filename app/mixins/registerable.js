import { createMixin, attr } from 'denali';

export default createMixin((MixinBase, options = {}) => {
  let usernameField = options.usernameField || 'email';

  class RegisterableMixin extends MixinBase {
    static isRegisterable = true;
    static usernameField = usernameField;
  }

  RegisterableMixin[usernameField] = attr('text');

  return RegisterableMixin;
});

