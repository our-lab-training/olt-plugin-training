// induction-model.js - A mongoose model

const DefaultSchema = require('../../../../types/default.schema');
const nameType = require('../../../../types/name.type');
const ObjectIdType = require('../../../../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const completedInductions = DefaultSchema(app);
  completedInductions.add({
    inductId: ObjectIdType('inductions', app),
    userIds: [ObjectIdType('users', app)],
    list: [{
      name: nameType(),
      children: [{
        name: nameType(),
        checked: {
          type: Boolean,
          default: false,
          required: true,
        },
      }],
    }],
    done: {
      type: Boolean,
      default: false,
      required: true,
    },
  });

  return mongooseClient.model('completed-inductions', completedInductions);
};
