// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const { getItems, replaceItems } = require('feathers-hooks-common');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { app, params } = context;
    if (!params.user) return context;
    const paginate = app.get('paginate');

    const checkComplete = async (item) => {
      item.binder = await app.service('binders').get(item.bindId);
      await Promise.all(item.steps.map(async (step) => {
        if (!step.required) return;
        let query = { perm: step.perm, grantee: params.user._id, $limit: 0 };
        if (step.type === 'perm-timeout' && step.duration > 0) {
          query.createdAt = { $lte: new Date(Date.now() - step.duration * 24 * 60 * 60 * 1000) };
        } else if (step.type === 'comment-link') {
          query.perm = ['trainings', `${step._id}`, 'accept'];
        } else if(step.type === 'doc') {
          if (step.docType === 'content') query.perm = ['trainings', `${step._id}`, 'accept'];
          else query.perm = [step.docType, `${(item.binder.items.find(i => `${i._id}` === `${step.docId}`) || {}).itemId}`, 'complete'];
        } else return;
        const { total } = await app.service('perms').find({ query, paginate });
        if (total) step.complete = true;
      }));
      const { total } = await app.service('perms').find({
        query: {
          perm: ['trainings', `${item._id}`, 'complete'],
          grantee: params.user._id,
          $limit: 0,
        },
      });
      if (total){
        item.complete = true;
        return;
      }
      if(item.steps.find(s => s.required && !s.complete)) return;
      item.complete = true;
      await app.service('perms').create({
        perm: ['trainings', `${item._id}`, 'complete'],
        grantee: params.user._id,
        type: 'users',
      });
    };

    const items = getItems(context);
    if (Array.isArray(items)) await Promise.all(items.map(checkComplete));
    else await checkComplete(items);

    replaceItems(context, items);

    return context;
  };
};
