describe('orm service', () => {
  let models;
  let User;

  let mockUser = {
    email: 'user-mock@boilerplate.com',
    password: 'test',
  }

  before(() => {
    models = api.orm.sequelize.models;
    User = models.user;
    return User.create(mockUser)
      .then((user) => {
        mockUser = user;
      });
  })
  it('user create', () => {
    expect(mockUser.id).to.be.ok;
  });
})
