
const { authenticate } = require('@feathersjs/authentication').hooks;
const safeRemove = require('../../../../../hooks/safe-remove');
const restrictMethod = require('../../../../../hooks/restrict-method');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [restrictMethod(['{data.groupId}.inductions.write'])],
    update: [restrictMethod(['{data.groupId}.inductions.write'])],
    patch: [restrictMethod(['{data.groupId}.inductions.write'])],
    remove: [restrictMethod(['{data.groupId}.inductions.write']), safeRemove()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
