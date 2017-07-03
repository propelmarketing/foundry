// @flow

import Logger from 'server/utils/logger';

const LOGGER = Logger.get('auth');

/**
 *
 */
export default class Exception extends Error {

  category: string;
  code: number;
  status: number;
  extra: any;

  constructor(payload: string | Object, code: number = -1, status: number = 500) {

    if (typeof payload !== 'object') {
      payload = {
        category: "N/A",
        code,
        message: payload,
        status
      };
    }
    super();
    this.category = payload.category;
    this.code = payload.code;
    this.message = `${payload.message}${payload.extra ? `. ${payload.extra}` : ''}`;
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
  LOGGER.error(e);
  if ('status' in e && (e.status === 401 || e.status === 403)) {
    return done(null, false, e);
  }
  return done(e);
};
export { handleAuthError };
