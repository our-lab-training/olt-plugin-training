import perms from '../perms';

export default {
  ref: 'training',
  name: 'Training',
  requires: ['safety-binder'],
  // settingsLink: '/group/{groupId}/training/settings',
  routes: {
    training: {
      name: 'My Training',
      entry: true,
      component: () => import('./training.vue'),
      path: '/group/{groupId}/training/:bindId?',
      icon: 'school',
      priority: 110,
      visiblePerms: [
        '{groupId}.trainings.read',
      ],
    },
  },
  store: {
    trainings: {
      instanceDefaults: {
        name: '',
        steps: [],
        published: null,
      },
    },
  },
  perms,
};
