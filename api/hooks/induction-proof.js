// const request = require('request-promise-native');
// const errors = require('@feathersjs/errors');
const { getItems, replaceItems } = require('feathers-hooks-common');
const markdownpdf = require('markdown-pdf');
const _ = require('lodash');

const md2pdf = (md) => {
  return new Promise((resolve, reject) => {
    markdownpdf().from.string(md).to.buffer({encoding: 'buffer'}, (err, buff) => {
      if(err) reject(err);
      else resolve(buff);
    });
  });
};

const s3Upload = (app, key, buff) => {
  return new Promise((resolve) => {
    app.buckets.private.putObject({
      Key: key,
      Body: buff,
      ContentType: 'application/pdf',
    }, resolve);
  });
};

const ensurePath = async (context, groupId, path) => {
  const content = context.app.service('content');
  const folders = path.split('/');
  const name = folders.pop();
  let parent;
  if (folders.length) parent = await ensurePath(context, groupId, folders.join('/'));
  else parent = (await content.find({ query: { groupId, name: '.directory', parent: {$exists: false} } }))[0]._id;

  let folder = (await content.find({ query: { groupId, parent, name } }))[0];
  if (!folder) folder = await content.create({ groupId, parent, name, type: 'text/x-directory', ext: 'directory' });

  return folder._id;
};

const twodigit = v => `${v < 10 ? '0' : ''}${v}`;

const inductionProof = async (context, item) => {
  if (item.proofId || !item.done) return item;
  const { app } = context;
  const induction = await app.service('inductions').get(item.inductId);
  const users = await app.service('users').find({ query: { _id: { $in: item.userIds } }, paginate: false });
  const inductor = await app.service('users').get(item.inductorId || item.createdBy);
  const parent = await ensurePath(context, induction.groupId, `Inductions/${item.inductId}/proof`);
  const proof = await app.service('content').create({
    groupId: induction.groupId,
    parent,
    name: `${Date.now()}.pdf`,
    type: 'application/pdf',
    ext: 'pdf',
  });
  const date = new Date(item.completedAt || item.createdAt);
  item.proofMd = `
# In-Person Induction Record - ${induction.name}
This document is automatically generated upon the completion of an induction and serves as proof that the induction took place.
In order to create this, both parties had to use their UWA pheme login credentials and accept the content covered, this acts as a digital signature.

## Date/Time of Induction Completion
Date: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
Time: ${twodigit(date.getHours())}:${twodigit(date.getMinutes())}

## Induction Checklist
The following items were covered in the induction, and subsequently checked as complete by the inductor:
${
  item.list.reduce((a, li) => `${a}
- **${li.name}**
${
  li.children.reduce((a, ch) => `${a}
  - ${ch.checked ? '☑' : '☐'} ${ch.name}
`, '')
}
`, '')
}
## Inductees Signed Off
The following people were present and agreed to having received and to the content of the induction:
${
  users.reduce((a, user) => `${a}
- ${user.profile.firstname} ${user.profile.lastname} (${user.username})
`, '')
}
## Inductor
This induction was approved by:
${inductor.profile.firstname} ${inductor.profile.lastname} (${inductor.username})
`;
  const fileBuff = await md2pdf(item.proofMd);
  await s3Upload(app, proof.key, fileBuff);
  item.proofId = proof._id;
  return item;
};

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    if (context.existing && context.existing.proofId) return context;
    let items = getItems(context);

    if (Array.isArray(items)) items = await Promise.all(items.map(item => inductionProof(context, _.merge({}, context.existing || {}, item))));
    else items = await inductionProof(context, _.merge({}, context.existing || {}, items));
    
    replaceItems(context, items);
    return context;
  };
};