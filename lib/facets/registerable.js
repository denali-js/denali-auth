import { createMixin, attr } from 'denali';

export default createMixin((MixinBase, options = {}) => {
  let usernameField = options.usernameField || 'email';

  return class RegisterableMixin extends MixinBase {
    static isRegisterable = true;
    static usernameField = usernameField;
    static [usernameField] = attr('text');
  }
});
