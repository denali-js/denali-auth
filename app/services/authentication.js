import { Service, Errors } from 'denali';
import bcrypt from 'bcryptjs';
import { promisifyAll, reject } from 'bluebird';

promisifyAll(bcrypt);

export default Service.extend({

  adapter() {
    if (!this._adapter) {
      let adapter = this.container.lookup('config:auth-adapter');
      if (!adapter) {
        throw new Error('You must supply an AuthAdapter at config/auth-adapter to tell denali-auth how to interact with your ORM.');
      }
      this._adapter = adapter;
    }
    return this._adapter;
  },

  login(credentials) {
    let adapter = this.adapter();
    return adapter.findUserWithEmail(credentials.email).then((user) => {
      if (!user) {
        return reject(new Errors.Unauthorized('No user with that email'));
      }
      return bcrypt.compareAsync(credentials.password, user.hashedPassword)
        .then((isCorrectPassword) => {
          if (!isCorrectPassword) {
            return reject(new Errors.Unauthorized('Incorrect password'));
          }
          return adapter.createAuthtokenFor(user);
        });
    });
  },

  logout(authtoken) {
    return this.adapter().destroyAuthtoken(authtoken);
  }

});
