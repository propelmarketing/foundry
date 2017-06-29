// @flow

import validator from 'validator';
import zxcvbn from 'zxcvbn';

/**
 * Validate Password
 * @param { string } password - New password
 * @param { boolean } skipScore - Flag that skips score check
 * @throws { Exception } Will throw an error if validation doesn't pass
 */
const checkIfInvalidPassword = (password: string, skipScore: boolean = false): string | boolean => {
  if (!validator.isLength(password, { min: 8, max: undefined })) {
    return 'Password must be at least 8 characters long.';
  }

  if (!skipScore && zxcvbn(password).score < 1) {
    return 'Password strength must be 25% or higher.';
  }

  if (!validator.matches(password, /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)) {
    return 'Password must have at least one capital letter, one lower-case letter and one number.';
  }

  if (!validator.matches(password, /^[!"#$%&'()*+,-./:;<=>?@[\\\]^`{|}~\w\s]*$/)) {
    return 'Password accepts only these special characters !"#$%&\'() *+,-./:;<=>?@[]^_`{|}~.';
  }

  return false;
};
export { checkIfInvalidPassword };

/**
 * Validate if passwords match
 * @method
 * @param  { string } password - New password
 * @param  { string } confirmation - Password confirmation
 * @throws { Exception } Will throw an error if validation doesn't pass
 */
const checkIfPasswordsMismatch = function (password: string, confirmation: string): string | boolean {
  if (!validator.equals(password, confirmation)) {
    return 'Passwords must match.';
  }
  return false;
};
export { checkIfPasswordsMismatch };
