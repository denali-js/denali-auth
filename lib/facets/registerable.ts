import { createMixin, Model } from 'denali';
import * as createDebug from 'debug';

const debug = createDebug('denali-auth:registerable');

export default createMixin((BaseModel: typeof Model) => {
  return class RegisterableMixin extends BaseModel {

    static isRegisterable = true;

    static async register(attributes: any) {
      let user = await this.create(attributes);
      debug(`registering ${ this.type }: %o`, user);
      return user;
    }

  };
});
