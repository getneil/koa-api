const fs = require('fs-extra');

describe('Api', () => {
  it('should have database that is connected', () => {
    return api.services.orm.sequelize.authenticate();
  });
  it.skip('should have all defined services', () => {
    const expectedServices = fs.readdirSync(`${process.cwd()}/api/services`);
    expectedServices.forEach(file => {
      const serviceName = file.replace('.js','');
      expect(api.services[serviceName]).to.be.ok;
    });
  });
})
