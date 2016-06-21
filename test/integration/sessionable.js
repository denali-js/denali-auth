import { setupApp } from 'denali';
import { login } from '../helpers';
import expect from 'must';

describe('Sessionable', function() {

  setupApp();

  let loginCredentials = {
    email: 'dave@example.com',
    password: '123'
  };

  before(function() {
    return this.app.post('/users/auth/register', {
      data: {
        type: 'user',
        attributes: loginCredentials
      }
    });
  });

  describe('logging in', function() {

    it('should allow users to create a session (login)', function() {
      return this.app.post('/users/auth/sessions', loginCredentials)
        .then(({ status, body }) => {
          expect(status).to.be(201);
          expect(body).to.have.property('token');
          expect(body).to.not.have.property('password');
        });
    });

  });

  describe('logging out', function() {

    beforeEach(function() {
      return login(this.app, loginCredentials);
    });

    it('should allow users to delete a session (logout)', function() {
      return this.app.delete('/users/auth/sessions')
        .then(({ status }) => {
          expect(status).to.be(204);
        });
    });

    it('should fail if not logged in');

  });

});

