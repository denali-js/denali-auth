import { pluralize } from 'inflection';

/**
 * Generate any routes needed based on the facets applied to the given model.
 * @param  {String} modelName
 * @param  {Denali.Router} router
 */
export default function authRoutesFor(modelName, router) {

  let Model = router.container.lookup(`model:${ modelName }`);

  // Generate the root namespace for all the auth related routes we will be
  // adding. Defaults to type/auth, so for the User model, it would be
  // `users/auth/*`.
  let namespace = router.namespace(Model.authNamespace || `${ pluralize(modelName) }/auth`);

  // Registerable
  // Adds routes that allow for users to register a new account
  if (Model.isRegisterable) {
    namespace.post('register', 'auth/registrations/create', { modelName });
  }

  // Confirmable
  // Adds routes that allow for users to confirm their email address
  if (Model.isConfirmable) {
    namespace.post('confirm-email', 'auth/email-confirmations/confirm-email', { modelName });
    namespace.post('send-email-confirmation', 'auth/email-confirmations/send-email-confirmation', { modelName });
  }

  // Resetable
  // Adds routes that allow users to reset their passwords
  if (Model.isResetable) {
    namespace.post('reset-password', 'auth/password-resets/reset-password', { modelName });
    namespace.post('send-reset-password', 'auth/password-resets/send-reset-password', { modelName });
  }

  // Authenticable
  // Adds routes allowing users to authenticate and establish a session
  if (Model.isSessionable) {
    namespace.post('sessions', 'auth/sessions/create', { modelName });
    namespace.delete('sessions', 'auth/sessions/delete', { modelName });
  }

}
