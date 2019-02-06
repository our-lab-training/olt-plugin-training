<template>
  <v-card>
    <ve-toolbar
      :induction="induction"
      @refresh="refresh();"
    />
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import veToolbar from './view-edit-toolbar.vue';

export default {
  components: {
    veToolbar,
  },
  data() {
    return {
      rand: 0,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('inductions', { getInduct: 'get', findInduct: 'find', induction: 'current' }),
    ...mapState('perms', ['isCreatePending']),
    inductId() { return this.$route.params.inductId; },
  },
  methods: {
    async refresh() {
      const inductId = (this.induction || {})._id;
      await this.$store.dispatch('inductions/get', inductId);
    },
  },
};
</script>
