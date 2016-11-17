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
    namespace.post('/register', 'auth/register', { modelName });
  }

  // Confirmable
  // Adds routes that allow for users to confirm their email address
  if (Model.isConfirmable) {
    namespace.post('/confirm-email', 'auth/confirm-email', { modelName });
    namespace.post('/resend-email-confirmation', 'auth/resend-email-confirmation', { modelName });
  }

  // Resetable
  // Adds routes that allow users to reset their passwords
  if (Model.isResetable) {
    namespace.post('/reset-password', 'auth/reset-password', { modelName });
    namespace.post('/send-reset-password', 'auth/send-reset-password', { modelName });
  }

  // Invitable
  // Adds routes that allow users to reset their passwords
  if (Model.isInvitable) {
    namespace.post('/send-invitation', 'auth/send-invitation', { modelName });
  }

  // Oauthable
  // Adds routes that allow users to login / register via OAuth providers
  if (Model.isOauthable) {
    namespace.post('/oauth/:provider', 'auth/oauth', { modelName });
  }

  // Fetchable
  // Adds a route that allow users to fetch their own records when logged in
  if (Model.isFetchable) {
    namespace.get('/me', 'auth/fetch-user', { modelName });
  }

  // Authenticable
  // Adds routes allowing users to authenticate and establish a session
  if (Model.isAuthenticatable) {
    namespace.post('/login', 'auth/login', { modelName });
    namespace.delete('/logout', 'auth/logout', { modelName });
  }

}
