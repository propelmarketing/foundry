// @flow

import error from 'server/utils/error';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import { checkIfInvalidPassword } from 'server/utils/passwordValidation';
import models from 'server/models';

import { isEmail } from 'validator';
import * as codes from 'server/exception/codes';
import * as sendgrid from 'server/sendgrid';

const ALLOWED_QUERIES = ['limit', 'offset', 'order'];
const LOGGER = Logger.get('auth');

// BEGIN UTIL FUNCTIONS

/**
 * [description]
 * @param  {[type]} updates [description]
 * @return {[type]}         [description]
 */
const scrubSensitiveData = function (updates: Object): Object {
  const safeUpdates: Object = Object.assign({}, updates);
  LOGGER.info(safeUpdates);
  delete safeUpdates.id;
  delete safeUpdates.username;
  // TODO we want to add the ability to update applications, but we need to add some validation around it (not MVP)
  delete safeUpdates.applications;
  delete safeUpdates.portalPassword;
  delete safeUpdates.thrivehivePassword;
  return safeUpdates;
};

/**
 * [description]
 * @param  {[type]} username [description]
 * @param  {[type]} updates  [description]
 * @return {[type]}          [description]
 */
const updateUserHelper = async function (username: string, updates: Object): Promise<any> {
  const safeUpdates: Object = scrubSensitiveData(updates);
  LOGGER.info(`[updateUserHelper] Updating user ${username} (with safeUpdates)...`);
  const result: Array<number> = await models.User.update(safeUpdates, { where: { username } });
  // TODO If password is updated, send email reset alert email
  LOGGER.info(`[updateUserHelper] User ${username} successfully updated: (${result.toString()})`);
  return result;
};
export { updateUserHelper };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const updateMultipleUsers = async function (request, response): Promise<void> {
  let result = null;
  let count = 0;
  let updates;
  const errors = [];
  const users: Array<Object> = request.body.users;

  LOGGER.info(`[updateUser] Updating ${users.length} users...`);

  for (let i = 0; i < users.length; i += 1) {
    updates = Object.assign({}, users[i]);
    try {
      result = await updateUserHelper(updates.username, updates.updates);
      count += Array.isArray(result) ? result[0] : result;
    } catch (e) {
      errors.push(e);
    }
  }

  return errors ?
    response.status(400).send(codes.GENERAL_ERROR(`Failed to update models: ${JSON.stringify(errors)}`)) :
    response.send({ message: `Successfully updated ${count > 1 ? '1 model' : `${count} models`}` });
};

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const updateSingleUser = async function (request, response): Promise<void> {
  const user = request.body.user;
  const username: string = ('username' in request.params) ? request.params.username : user.username;
  LOGGER.info(`[updateUser] Updating user ${username}...`);
  LOGGER.info(user);
  try {
    await updateUserHelper(username, user);
    return response.status(200).send({ message: 'User successfully updated' });
  } catch (e) {
    return error(e, response);
  }
};

// END UTIL FUNCTIONS

/**
 * [description]
 * @param  {[type]} user   [description]
 * @param  {[type]} client [description]
 * @return {[type]}        [description]
 */
const checkApplicationAccess = function (user: Object, client: string): number {
  LOGGER.info(`[checkApplicationAccess] Checking application access for user ${user.username}`);
  const applications: Array<string> = user.applications;
  const clientIndex: number = applications.indexOf(client);
  LOGGER.info(`[checkApplicationAccess] Application found? ${(clientIndex !== -1).toString()}`);
  return clientIndex;
};

/**
 * Creates user, generates password and sends email, if the user exists it updates or returns success message
 * @param { Object } request - request object
 * @param { Object } response - response object
 * @return { Promise<Object> } returns promise which resolves into successful response message or error
 */
const createUser = async (request: Object, response: Object): Promise<Object|any> => {
  try {
    const user: Object = Object.assign({}, request.body.user);
    if (!user) {
      throw new Exception(codes.GENERAL_ERROR('User data must be provided in body'));
    }

    const username: string = ('username' in request.params) ? request.params.username : user.username;
    if (!isEmail(username)) {
      throw new Exception(
        codes.VALIDATION_ERROR('Provided username is not valid. Username must be a valid email address')
      );
    }
    LOGGER.info(`[createUser] Create requested for user ${username}`);

    const client: string = request.clientName;
    if (!client) {
      throw new Exception(codes.FATAL_ERROR);
    }

    const query: Object = request.query;
    // eslint-disable-next-line eqeqeq
    const sendEmail: boolean = (query.sendEmail == null ? true : query.sendEmail == 'true');
    const successMessage: Object = { message: `User ${username} successfully created` };
    const existing: ?Object = await models.User.findOne({ where: { username } });

    if (existing) {
      const clientIndex: number = checkApplicationAccess(existing, client);
      if (clientIndex !== -1) {
        LOGGER.info(`[createUser] User ${username} has already been authorized for client ${client}`);
        return response.send(successMessage);
      }

      existing.applications.push(client);
      LOGGER.info(`[createUser] Granting user ${username} access to client '${existing.applications}'...`);
      await existing.update({ applications: existing.applications });
      LOGGER.info(`[createUser] Successfully granted user ${username} access to clients ${existing.applications}`);
    } else {
      if ('password' in user) {
        const result: string | boolean = checkIfInvalidPassword(user.password, true);
        if (result) {
          const msg = `Found invalid password in provided user data (${result.toString()}). Using generated password`;
          LOGGER.warn(`[createUser] ${msg}`);
          successMessage.warning = msg;
          user.password = models.User.generatePassword();
        }
      } else {
        user.password = models.User.generatePassword();
      }
      user.username = username;
      user.applications = [client];
      LOGGER.info(`[createUser] Creating user ${username}...`);
      await models.User.create(user);
      LOGGER.info(`[createUser] Successfully created user ${username} with access to client ${client}`);
      if (sendEmail) {
        sendgrid.welcomeNewAccount(request, username, user.username, user.password);
      }
    }
    return response.send(successMessage);
  } catch (e) {
    return error(e, response);
  }
};
export { createUser };

