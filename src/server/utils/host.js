// @flow

import Exception from 'server/exception';
import Logger from 'server/utils/logger';

import { GENERAL_ERROR } from 'server/exception/codes';

const domainMatch: Object = new RegExp(/[^\.]*\.[^.]*$/);
const LOGGER = Logger.get('root');
const validIpAddressRegex: Object = new RegExp(
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
);

/**
 * [description]
 * @param  {[type]} request [description]
 * @return {[type]}         [description]
 */
const getHost = function (request: Object): string {
  let host = request.get('host');
  if (!host) {
    throw new Exception(GENERAL_ERROR('Internal Error. Could not find host for the request'));
  }
  LOGGER.info(`[getHost] Processing host ${host}`);

  host = (host.indexOf(':') !== -1) ? host.split(':')[0] : host;
  host = host.toLowerCase();
  LOGGER.info(`[getHost] Returning host ${host}`);
  return host;
};
export { getHost };

/**
 * [description]
 * @param  {[type]} host [description]
 * @return {[type]}      [description]
 */
const findDomain = function (host: string): string | null {
  if (!host) {
    throw new Exception(GENERAL_ERROR('Interal Error. Can not find domain of empty string'));
  }

  LOGGER.info(`[findDomain] Finding domain for host ${host}`);

  // If the host is an ip address, return the ip address
  if (validIpAddressRegex.test(host)) {
    LOGGER.info(`[findDomain] Host ${host} is an IP Address. Returning 'null'`);
    return null;
  }

  // Otherwise, find the last two segments of the host (i.e. <agency>.com) and return the result
  const match: Array<string> = host.match(domainMatch);
  if (!match || !match.length) {
    LOGGER.info(`[findDomain] No domain for ${host} could be found. Returning host`);
    return host;
  }

  let domain: string = match[0];
  domain = domain.charAt(0) === '.' ? domain : `.${domain}`;
  LOGGER.info(`[findDomain] Found domain ${domain} for ${host}`);
  return domain;
};
export { findDomain };
