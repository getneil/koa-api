describe('authentication', () => {
  let session;
  before(() => {
    session = getSession();
  })
  it('GET /api/session should be working', () => {
    return session.get('api/session')
      .then((res) => {
        expect(res.body.jwt).to.be.false; // no session
      });
  });
  it('should be able to login', () => {
    return session.login()
      .then(() => session.get('api/session'))
      .then((res) => {
        expect(res.body.jwt).to.be.ok;
      })
  });
  it('should be able to logout', () => {
    return session.logout();
  });
});
