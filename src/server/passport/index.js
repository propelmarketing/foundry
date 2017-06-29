// @flow

import passport from 'passport';

// Strategies
import facebook from 'server/passport/facebook';
import google from 'server/passport/google';
import local from 'server/passport/local';
import twitter from 'server/passport/twitter';

export default passport;
export { facebook, google, local, twitter };
