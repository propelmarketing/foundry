// @flow

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const redirectIndex = function (request: Object, response: Object): void {
  response.redirect('/login');
};
export { redirectIndex };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const redirectNoScript = function (request: Object, response: Object): void {
  response.render('pages/error/noscript');
};
export { redirectNoScript };
