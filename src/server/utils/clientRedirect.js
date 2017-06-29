// @flow

import Exception from 'server/exception';
import models from 'server/models';
import url from 'url';

import {
  CLIENT_NOT_FOUND,
  CLIENT_MISSING_CLIENT_URL,
  NOT_ALLOWED
} from 'server/exception/codes';

const HOST_AGENCY_REPLACEMENT: Object = new RegExp(/([^.]+)\.([^.]+)\.(.*)/gi);

/**
 * [description]
 * @param  {[type]} agency [description]
 * @param  {[type]} rawUrl [description]
 * @return {[type]}        [description]
 */
const whiteLabelUrl = function (agency: string, rawUrl: string): string {
  const parsedUrl: Object = url.parse(rawUrl);
  const host: string = parsedUrl.host.replace(HOST_AGENCY_REPLACEMENT, `$1.${agency}.$3`);
  return `${parsedUrl.protocol}${parsedUrl.slashes ? '//' : ''}${host}${parsedUrl.pathname}`;
};
export { whiteLabelUrl };

/**
 * [description]
 * @param  {[type]} response    [description]
 * @param  {[type]} callbackUrl [description]
 * @param  {[type]} status      [description]
 * @return {[type]}             [description]
 */
export const createRedirect = function (response: Object, callbackUrl: string, status: number): void {
  return response.status(status).json({
    callbackUrl,
    status,
    redirected: true,
  });
};
export default createRedirect;

/**
 * [description]
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
export const getClientRedirect = async function (request: Object): Promise<string> {
  const applications: Array<string> = request.user.applications;
  if (applications.length === 0) {
    throw new Exception(NOT_ALLOWED);
  }

  if (applications.length > 1) {
    return '/auth/client-selection';
  }

  const client = await models.Client.findOne({ where: { name: applications[0] } });
  if (client == null) {
    throw new Exception(CLIENT_NOT_FOUND);
  }

  const clientUrl: string = client.clientUrl;
  if (clientUrl == null) {
    throw new Exception(CLIENT_MISSING_CLIENT_URL);
  }

  return whiteLabelUrl(request.agency.name, clientUrl);
};
