import { createMixin, attr } from 'denali';

export default createMixin((options) => {
  class RegisterableMixin {

    static isRegisterable = true;

  }

  RegisterableMixin[options.idField || 'email'] = attr('text');

  return RegisterableMixin;
});

