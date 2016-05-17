exports.AuthenticateFilter = require('./filters/authenticate');
exports.AuthAdapter = require('./lib/adapter');

const login = require('./lib/test-helpers/login');
const logout = require('./lib/test-helpers/logout');

module.exports = { login, logout };
