const Api = require('./api/Api');

const orm = [ 'test-dev', 'test-user', 'password',
  {
    dialect: 'sqlite',
  }
];

const api = new Api({
  orm,
});

api.start()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      const email = 'user@test.com';
      const defaultUser = {
        where: {
          email,
        },
        defaults: {
          email,
          password: 'test',
        }
      }
      api.orm.sequelize.models.user.findOrCreate(defaultUser)
      .then((user) => {
        console.log('user created', user[0].isNewRecord);
      })
    }
  });
