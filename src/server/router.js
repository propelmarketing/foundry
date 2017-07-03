// @flow

import express from 'express';
import {
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

// BEGIN API CONNECT ROUTES
// END API CONNECT ROUTES

// BEGIN API DISCONNECT ROUTES
// END API DISCONNECT ROUTES

// END API ROUTES

// BEGIN AUTH ROUTES
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
// END AUTH ROUTES

// BEGIN CONNECT ROUTES
router.get('/connect/facebook/callback', FacebookController.connectAccountCallback);
router.get('/connect/google/callback', GoogleController.connectAccountCallback);
router.get('/connect/instagram/callback', InstagramController.connectAccountCallback);
router.get('/connect/twitter/callback', TwitterController.connectAccountCallback);
// END CONNECT ROUTES

router.get('/error/noscript', RootController.redirectNoScript);

router.get('/login', AuthController.login);
router.get('/logout', AuthController.logout);

export default router;
