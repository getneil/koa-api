const io = require('socket.io-client');
describe('try', () => {
  let client;
  before((done) => {
    client = io.connect('http://localhost:8000');
    client.on('connect', () => {
      console.log('CLIENT: socket.io client connected');
      done();
    });
  });
  it('test', () => {
    expect(true).to.be.true;
  });
})
