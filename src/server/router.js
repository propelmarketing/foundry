// @flow

import express from 'express';
import {
  ensureLoggedIn,
  validateClientAccess,
  validateUserSession
} from 'server/middleware';

/**
 * Controllers
 */
import * as AuthController from 'server/controllers/auth';
import * as EmailController from 'server/controllers/email';
import * as FacebookController from 'server/controllers/facebook';
import * as GoogleController from 'server/controllers/google';
import * as InstagramController from 'server/controllers/instagram';
import * as PasswordResetController from 'server/controllers/passwordReset';
import * as TwitterController from 'server/controllers/twitter';
import * as RootController from 'server/controllers/root';
import * as UserController from 'server/controllers/user';

/**
 * Create the server router and mount routes
 */
const router = express.Router();

router.get('/', RootController.redirectIndex);

// BEGIN API ROUTES
router.get('/api/user/:username', validateClientAccess, UserController.listUser);
router.get('/api/user/:username/connected-accounts', validateClientAccess, UserController.listConnectedAccounts);
router.delete('/api/user/:username', validateClientAccess, UserController.deleteUser);
router.post('/api/user/:username', validateClientAccess, UserController.createUser);
router.put('/api/user/:username', validateClientAccess, UserController.updateUser);

// BEGIN API CONNECT ROUTES
router.post('/api/user/:username/facebook', validateClientAccess, FacebookController.apiConnectAccount);
router.post('/api/user/:username/google', validateClientAccess, GoogleController.apiConnectAccount);
router.post('/api/user/:username/instagram', validateClientAccess, InstagramController.apiConnectAccount);
router.post('/api/user/:username/twitter', validateClientAccess, TwitterController.apiConnectAccount);
// END API CONNECT ROUTES

// BEGIN API DISCONNECT ROUTES
router.delete('/api/user/:username/facebook', validateClientAccess, FacebookController.apiDisconnectAccount);
router.delete('/api/user/:username/google', validateClientAccess, GoogleController.apiDisconnectAccount);
router.delete('/api/user/:username/instagram', validateClientAccess, InstagramController.apiDisconnectAccount);
router.delete('/api/user/:username/twitter', validateClientAccess, TwitterController.apiDisconnectAccount);
// END API DISCONNECT ROUTES

// END API ROUTES

// BEGIN AUTH ROUTES
router.get('/auth/client-selection', ensureLoggedIn, AuthController.showClientSelection);
// Facebook auth endpoints
router.post('/auth/facebook', FacebookController.authenticateAccount);
router.get('/auth/facebook/callback',
  FacebookController.authenticateAccountCallback,
  AuthController.redirectFormToClient
);
router.get('/auth/facebook/connect', FacebookController.renderConnectAccount);
router.post('/auth/facebook/connect', FacebookController.attemptLogin,
  FacebookController.connectAccount,
  AuthController.redirectFormToClient
);
// Forgot password endpoints
router.get('/auth/forgot-password', PasswordResetController.getForgotPassword);
router.post('/auth/forgot-password', PasswordResetController.postForgotPassword);
// Google auth endpoints
router.post('/auth/google', GoogleController.authenticateAccount);
router.get('/auth/google/callback',
  GoogleController.authenticateAccountCallback,
  AuthController.redirectFormToClient
);
router.get('/auth/google/connect', GoogleController.renderConnectAccount);
router.post('/auth/google/connect',
  GoogleController.attemptLogin,
  GoogleController.connectAccount,
  AuthController.redirectFormToClient
);
// Instagram auth endpoints
router.get('/auth/instagram', InstagramController.authenticateAccount);
router.get('/auth/instagram/callback',
  InstagramController.authenticateAccountCallback,
  AuthController.redirectFormToClient
);
router.get('/auth/instagram/connect', InstagramController.renderConnectAccount);
router.post('/auth/instagram/connect',
  InstagramController.attemptLogin,
  InstagramController.connectAccount,
  AuthController.redirectFormToClient
);
// Password reset endpoints
router.get('/auth/password-reset', PasswordResetController.getPasswordReset);
router.post('/auth/password-reset', PasswordResetController.postPasswordReset);
// Twitter auth endpoints
router.post('/auth/twitter', TwitterController.authenticateAccount);
router.get('/auth/twitter/callback',
  TwitterController.authenticateAccountCallback,
  AuthController.redirectFormToClient
);
router.get('/auth/twitter/connect', TwitterController.renderConnectAccount);
router.post('/auth/twitter/connect',
  TwitterController.attemptLogin,
  TwitterController.connectAccount,
  AuthController.redirectFormToClient
);
// User authorization endpoint
router.post('/auth/user', AuthController.attemptLogin, AuthController.redirectToClient);
router.get('/auth/user/validate', validateClientAccess, validateUserSession);
// END AUTH ROUTES

// BEGIN CONNECT ROUTES
router.post('/connect/facebook', ensureLoggedIn, FacebookController.connectAccount);
router.get('/connect/facebook/callback', FacebookController.connectAccountCallback);
router.post('/connect/google', ensureLoggedIn, GoogleController.connectAccount);
router.get('/connect/google/callback', GoogleController.connectAccountCallback);
router.post('/connect/instagram', ensureLoggedIn, InstagramController.connectAccount);
router.get('/connect/instagram/callback', InstagramController.connectAccountCallback);
router.post('/connect/twitter', ensureLoggedIn, TwitterController.connectAccountCallback);
router.get('/connect/twitter/callback', TwitterController.connectAccountCallback);
// END CONNECT ROUTES

router.get('/error/noscript', RootController.redirectNoScript);

router.get('/login', AuthController.login);
router.get('/logout', AuthController.logout);

router.put('/services/email/send/new-account', validateClientAccess, EmailController.sendNewAccountEmail);

export default router;
