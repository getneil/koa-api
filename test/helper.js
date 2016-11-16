const request = require('supertest-as-promised');

class Session {
  constructor(email = 'user@test.com', password = 'test'){
    this.email = email;
    this.password = password;
    const port = 8000;
    this.session = request.agent(`http://localhost:${port}/`);
  }
  logout() {
    return this.del('api/session')
      .then((res) => {
        expect(res.status).to.equal(200);
      });
  }
  login() {
    const email = this.email;
    return this.session.post('api/session')
      .send({
        email,
        password: this.password,
      })
      .expect(200)
      .then((res) => {
        expect(res.body.jwt).to.be.ok;
        return api.services.orm.models.User.findOne({ email });
      })
      .then((user) => {
        this.userId = user.id;
        return this;
      });
  }

  request(type, path, data) {
    const req = this.session[type](path)
    // req.set('api-mewe', true);
    if (data) {
      let action = 'send';
      if(type === 'get') action = 'query';
      req[action](data);
    };
    return req;
  }
  get(path, query) {
    return this.request('get', path, query);
  }
  del(path) {
    return this.request('del', path);
  }
  post(path, data) {
    return this.request('post', path, data);
  }
  put(path, data) {
    return this.request('put', path, data);
  }
}

function getSession(email, password){

  const session = new Session(email, password);

  return session;
}

module.exports = {
  getSession,
}
