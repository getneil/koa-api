const co = require('co');

describe('orm service', () => {
  let orm;
  before(() => {
    orm = api.services.orm;
  });
  after(() => {
    return orm.models.User.destroy({where:{}});
  });
  it('should attach the orm to ctx.orm when used as middleware', () => {
    const ctx = {};
    co.wrap(orm.middleware())(ctx);
    expect(ctx.orm).to.be.ok;
  });

  describe('user model:', () => {
    it('should be able to create a user', () => {
      const user = {
        email: 'user-1@test.com',
        password: 'test',
      }
      return orm.models.User.create(user);
    });
    it('shold be able to hash password when creating new user', () => {
      const user = {
        email: 'user-2@test.com',
        password: 'test',
      }
      return orm.models.User.create(user)
        .then((result) => {
          expect(result.email).to.equal(user.email);
          expect(result.password).to.be.ok;
          expect(result.password).to.not.equal(user.password);
        });
    });
    it('should be able to hash password when udpating existing user', () => {
      const user = {
        email: 'user-3@test.com',
        password: 'test',
      }
      let firstPasswordHash;
      return orm.models.User.create(user)
        .then((userInstance) => {
          firstPasswordHash = userInstance.password;
          userInstance.password = 'newPassword';
          return userInstance.save();
        })
        .then((updatedUser) => {
          expect(updatedUser.password).to.be.ok;
          expect(updatedUser.password).to.not.be.equal(firstPasswordHash);
        });
    });
  })
  it.skip('should have all expected associations', () => {

  });
  it.skip('should have sequelize connection exposed', () => {

  });
})
