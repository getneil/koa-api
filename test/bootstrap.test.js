'use strict';

const fs = require('fs-extra');
const chai = require('chai');
const sinon = require('sinon');
const Api = require('../api/Api');
const tmpFolder = `${process.cwd()}/.tmp`;

const helper = require('./helper');

before(function(done) {
  if(!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
  };

  const orm = [ 'test-dev', 'test-user', 'password',
    {
      dialect: 'sqlite',
    }
  ];

  const api = new Api({
    orm,
  });


  global.api = api;
  global.expect = chai.expect;
  global.sinon = sinon;

  Object.keys(helper).forEach((k) => {
    if (global[k]) throw new Error(`Global key '${k}' exists already.`);
    global[k] = helper[k];
  });
  api.start()
    .then(() => api.orm.sequelize.sync({force:true}))
    .then(() => {
      return api.orm.sequelize.models.user.create({
        email: 'user@test.com',
        password: 'test',
      })
    })
    .then(() => done());
});

after(function(done) {
  api.close();
  done();
});
