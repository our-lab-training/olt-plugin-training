const inductions = require('./inductions/inductions.service.js');
const trainings = require('./trainings/trainings.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(inductions);
  app.configure(trainings);
};
