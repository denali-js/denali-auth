# Concerns

* confirmable
* registration
* sessions
* lockout
* invites
* password auth
* every/omni auth?
* recovery
* tracking
* expire / timeout
* multi-model

# Models

* authenticatable
  * store encrypted passwords
  * compare password hashes
* confirmable
  * generate confirmation tokens before save
  * add unconfirmed flag before save
  * send confirmation emails
  * at login for unconfirmed accounts
    * allow access for X time
    * allow access permanently
    * deny access
  * resend confirmation email
  * confirm email changes
  * expire confirmation tokens
* password reset
  * generate reset token
  * send reset email
  * expire reset tokens
  * reset password with valid tokens
* tracking
  * track each login (via "event" framework?)
  * update user with login timestamp and IP
* locking
  * strategies: hard limit (x attempts in y mins) or backoff (increasing time delays)
* invites
  * generate invite method
  * optional recipient email to send invite to
* oauth client
  * redirect endpoint to send browser iframe/popup to Facebook
  * callback endpoint client can use to hand off auth token
  * callback endpoint gets access token, optionally refresh token, some UID, and optionally profile data
  * user model gets filled in with details
* oauth provider


# Session Management

* create a session

## Session Use Cases

* User sessions
  * validate transient session token
  * currentUser
* API session
  * validate fixed API keys
  * currentClient
* Security addon
  * detect when IP changes mid-session, optionally expire the session with message


----

Flow:
1. User adds authFor('user') to routes.rb
2. authFor('user') looks up the User model to see what kinds of options are
   enabled for it.
3. For each option (i.e. confirmable), it generates the appropriate routes that
   map from the model specific URL to the generic action handlers packaged with
   the addon. Where necessary, it passes an additional param to the action to
   tell it what model it's supposed to be operating on.
~~
1. User extends Models with option mixins (i.e. confirmable)
2. As mixins are applied, they modify the Model class to add necessary columns,
   hooks, and methods
3. When auth actions are invoked, they can leverage these methods
~~

---

API Surface area
* model mixins tell Auth what models are auth-relevant, and what features they support
* authenticate mixin auths an incoming request, and adds relevant meta to action
  context (i.e. currentUser)


----

So, each *able facet has the chance to extend the authenticate method
There's no difference between regular protected routes, login routes, or signup routes
You just decide what kind of auth is allowed for each
I.e. regular routes could be session only, or session and password (if you want to allow basic-auth style too)
login routes are password and oauth only (_not_ session)
registration / signup routes could be _no_ auth, or invites potentially?

The user generally doesn't need to worry - default is session auth only, and
for those routes like login/signup, we control the defaults anyway

Each facet can also define a hook method for the following hooks:

* login()
* logout()
* register()
* authenticate()

----

core changes:

uniform way for throwing validation style errors
if attribute is not defined on model, does it pass through?
  rather than a sparse proxy, perhaps model should capture it all, and call the get/setAttribute for attrs, relationship ones for relations, etc
  could adapters tell models what additional methods should poke through? no - consumers can get the model.record if they want, but otherwise, enfoce single interface

add ability to pass params from routes.js

-----



We need a system of events basically. I.e. some facets don't authenticate, they only augment the authentication of any of the other strategies (i.e. trackable should trigger after an oauth login or a password login, confirmable here should be able to block login attempts for a locked out unconfirmed email)

What are some possible events?

* login
  * confirmable can block if unconfirmed
  * lockable can block if too many attempts
  * trackable can track
* logout
  * trackable can track
* register
  * invitable can block unless invite token is provided
  * trackable can track
* auth request
  * securable can block if IP switches
  * trackable can track

Seems like blocking and tracking is the big thing
Blocking needs access to incoming request, can't just be an instance
method with context of user record

Should rough out 2fa concept too:
  2fa would intercept normal login, send 2fa code, and block original login
  subsequent login would re-send credentials + 2fa code, 2fa would intercept, and allow
  generate backup codes option





  ------



/register
  invitable: If invites are required, check to make sure a valid invite token is provided, and invalidate the invite upon success
  oauthable / passwordable: Provide at least one set of authentication credentials (i.e. password, facebook token, etc)

/confirm-email
  confirmable: Validate confirmation token and associated email, then mark as confirmed

/resend-email-confirmation
  confirmable: Create and email a confirmation token

/reset-password
  resetable: Validate reset token and new password validity

/send-reset-password
  resetable: Create and email reset token

/login
  confirmable: Ensure account isn't locked out because of unconfirmed email
  lockable: Ensure account isn't locked out because of too many attempts
  passwordable: Validate password (if provided) and login
  oauthable: Validate access token (if provided) and login
  trackable: Track login data

/logout
  delete the session

/invite
  invitable: send an invite if the current user is allowed to

/[any authenticated route]
  trackable: Update tracking data (i.e. last seen) and ensure IP hasn't changed mid session (if so, logout)
  authenticatable: Ensure session is valid and load current user


// login is basically just generate-temporary-credentials - it's an action just
// like send-reset-password

// so the auth filter attempts to auth a request with all available strategies for the given model, unless overrides are passed in

// sessionable facet defines how sessions can auth a request (i.e. #authenticate) and the login method, which *doesn't* check credentials, but instead performs the actual logging in
// the login action uses the auth filter to ensure that the user has the right to call the login method
// so the login method should really be called createSession (full circle here) to disambiguate between login attempts and the act of logging in
