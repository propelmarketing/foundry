// @flow

import Logger from 'server/utils/logger';

const logger = Logger.get('auth');

/**
 *
 */
export default class Exception extends Error {

  code: number;
  status: number;

  constructor(payload: string | Object, code: number = -1, status: number = 500) {
    if (typeof payload !== 'object') {
      payload = {
        message: payload,
        code,
        status
      };
    }
    super(`${payload.message}${payload.extra ? `. ${payload.extra}` : ''}`);
    this.code = payload.code;
    this.status = payload.status;
  }
}

/**
 * [description]
 * @param  {[type]}   e    [description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
const handleAuthError = function(e: any, done: Function): void {
  logger.error(e);
  if ('status' in e && (e.status === 401 || e.status === 403)) {
    return done(null, false, e);
  }
  return done(e);
}
export { handleAuthError };
