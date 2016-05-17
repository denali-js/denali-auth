const { Service, Errors } = require('denali');
const bcrypt = require('bcryptjs');
const { promisifyAll, reject } = require('bluebird');
const once = require('lodash/once');

promisifyAll(bcrypt);

export default Service.extend({

  adapter: inject('config:adapters/auth'),

  login(credentials) {
    return this.store().find('user', { username: credentials.username }).then((user) => {
      return bcrypt.compareAsync(credentials.password, user.get('hashedPassword'))
        .then((isCorrectPassword) => {
          if (!isCorrectPassword) {
            return reject(new Errors.Unauthorized('Incorrect password'));
          }
          return this.store().create('authtoken', { user });
        });
    });
  },

  logout(authtoken) {
    return authtoken.delete();
  }

});
