// @flow

export const FATAL_ERROR: Object = {
  status: 500,
  code: 0,
  category: 'IllegalStateException',
  message: 'An error occurred. If this error persists, please contact your System Administrator'
};

export const GENERAL_ERROR: Function = function (message: string, extra: string = ''): Object {
  return {
    status: 400,
    code: 0,
    category: 'GeneralException',
    message,
    extra
  };
};

export const NOT_YET_IMPLEMENTED: Object = {
  status: 501,
  code: 1,
  category: 'NotYetImplemented',
  message: 'This method must be implmented'
};

export const ILLEGAL_STATE_EXCEPTION: Object = {
  status: 500,
  code: 2,
  category: 'IllegalStateException',
  message: 'Application not configured correctly'
};

export const NOT_AUTHORIZED: Object = {
  status: 401,
  code: 3,
  category: 'SecurityException',
  message: 'You are not authorized to access this resource'
};

export const NOT_ALLOWED: Object = {
  status: 403,
  code: 4,
  category: 'SecurityException',
  message: 'You are not authorized to access this resource'
};

export const MISSING_REQUIRED_PARAMETER: Object = {
  status: 400,
  code: 5,
  category: 'GeneralException',
  message: 'A required parameter was missing'
};

export const MISSING_USERNAME_PARAMETER: Object = {
  status: 400,
  code: 6,
  category: 'GeneralException',
  message: 'The request parameter \'username\' is required'
};

export const MISSING_OAUTH_TOKEN_PARAMETER: Object = {
  status: 400,
  code: 7,
  category: 'GeneralException',
  message: 'The request parameter \'token\' is required'
};

export const MISSING_CLIENT_ID_PARAMETER: Object = {
  status: 400,
  code: 8,
  category: 'GeneralException',
  message: 'The request parameter \'clientId\' is required'
};

export const MISSING_PROFILE_PARAMETER: Object = {
  status: 400,
  code: 9,
  category: 'GeneralException',
  message: 'The request parameter \'profile\' is required'
};

export const MODEL_NOT_FOUND: Object = {
  status: 404,
  code: 100,
  category: 'NotFoundException',
  message: 'Requested model could not be found'
};

export const CLIENT_NOT_FOUND: Object = {
  status: 404,
  code: 100,
  category: 'IllegalStateException',
  message: 'Could not find client for user'
};

export const CLIENT_MISSING_CLIENT_URL: Object = {
  status: 404,
  code: 100,
  category: 'IllegalStateException',
  message: 'Could not find client url for user'
};

export const USER_NOT_FOUND: Object = {
  status: 401,
  code: 101,
  category: 'SecurityException',
  message: 'Invalid user credentials'
};

export const GOOGLE_ACCOUNT_NOT_FOUND: Object = {
  status: 401,
  code: 102,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Google Account',
  extra: 'Either you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your Google' +
    ' Account'
};

export const FACEBOOK_ACCOUNT_NOT_FOUND: Object = {
  status: 401,
  code: 103,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Facebook Account',
  extra: 'Either you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your ' +
    'Facebook Account'
};

export const INSTAGRAM_ACCOUNT_NOT_FOUND: Object = {
  status: 401,
  code: 104,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Instagram Account',
  extra: 'Either you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your ' +
    'Instagram Account'
};

export const TWITTER_ACCOUNT_NOT_FOUND: Object = {
  status: 401,
  code: 105,
  category: 'SecurityException',
  message: 'No ThriveHive Account found for that Twitter Account',
  extra: 'Either you don\'t have a ThriveHive Account or you have not linked your ThriveHive Account with your ' +
    'Twitter Account'
};

export const GOOGLE_ACCOUNT_EXISTS: Object = {
  status: 400,
  code: 106,
  category: 'TransactionException',
  message: 'That Google Account is already linked to a user'
};

export const GOOGLE_ACCOUNT_LINKED: Object = {
  status: 400,
  code: 107,
  category: 'TransactionException',
  message: 'That Google Account is already linked to the user'
};

export const FACEBOOK_ACCOUNT_EXISTS: Object = {
  status: 400,
  code: 108,
  category: 'TransactionException',
  message: 'That Facebook Account is already linked to a user'
};

export const FACEBOOK_ACCOUNT_LINKED: Object = {
  status: 400,
  code: 109,
  category: 'TransactionException',
  message: 'That Facebook Account is already linked to the user'
};

export const INSTAGRAM_ACCOUNT_EXISTS: Object = {
  status: 400,
  code: 110,
  category: 'TransactionException',
  message: 'That Instagram Account is already linked to a user'
};

export const INSTAGRAM_ACCOUNT_LINKED: Object = {
  status: 400,
  code: 111,
  category: 'TransactionException',
  message: 'That Instagram Account is already linked to the user'
};

export const TWITTER_ACCOUNT_EXISTS: Object = {
  status: 400,
  code: 110,
  category: 'TransactionException',
  message: 'That Twitter Account is already linked to a user'
};

export const TWITTER_ACCOUNT_LINKED: Object = {
  status: 400,
  code: 111,
  category: 'TransactionException',
  message: 'That Twitter Account is already linked to the user'
};

export const FACEBOOK_ACCOUNT_NOT_CONFIGURED: Object = {
  status: 500,
  code: 112,
  category: 'SecurityException',
  message: 'Google OAuth2 has not been properly configured'
};

export const SOCIAL_OATUH_NOT_CONFIGURED: Object = {
  status: 500,
  code: 112,
  category: 'SecurityException',
  message: 'OAuth2 for that account has not been properly configured'
};

export const MODEL_NOT_UPDATED: Object = {
  status: 400,
  code: 200,
  category: 'TransactionException',
  message: 'Update failed'
};

export const MODEL_NOT_CREATED: Object = {
  status: 400,
  code: 201,
  category: 'TransactionException',
  message: 'Creation failed'
};

export const VALIDATION_ERROR: Function = function (message: string, extra: string = ''): Object {
  return {
    status: 400,
    code: 202,
    category: 'ValidationException',
    message,
    extra
  };
};
