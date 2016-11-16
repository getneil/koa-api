const Koa = require('koa');

const http = require('http');
const jsonwebtoken = require('jsonwebtoken');
const body = require('koa-body');
const router = require('koa-router');
const co = require('co');

const session = require('koa-session-store');
const SessionStore = require('./services/SessionStore');
const orm = require('./services/orm');

const appName = 'panicApp';
const tmpFolder = `${process.cwd()}/.tmp`;
class Api {
  constructor(configuration) {
    this.app = new Koa();
    this.JWT_SECRET = configuration.JWT_SECRET || 'secret';
    this.ormConfiguration = configuration.orm;

    this.services = {
      orm,
    };

    this.app.keys = ['secret', 'key'];

    this.router = router();
    this.hasSession = false;
    const api = this;

    this.router
      .get('/api/session', function (ctx,next){
        const jwt = ctx.session.jwt || false;
        ctx.body = { jwt };
      })
      .post('/api/session',
        co.wrap(body()),
        function (ctx, next) {
          const cred = ctx.request.body;

          if (cred && cred.email && cred.password) {
            const searchConfig = {
              where: {
                email: cred.email,
              },
            };

            return ctx.orm.models.user.findOne(searchConfig)
              .then((user) => {
                if (user && user.verifyPassword(cred.password)) {
                  ctx.user = user;
                }
                return next();
              });
          }
        },
        function (ctx, next) {
          if (ctx.user) {
            const cred = ctx.request.body;
            const jwt = jsonwebtoken.sign({
                email: cred.email,
                password: cred.password,
              }, api.JWT_SECRET);

            ctx.session = {
              id: ctx.user.id,
              jwt,
            }
            ctx.body = {
              jwt,
            }
          } else {
            ctx.body = { jwt: false };
          }
        }
      )
      .del('/api/session', (ctx, next) => {
        ctx.session = null;
        ctx.body = 'logout';
      })

    this.app
      .use(co.wrap(orm.middleware()))
      .use(session({
        name: appName,
        store: new SessionStore(),
        cookie: {
          signed: true, // cookie is signed using KeyGrip
          httpOnly: true, // cookie is not accessible via client-side JS
          overwrite: true, // overwrite existing cookie datawhen setting cookie
        }
      }))
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .use((ctx) => {
        console.log(ctx);
      })


    this.server = http.createServer(this.app.callback());

    const io = require('socket.io')(this.server);
    io.on('connection', function(){
      console.log('API: connection received');
    });
  }
  start() {
    return orm.initialize(this.ormConfiguration)
      .then(() => {
        this.orm = orm;
        console.log('API server listenting in port:8000')
        this.server.listen(8000);
      });
  }
  close() {
    this.server.close();
  }
}
module.exports = Api;
module.exports.defaults = Api;
