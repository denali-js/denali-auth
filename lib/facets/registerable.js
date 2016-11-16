import { createMixin } from 'denali';
import createDebug from 'debug';

const debug = createDebug('denali-auth:registerable');

export default createMixin((MixinBase) => {
  return class RegisterableMixin extends MixinBase {

    static isRegisterable = true;

    static async register(attributes) {
      let user = await this.create(attributes);
      debug(`registering ${ this.type }: %o`, user);
      return user;
    }

  };
});
