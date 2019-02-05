
const { authenticate } = require('@feathersjs/authentication').hooks;
const { iff, disallow, discard } = require('feathers-hooks-common');
const restrictMethod = require('../../../../../hooks/restrict-method');
const safeRemove = require('../../../../../hooks/safe-remove');
const validateUsers = require('../../hooks/validate-users');
const addInductionPerm = require('../../hooks/add-induction-perm');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      restrictMethod('inductions.{data.inductId}.inductor'),
      discard('userIds'),
      validateUsers(),
    ],
    update: [
      restrictMethod('inductions.{data.inductId}.inductor'),
      iff(cont => cont.existing && cont.existing.done, disallow('external')),
      discard('userIds'),
      validateUsers(),
    ],
    patch: [
      restrictMethod('inductions.{data.inductId}.inductor'),
      iff(cont => cont.existing && cont.existing.done, disallow('external')),
      discard('userIds'),
      validateUsers(),
    ],
    remove: [
      restrictMethod('superadmin.inductions.remove'),
      safeRemove(),
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      addInductionPerm(),
    ],
    update: [
      addInductionPerm(),
    ],
    patch: [
      addInductionPerm(),
    ],
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
