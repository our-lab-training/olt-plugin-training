const bindTypes = require('../safety-folder/types');

module.exports = {
  ...bindTypes,
  steps: [
    { text: 'Review Document or Complete Quiz/Induction', value: 'doc' },
    { text: 'Require Previous Training', value: 'perm-timeout' },
    { text: 'Comment (with link)', value: 'comment-link' },
  ],
};
