const Sequelize = require('sequelize');
const passwordHash = require('password-hash');

const validNewPassword = (password) => {
  return password && !(/\sha1$/.test(password));
}

const encryptPassword = (user) => {
  if(!passwordHash.isHashed(user.password)){
    user.password = passwordHash.generate(user.password);
  }
}

let sequelize;

module.exports = {
  sequelize: null,
  /*
  add directory as config later
  */
  initialize: function (config) {
    if (!config || !Array.isArray(config)) throw new Error('db configuration is undefined');
    this.sequelize = sequelize = new Sequelize(...config);

    const User = sequelize.define('user', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        email: {
          type: Sequelize.STRING,
          validate: {
            notEmpty: true,
          },
        },
        password: {
          type: Sequelize.STRING,
          validate: {
            notEmpty: true,
          },
        },
      },{
        hooks: {
          beforeCreate: [encryptPassword],
          beforeUpdate: [encryptPassword],
        },
        instanceMethods: {
          verifyPassword: function(password){
            return passwordHash.verify(password, this.password);
          },
        },
        timestamps: false,
      });
    const Group = sequelize.define('group', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING,
          validate: {
            notEmpty: true,
          },
        },
        ownerId: {
          type: Sequelize.INTEGER,
          references: {
            model: User,
            key: 'id',
          },
        },
      },{
        timestamps: false,
      });
    const Membership = sequelize.define('membership', {
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: User,
          key: 'id',
        },
      },
      groupId: {
        type: Sequelize.INTEGER,
        references: {
          model: Group,
          key: 'id',
        },
      },
    });
    const Issue = sequelize.define('issue', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        groupId: {
          type: Sequelize.INTEGER,
          references: {
            model: Group,
            key: 'id',
          },
        },
        reporterId: {
          type: Sequelize.INTEGER,
          references: {
            model: User,
            key: 'id',
          },
        },
        subject: {
          type: Sequelize.STRING(144),
          validate: {
            notEmpty: true,
          },
        },
        description: {
          type: Sequelize.TEXT,
          validate: {
            notEmpty: true,
          },
        },
        status: {
          type: Sequelize.STRING,
          validate: {
            isIn: [['open', 'recognized', 'closed']],
          },
          defaultValue: 'open',
        }
      })
    const Comment = sequelize.define('comment', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: User,
            key: 'id',
          },
        },
        issueId: {
          type: Sequelize.INTEGER,
          references: {
            model: Issue,
            key: 'id',
          },
        },
        comment: {
          type: Sequelize.TEXT,
          validate: {
            notEmpty: true,
          },
        }
      })

    User.ownedGroups = User.hasMany(Group, {
      foreignKey: 'ownerId',
      as: 'ownedGroups',
    })
    Group.owner = Group.belongsTo(User, {
      as: 'owner',
    });
    User.groups = User.belongsToMany(Group, {
      through: Membership,
      foreignKey: 'userId',
      as: 'groups',
    });
    Group.members = Group.belongsToMany(User, {
      through: Membership,
      foreignKey: 'groupId',
      as: 'members',
    });

    // User.issues = User.hasMany(Issue, {
    //   foreignKey: 'reporterId',
    //   as: 'issues',
    // })
    Group.issues = Group.hasMany(Issue, {
      foreignKey: 'groupId',
      as: 'issues',
    });
    Issue.comments = Issue.hasMany(Comment, {
      foreignKey: 'issueId',
      as: 'comments',
    });
    // User.comments = User.hasMany(Comment, {
    //   foreignKey: 'userId',
    //   as: 'comments',
    // });
    Comment.user = Comment.belongsTo(User, {
      as: 'user',
    });

    this.models = {
      User,
      Group,
      Membership,
      Issue,
      Comment,
    }


    return this.sequelize.sync()
      .then(() => this);
  },
  middleware: () => {
    return function *(ctx, next) {
      "use strict";
      ctx.orm = sequelize;
      yield next();
    }
  },
}
