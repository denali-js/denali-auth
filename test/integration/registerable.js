import { setupApp } from 'denali';
import expect from 'must';

describe('Registerable', function() {

  setupApp();

  it('should allow users to register', function() {
    let newUser = {
      data: {
        type: 'user',
        attributes: {
          email: 'dave@example.com',
          password: '123'
        }
      }
    };
    return this.app.post('/users/auth/register', newUser)
      .then(({ status, body }) => {
        expect(status).to.be(201);
        expect(body.data.attributes.email).to.equal('dave@example.com');
        expect(body.data.attributes).to.not.have.property('password');
      });
  });

  it('should reject registration payloads without an email', function() {
    let newUser = {
      data: {
        type: 'user',
        attributes: {
          password: '123'
        }
      }
    };
    return this.app.post('/users/auth/register', newUser)
      .then(({ status }) => {
        expect(status).to.be(422);
      });
  });

  it('should reject registration payloads without a password', function() {
    let newUser = {
      data: {
        type: 'user',
        attributes: {
          email: 'dave@example.com'
        }
      }
    };
    return this.app.post('/users/auth/register', newUser)
      .then(({ status }) => {
        expect(status).to.be(422);
      });
  });

});

