// @flow

import config from 'config';
import error from 'server/utils/error';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import models from 'server/models';

import {
  CLIENT_NOT_FOUND
} from 'server/exception/codes';
import {
  createRedirect,
  whiteLabelUrl
} from 'server/utils/clientRedirect';
import {
  attemptLoginHelper,
  redirectToClientHelper,
  render
} from 'server/utils/login';

const CONTROLLER_CONFIG = config.get('server');
const LOGGER = Logger.get('auth');

// BEGIN UTIL FUNCTIONS

/**
 * [description]
 * @param  {[type]}   request  [description]
 * @param  {[type]}   response [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
const attemptLogin = function (request: Object, response: Object, next: Function): void {
  return attemptLoginHelper(request, response, next, function (err): void {
    if (err) {
      return error(err, response);
    }

    return next();
  });
};
export { attemptLogin };

/**
 * [description]
 * @param  {[type]}   clientNames [description]
 * @param  {[type]}   request     [description]
 * @param  {[type]}   response    [description]
 * @param  {Function} next        [description]
 * @return {[type]}               [description]
 */
const getClientsByName = async function (clientNames: Array<string>): Promise<Array<Object>> {
  const clients = await models.Client.findAll({
    where: {
      name: {
        in: clientNames
      }
    }
  });

  if (!clients || !clients.length) {
    throw new Exception(CLIENT_NOT_FOUND);
  }

  // Let's move TH first :)
  return clients.reverse();
};
export { getClientsByName };

// END UTIL FUNCTIONS

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const login = async function (request: Object, response: Object): Promise<void> {
  return render('pages/auth/login', request, response);
};
export { login };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const logout = function (request: Object, response: Object): void {
  response.cookie(request.session.name, '', { expires: new Date() });
  request.logout();

  return request.session.regenerate(function (err) {
    if (err) {
      const msg: string = `An error occurred while logging out ${request.user.username}: ${err}`;
      LOGGER.error(`[logout] ${msg}`);
    }
    request.flash('success', 'You have been logged out');
    return response.redirect('/login');
  });
};
export { logout };

/**
 * [description]
 * @param  {[type]}   request  [description]
 * @param  {[type]}   response [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
const showClientSelection = async function (request: Object, response: Object, next: Function): Promise<void> {
  const agency: string = request.agency.name;
  const allowedClientNames: Array<string> = CONTROLLER_CONFIG.get('allowedClientNames');
  const assetsConfig: Object = CONTROLLER_CONFIG.get('assets');
  try {
    let clients: Array<Object> = await getClientsByName(allowedClientNames, request, response, next);
    clients = clients.map((item: Object): Object => {
      const client = item;
      client.clientUrl = whiteLabelUrl(agency, client.clientUrl);
      return client;
    });

    return response.render('pages/auth/clientSelection', {
      title: 'Client Selection',
      cdn: assetsConfig.get('cdn'),
      agency,
      clients
    });
  } catch (e) {
    return next(e);
  }
};
export { showClientSelection };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const redirectFormToClient = async function (request: Object, response: Object): Promise<void> {
  return await redirectToClientHelper(request, function (err: any, path: string) {
    if (err) {
      LOGGER.error(err);
      request.flash('error', (typeof err === 'object' && 'message' in err) ? err.message : err);
      return response.redirect('/login');
    }

    return response.redirect(path);
  });
};
export { redirectFormToClient };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const redirectToClient = async function (request: Object, response: Object): Promise<void> {
  return await redirectToClientHelper(request, function (err: any, path: string) {
    if (err) {
      LOGGER.error(err);
      return error(err, response);
    }

    return createRedirect(response, path, 200);
  });
};
export { redirectToClient };
