# denali-auth

API authentication for Denali apps, built on top of passport.js.

## Usage

To protect a Denali action and ensure users are authenticated before accessing
it, apply the `authenticate` filter:

```js
Action.extend(AuthenticateFilter);
```

This will ensure that the incoming requests to this action have a valid HTTP
Bearer auth header.

Validation of the bearer token carried in a request's Authorization header is
done by your `lookupToken` method (see Configuration below).

Users can get a token to use as their bearer token by authenticating with their
username and password

## Configuration

**lookupToken** - a method which is given the container and a token, and should
lookup the user associated with that token. Should resolve with the associated
user, or reject if the user is not found, the token is not valid, or any other
failure.


## Why not JWT?

No control over expiring / revoking tokens

## Why not vanilla express/session?

Cookies are wired in, seems abandoned or ignored
Instead, we mimic the API of express/session, including faking out the cookie object
