import expect from 'must';

export default function login(app, loginCredentials) {
  return app.post('/users/auth/sessions', loginCredentials)
    .then(({ status, body }) => {
      expect(status).to.be(201);
      expect(body).to.have.property('token');
      app.session = body;
      app.setHeader('Authorization', `TOKEN ${ body.token }`);
    });
}
