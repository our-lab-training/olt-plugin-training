const { authenticate } = require('@feathersjs/authentication').hooks;
const safeRemove = require('../../../../../hooks/safe-remove');
const checkComplete = require('../../hooks/checkComplete');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [safeRemove()]
  },

  after: {
    all: [checkComplete()],
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
