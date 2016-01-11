import assert from 'assert';
import { Test } from 'denali';

const { state, request, setHeader, lookup } = Test.helpers;

export default function login(credentials) {
  assert(state.user, 'Cannot login: there is already an active user that was not cleaned up.');
  const adapter = lookup('config:auth-adapter');

  return request('post', '/authtokens', {
    data: credentials
  }).then(({ body }) => {
    let authtokenId = body.data.id;
    setHeader('Authorization', 'AUTHTOKEN ' + authtokenId);
    return adapter.findAuthtoken(authtokenId);
  }).then((authtoken) => {
    assert(authtoken, `Unable to find authtoken after creating it - there is likely a bug with authtoken creation.`);
    state.authtoken = authtoken;
    return adapter.findUserWithEmail(credentials.email);
  }).then((user) => {
    assert(user, `login() helper failed: Unable to find a user account with the email you provided. Are you sure you created that user before attempting this login?`);
    state.user = user;
  }).catch((error) => {
    console.log(`login() helper failed: ${ error.stack || error.stacktrace || error.message }`);
    throw error;
  });
}
