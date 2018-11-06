import placehold from './placehold.vue';

export default {
  ref: 'training',
  name: 'Training',
  settingsLink: '/group/{groupId}/training/settings',
  routes: {
    training: {
      name: 'My Training',
      entry: true,
      component: placehold,
      path: '/group/{groupId}/training',
      icon: 'school',
      priority: 110,
      visiblePerms: [
        '{groupId}.training.read',
      ],
    },
    trainingAdmin: {
      name: 'Manage Training',
      entry: true,
      component: placehold,
      path: '/group/{groupId}/training/admin',
      icon: 'format_list_numbered',
      priority: 20,
      visiblePerms: [
        '{groupId}.training.write',
      ],
    },
  },
  store: { training: {} },
};