/**
 * [description]
 * @param  {[type]}   request  [description]
 * @param  {[type]}   response [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
const deleteUser = async function (request: Object, response: Object, next: Function): Promise<void> {
  try {
    const username: string = request.params.username;
    if (!username) {
      throw new Exception(codes.MISSING_USERNAME_PARAMETER);
    }

    const client: string = request.clientName;
    if (!client) {
      throw new Exception(codes.FATAL_ERROR);
    }

    LOGGER.info(`[deleteUser] Delete requested for user ${username}`);

    const user: Object = await models.User.findOne({ where: { username } });
    if (!user) {
      throw new Exception(codes.USER_NOT_FOUND);
    }

    const successMessage: Object = { message: 'User successfully deleted' };
    const clientIndex: number = checkApplicationAccess(user, client);
    if (clientIndex === -1) {
      LOGGER.info(`[deleteUser] User ${username} has already been deauthorized for client ${client}`);
      return response.send(successMessage);
    }

    const applications: Array<string> = user.applications.slice();
    if (applications.length === 1) {
      LOGGER.info(`[deleteUser] User ${username} no longer authorized for any client. Deleting user...`);
      await models.User.destroy({ where: { username } });
    } else {
      applications.splice(clientIndex, 1);
      LOGGER.info(
        `[deleteUser] Deauthorizing user ${username} for client ${client}. Remaining clients: \
        ${applications.toString()}`
      );
      await models.User.update({ applications }, { where: { username } });
    }
    LOGGER.info(`[deleteUser] Processing completed for user ${username}`);
    return response.send(successMessage);
  } catch (e) {
    return next(e, request, response);
  }
};
export { deleteUser };

/**
 * [description]
 * @param  {[type]} request [description]
 * @return {[type]}         [description]
 */
const getQueries = function (request: Object): Object {
  return Object.keys(request)
    .filter((key) => { return ALLOWED_QUERIES.includes(key); })
    .reduce((obj: Object, key: any) => {
      const ret = Object.assign({}, obj);
      ret[key] = request[key];
      return ret;
    }, {});
};

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const listConnectedAccounts = async function (request: Object, response: Object): Promise<void> {
  const username: string = request.params.username;
  try {
    const connectedAccounts: Object = {};
    const user: Object = await models.User.findOne({
      where: { username },
      include: [{
        model: models.FacebookAccount
      }, {
        model: models.GoogleAccount
      }, {
        model: models.InstagramAccount
      }, {
        model: models.TwitterAccount
      }]
    });

    connectedAccounts.facebook = user.facebook_accounts;
    connectedAccounts.google = user.google_accounts;
    connectedAccounts.instagram = user.instagram_accounts;
    connectedAccounts.twitter = user.twitter_accounts;

    return response.status(200).send({ connectedAccounts });
  } catch (e) {
    return error(e, response);
  }
};
export { listConnectedAccounts };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const listUser = async function (request: Object, response: Object): Promise<void> {
  const username: string = request.params.username;
  const filters: Object = getQueries(request);

  try {
    if (username) {
      LOGGER.info(`[listUser] Listing user ${username} based on filters ${JSON.stringify(filters)}...`);
      const opts = Object.assign({}, filters, { where: { username } });
      const user: Object = await models.User.findOne(opts);
      if (!user) {
        throw new Exception(codes.USER_NOT_FOUND);
      }
      LOGGER.info(`[listUser] Listing completed for user ${username}`);
      return response.send({ user: scrubSensitiveData(user) });
    }

    LOGGER.info(`[listUser] Listing all users based on filters ${JSON.stringify(filters)}...`);
    let users: Array<Object> = await models.User.findAll(filters);
    if (!users) {
      users = [];
    }

    for (let i = 0; i < users.length; i++) {
      users[i] = scrubSensitiveData(users[i]);
    }

    LOGGER.info(`[listUser] Listing completed for ${users.length} users`);
    return response.send({ users });
  } catch (e) {
    return error(e, response);
  }
};
export { listUser };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const updateUser = async function (request: Object, response: Object): Promise<void> {
  const body = request.body;

  try {
    if ('user' in body) {
      return await updateSingleUser(request, response);
    } else if ('users' in body) {
      return await updateMultipleUsers(request, response);
    }
    throw new Exception(
      codes.GENERAL_ERROR('An object or array of objects containing updated user data must be provided')
    );
  } catch (e) {
    return error(e, response);
  }
};
export { updateUser };
