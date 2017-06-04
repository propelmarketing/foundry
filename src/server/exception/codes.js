// @flow

export default {
  status: 500,
  code: 0,
  category: 'IllegalStateException',
  message: 'An error occurred. If this error persists, please contact your System Administrator'
};

export const GENERAL_ERROR = function (message: string, extra: string = ''): Object {
  return {
    status: 400,
    code: 0,
    category: 'GeneralException',
    message,
    extra
  };
};

export const NOT_YET_IMPLEMENTED = {
  status: 501,
  code: 1,
  category: 'NotYetImplemented',
  message: 'This method must be implmented'
};

export const ILLEGAL_STATE_EXCEPTION = {
  status: 500,
  code: 2,
  category: 'IllegalStateException',
  message: 'Application not configured correctly'
};

export const NOT_AUTHORIZED = {
  status: 401,
  code: 3,
  category: 'SecurityException',
  message: 'You are not authorized to access this resource'
};

export const MISSING_REQUIRED_PARAMETER = {
  status: 400,
  code: 4,
  category: 'GeneralException',
  message: 'A required parameter was missing'
};

export const MISSING_USERNAME_PARAMETER = {
  status: 400,
  code: 5,
  category: 'GeneralException',
  message: 'The request parameter \'username\' is required'
};

export const MODEL_NOT_FOUND = {
  status: 404,
  code: 100,
  category: 'NotFoundException',
  message: 'Requested model could not be found'
};

export const USER_NOT_FOUND = {
  status: 401,
  code: 101,
  category: 'SecurityException',
  message: 'Invalid username provided'
};

export const GOOGLE_ACCOUNT_NOT_FOUND = {
  status: 401,
  code: 102,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Google Account',
  details: 'Either the you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your Google Account'
};

export const FACEBOOK_ACCOUNT_NOT_FOUND = {
  status: 401,
  code: 103,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Facebook Account',
  details: 'Either the you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your Facebook Account'
};

export const INSTAGRAM_ACCOUNT_NOT_FOUND = {
  status: 401,
  code: 104,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Instagram Account',
  details: 'Either the you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your Instagram Account'
};

export const TWITTER_ACCOUNT_NOT_FOUND = {
  status: 401,
  code: 105,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Twitter Account',
  details: 'Either the you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your Twitter Account'
};

export const MODEL_NOT_UPDATED = {
  status: 400,
  code: 200,
  category: 'TransactionException',
  message: 'Update failed'
};

export const MODEL_NOT_CREATED = {
  status: 400,
  code: 201,
  category: 'TransactionException',
  message: 'Creation failed'
};

export const VALIDATION_ERROR = function (message: string, extra: string = ''): Object {
  return {
    status: 400,
    code: 202,
    category: 'ValidationException',
    message,
    extra
  };
};
