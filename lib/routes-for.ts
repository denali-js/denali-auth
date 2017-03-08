import { pluralize } from 'inflection';

/**
 * Generate any routes needed based on the facets applied to the given model.
 * @param  {String} modelName
 * @param  {Denali.Router} router
 */
export default function authRoutesFor(modelName, router, options = {}) {
  options.except = options.except || [];

  let Model = router.container.lookup(`model:${ modelName }`);

  // Generate the root namespace for all the auth related routes we will be
  // adding. Defaults to type/auth, so for the User model, it would be
  // `users/auth/*`.
  let namespace = router.namespace(Model.authNamespace || `${ pluralize(modelName) }/auth`);

  // Registerable
  // Adds routes that allow for users to register a new account
  if (Model.isRegisterable) {
    if (!options.except.includes('/register')) {
      namespace.post('/register', 'auth/register', { modelName });
    }
  }

  // Confirmable
  // Adds routes that allow for users to confirm their email address
  if (Model.isConfirmable) {
    if (!options.except.includes('/confirm-email')) {
      namespace.post('/confirm-email', 'auth/confirm-email', { modelName });
    }
    if (!options.except.includes('/resend-email-confirmation')) {
      namespace.post('/resend-email-confirmation', 'auth/resend-email-confirmation', { modelName });
    }
  }

  // Resetable
  // Adds routes that allow users to reset their passwords
  if (Model.isResetable) {
    if (!options.except.includes('/reset-password')) {
      namespace.post('/reset-password', 'auth/reset-password', { modelName });
    }
    if (!options.except.includes('/send-reset-password')) {
      namespace.post('/send-reset-password', 'auth/send-reset-password', { modelName });
    }
  }

  // Invitable
  // Adds routes that allow users to reset their passwords
  if (Model.isInvitable) {
    if (!options.except.includes('/send-invitation')) {
      namespace.post('/send-invitation', 'auth/send-invitation', { modelName });
    }
  }

  // Oauthable
  // Adds routes that allow users to login / register via OAuth providers
  if (Model.isOauthable) {
    if (!options.except.includes('/oauth')) {
      namespace.post('/oauth/:provider', 'auth/oauth', { modelName });
    }
  }

  // Fetchable
  // Adds a route that allow users to fetch their own records when logged in
  if (Model.isFetchable) {
    if (!options.except.includes('/me')) {
      namespace.get('/me', 'auth/fetch-user', { modelName });
    }
  }

  // Authenticable
  // Adds routes allowing users to authenticate and establish a session
  if (Model.isAuthenticatable) {
    if (!options.except.includes('/login')) {
      namespace.post('/login', 'auth/login', { modelName });
    }
    if (!options.except.includes('/logout')) {
      namespace.delete('/logout', 'auth/logout', { modelName });
    }
  }

}
