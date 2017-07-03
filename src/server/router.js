// @flow

import express from 'express';
import {
  validateUserSession
} from 'server/middleware';

/**
 * Controllers
 */
import * as RootController from 'server/controllers/root';

/**
 * Create the server router and mount routes
 */
const router = express.Router();

router.get('/', RootController.redirectIndex);

router.get('/error/noscript', RootController.redirectNoScript);

export default router;
