import assert from 'assert';
import { Test } from 'denali';

const { lookup, state, removeHeader } = Test.helpers;

export default function logout() {
  assert(state.authtoken, 'Cannot logout - no authtoken found on the global test state');
  assert(state.user, 'Cannot logout - no user found on the global test state');
  const adapter = lookup('config:auth-adapter');
  return adapter.destroyAuthtoken(state.authtoken)
    .then(() => {
      delete state.authtoken;
      delete state.user;
      removeHeader('Authorization');
    });
}
