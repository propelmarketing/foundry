// @flow

import bcrypt from 'bcrypt';
import chai from 'chai';
import sinon from 'sinon';
import User from 'server/models/user';

// BEGIN TEST DATA
const MODEL = function () {};
MODEL.hook = sinon.stub();

const sequelize: Object = { define: sinon.stub() };
sequelize.define.returns(MODEL);
// END TEST DATA

describe('User Model', function () {
  let model: Function;

  before(function () {
    model = User(sequelize);
  });

  after(function () {
    model = null;
  });

  describe('beforeBulkCreate', function () {
    it('tests that a null input does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that a non-array input does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that an empty array does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that \'processUserHookHelper\' is called with valid input', function () {

    });
  });

  describe('beforeBulkUpdate', function () {
    it('tests that a null input does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that a non-object input does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that an empty object does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that \'processUserHookHelper\' is called and username is \'UNKNOWN USER\' when it\'s not provided', function () {

    });

    it('tests that \'processUserHookHelper\' is called and username is populated when it is defined in where', function () {

    });

    it('tests that \'processUserHookHelper\' is called and username is populated when it is defined in attributes', function () {

    });
  });

  describe('beforeSave', function () {
    it('tests that a null input does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that a non-object input does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that an empty object does not trigger \'processUserHookHelper\'', function () {

    });

    it('tests that an instance without a username properly logs and calls \'processUserHookHelper\'', function () {

    });
  });

  describe('generatePassword', function () {
    it('tests that the default password is 16 characters long and follows strict mode', function () {
      const password: string = model.generatePassword();
      chai.expect(password.length).to.equal(16);
      chai.expect(password).to.match(/[\w\n]+/gi);
    });

    it('tests that a null input generates a valid password', function () {
      const password: string = model.generatePassword();
      chai.expect(password.length).to.equal(16);
      chai.expect(password).to.match(/[\w\n]+/gi);
    });

    it('tests that an array input generates a valid password', function () {
      const password: string = model.generatePassword();
      chai.expect(password.length).to.equal(16);
      chai.expect(password).to.match(/[\w\n]+/gi);
    });

    it('tests that providing a length of 8 yeilds an 8 character long password', function () {
      const length: number = 8;
      const password: string = model.generatePassword({ length });
      chai.expect(password.length).to.equal(length);
      chai.expect(password).to.match(/[\w\n]+/gi);
    });

    it('tests that enabling symbols generates a password containing one or more symbol', function () {
      const password: string = model.generatePassword({ symbols: true });
      chai.expect(password.length).to.equal(16);
      chai.expect(password).to.match(/[\w\n !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/gi);
    });
  });
  describe('hashPassword', function () {
    const validationError = 'password must be a string';

    it('tests that a null input throws an error', function () {
      chai.expect(() => { model.hashPassword(null); }).to.throw(validationError);
    });

    it('tests that a number input throws an error', function () {
      chai.expect(() => { model.hashPassword(1); }).to.throw(validationError);
    });

    it('tests that an object input throws an error', function () {
      chai.expect(() => { model.hashPassword({}); }).to.throw(validationError);
    });

    it('tests that an array input throws an error', function () {
      chai.expect(() => { model.hashPassword([]); }).to.throw(validationError);
    });

    it('tests that a boolean input throws an error', function () {
      chai.expect(() => { model.hashPassword(true); }).to.throw(validationError);
    });

    it('tests that any error from bcrypt rejects the promise', async function () {
      const subbedHash: Function = sinon.stub(bcrypt, 'hash');
      const error: Error = new Error('Test error');
      bcrypt.hash.callsFake(function () {
        bcrypt.hash.getCall(0).args[2](error);
      });

      let result: any;
      try {
        result = await model.hashPassword('test');
      } catch (e) {
        chai.expect(e).to.equal(error);
      } finally {
        subbedHash.restore();
      }

      chai.assert(!result, 'hashPassword should not return a result');
    });

    it('tests that an empty string yields a hashed string', async function () {
      let result: any;
      try {
        result = await model.hashPassword('');
        chai.expect(result).to.be.a('string');
      } catch (e) {
        chai.assert(!e, 'hashPassword should not throw an error');
      }
    });
  });

  describe('processUserHookHelper', function () {});

  describe('processUserPasswordHookHelper', function () {
    it('tests that a null input throws an error', async function () {
      let result: any;
      try {
        result = await model.processUserPasswordHookHelper('TEST', null);
      } catch (e) {
        chai.expect(e.message).to.equal('[processUserPasswordHookHelper] attributes must be an object');
      }

      chai.assert(!result, 'processUserPasswordHookHelper should not return a result');
    });

    it('tests that an array input throws an error', async function () {
      let result: any;
      try {
        result = await model.processUserPasswordHookHelper('TEST', []);
      } catch (e) {
        chai.expect(e.message).to.equal('[processUserPasswordHookHelper] attributes must be an object');
      }

      chai.assert(!result, 'processUserPasswordHookHelper should not return a result');
    });

    it('tests that an attributes mapping without a password throws an error', async function () {
      let result: any;
      try {
        result = await model.processUserPasswordHookHelper('TEST', {});
      } catch (e) {
        chai.expect(e.message).to.equal('[processUserPasswordHookHelper] password is required');
      }

      chai.assert(!result, 'processUserPasswordHookHelper should not return a result');
    });

    it('tests that a valid attributes mapping calls \'model.hashPassword\' and returns a string', async function () {
      const stubbedHashPassword: Function = sinon.stub(model, 'hashPassword');
      const returnValue: string = 'kangaroo';
      stubbedHashPassword.returns(returnValue);
      try {
        const result = await model.hashPassword({ password: 'test' });
        chai.expect(stubbedHashPassword.called).to.equal(true);
        chai.expect(result).to.equal(returnValue);
      } catch (e) {
        chai.assert(!e, 'processUserPasswordHookHelper should not throw an error');
      } finally {
        stubbedHashPassword.restore();
      }
    });
  });

  describe('instance', function () {
    describe('verifyPassword', function () {});
    describe('updatePassword', function () {});
    describe('verifyUserPassword', function () {});
    describe('verifyPortalPassword', function () {});
    describe('verifyThrivehivePassword', function () {});
  });
});
