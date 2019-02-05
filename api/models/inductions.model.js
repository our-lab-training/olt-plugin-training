// induction-model.js - A mongoose model

const DefaultSchema = require('../../../../types/default.schema');
const nameType = require('../../../../types/name.type');
const ObjectIdType = require('../../../../types/objectId.type');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const inductions = DefaultSchema(app);
  inductions.add({
    name: nameType(),
    groupId: ObjectIdType('groups', app),
    public: {
      type: Boolean,
      default: false,
      required: true,
    },
    list: [{
      name: nameType(),
      children: [{
        name: nameType(),
      }],
    }],
  });

  return mongooseClient.model('inductions', inductions);
};
