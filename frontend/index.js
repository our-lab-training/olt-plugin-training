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
      icon: 'fal fa-graduation-cap',
      priority: 110,
      visiblePerms: [
        '{groupId}.trainings.read',
      ],
    },
    inductions: {
      name: 'Inductions',
      entry: true,
      component: () => import('./inductions.vue'),
      path: '/group/{groupId}/inductions/:inductId?',
      icon: 'fal fa-clipboard-list-check',
      priority: 110,
      visiblePerms: [
        '{groupId}.inductions.inductor',
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
    inductions: {
      instanceDefaults: {
        name: '',
        bookingDesc: 'Below are a list of inductors, please contact one of them to arrange an induction.',
        list: [],
        published: null,
      },
    },
    'completed-inductions': {
      instanceDefaults: {
        list: [],
      },
    },
  },
  perms,
};
