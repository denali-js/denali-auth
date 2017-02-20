export async function up(knex) {

  await knex.schema.createTableIfNotExists('<%= table %>', function (<%= tableVar %>) {
    <%= tableVar %>.increments();
    <%= tableVar %>.timestamps();
  });

  // Add the appropriate columns to the <%= table %> table
  knex.schema.table('<%= table %>', (<%= tableVar %>) => {

    <% if (confirmable) { %>
    // Confirmable
    <%= tableVar %>.uuid('email_confirmation_token_id');
    <%= tableVar %>.text('unconfirmed_email');
    <%= tableVar %>.boolean('email_confirmed');
    <%= tableVar %>.timestamp('email_confirmed_at');
    <% } %>

    <% if (invitable) { %>
    // Invitable
    <%= tableVar %>.uuid('invitation_id');
    <%= tableVar %>.timestamp('invitation_used_at');
    <% } %>

    <% if (lockable) { %>
    // Lockable
    <%= tableVar %>.boolean('locked_out');
    <%= tableVar %>.timestamp('last_authentication_attempt');
    <%= tableVar %>.integer('failed_authentication_attempts').unsigned();
    <% } %>

    <% if (oauthable) { %>
    // Oauthable
    // Uncomment whichever services you'll support, and add any additional
    // columns for data that you'll import from the OAuth provider's profile
    // <%= tableVar %>.text('facebook_id');
    // <%= tableVar %>.text('twitter_id');
    // <%= tableVar %>.text('github_id');
    <% } %>

    <% if (passwordable) { %>
    // Passwordable
    // Change the column names here to match the usernameField and
    // secretField / hashedSecretField you provided to the Passwordable mixin,
    // if you did.
    <%= tableVar %>.text('email');
    <%= tableVar %>.text('hashed_password');
    <% } %>

    <% if (trackable) { %>
    // Trackable
    <%= tableVar %>.timestamp('last_login_at');
    <%= tableVar %>.text('last_ip');
    <%= tableVar %>.integer('login_count').unsigned();
    <% } %>

  });

  <% if (confirmable || invitable || resetable || sessionable) { %>
  // Some facets also require additional tables/models ...
  <% } %>

  <% if (confirmable) { %>
  // Confirmable
  knex.schema.createTableIfNotExists('email_confirmation_tokens', function (emailConfirmationTokens) {
    emailConfirmationTokens.uuid('id').primary();
    emailConfirmationTokens.timestamps();
    emailConfirmationTokens.text('email');
  });
  <% } %>

  <% if (invitable) { %>
  // Invitable
  knex.schema.createTableIfNotExists('invitations', function (invitations) {
    invitations.uuid('id').primary();
    invitations.timestamps();
    invitations.boolean('used');
    invitations.timestamp('used_at');
    invitations.text('user_id');
    invitations.text('user_type');
    invitations.text('token');
    invitations.timestamp('expires_at');
  });
  <% } %>

  <% if (resetable) { %>
  // Resetable
  knex.schema.createTableIfNotExists('password_reset_tokens', function (passwordResetTokens) {
    passwordResetTokens.uuid('id').primary();
    passwordResetTokens.timestamps();
    passwordResetTokens.text('user_id');
    passwordResetTokens.text('user_type');
    passwordResetTokens.text('token');
    passwordResetTokens.timestamp('expires_at');
  });
  <% } %>

  <% if (sessionable) { %>
  // Sessionable
  knex.schema.createTableIfNotExists('sessions', function (sessions) {
    sessions.uuid('id').primary();
    sessions.timestamps();
    sessions.text('user_id');
    sessions.text('user_type');
    sessions.text('token');
    sessions.timestamp('expires_at');
  });
  <% } %>
}

export async function down(knex) {

  // We don't drop the <%= table %> table since we can't know for sure
  // whether or not it pre-existed this migration

  knex.schema.table('<%= table %>', (<%= tableVar %>) => {

    <% if (confirmable) { %>
    // Confirmable
    <%= tableVar %>.dropColumn('email_confirmation_token_id');
    <%= tableVar %>.dropColumn('unconfirmed_email');
    <%= tableVar %>.dropColumn('email_confirmed');
    <%= tableVar %>.dropColumn('email_confirmed_at');
    <% } %>

    <% if (invitable) { %>
    // Invitable
    <%= tableVar %>.dropColumn('invitation_id');
    <%= tableVar %>.dropColumn('invitation_used_at');
    <% } %>

    <% if (lockable) { %>
    // Lockable
    <%= tableVar %>.dropColumn('locked_out');
    <%= tableVar %>.dropColumn('last_authentication_attempt');
    <%= tableVar %>.dropColumn('failed_authentication_attempts');
    <% } %>

    <% if (oauthable) { %>
    // Oauthable
    // <%= tableVar %>.dropColumn('facebook_id');
    // <%= tableVar %>.dropColumn('twitter_id');
    // <%= tableVar %>.dropColumn('github_id');
    <% } %>

    <% if (passwordable) { %>
    // Passwordable
    // Change the column names here to match the usernameField and
    // secretField / hashedSecretField you provided to the Passwordable mixin,
    // if you did.
    <%= tableVar %>.dropColumn('email');
    <%= tableVar %>.dropColumn('hashed_password');
    <% } %>

    <% if (trackable) { %>
    // Trackable
    <%= tableVar %>.dropColumn('last_login_at');
    <%= tableVar %>.dropColumn('last_ip');
    <%= tableVar %>.dropColumn('login_count');
    <% } %>

  });

  <% if (confirmable) { %>
  // Confirmable
  knex.schema.dropTable('email_confirmation_tokens');
  <% } %>

  <% if (invitable) { %>
  // Invitable
  knex.schema.dropTable('invitations');
  <% } %>

  <% if (resetable) { %>
  // Resetable
  knex.schema.dropTable('password_reset_tokens');
  <% } %>

  <% if (sessionable) { %>
  // Sessionable
  knex.schema.dropTable('sessions');
  <% } %>
}
