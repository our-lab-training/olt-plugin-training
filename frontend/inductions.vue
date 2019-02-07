<template>
  <v-container grid-list-md>
    <v-layout row wrap justify-center>
      <v-flex xs12 :md4="id" :md6="!id" v-if="!id || this.$vuetify.breakpoint.mdAndUp">
        <list-induct />
      </v-flex>
      <v-flex xs12 md8 v-if="id">
        <edit-induct v-if="edit" />
        <stat-induct v-else-if="stat" />
        <view-induct v-else />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import editInduct from './components/inductions/edit-inductions.vue';
import listInduct from './components/inductions/list-inductions.vue';
import viewInduct from './components/inductions/view-inductions.vue';
import statInduct from './components/inductions/stat-inductions.vue';

export default {
  components: {
    editInduct,
    listInduct,
    viewInduct,
    statInduct,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    id() { return this.$route.params.inductId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.inductions.write`); },
    edit() { return this.writePerm && (typeof this.$route.query.edit !== 'undefined' || this.id === 'new'); },
    stat() { return this.writePerm && typeof this.$route.query.stats !== 'undefined'; },
  },
  methods: {
    ...mapActions('inductions', ['find']),
    ...mapMutations('inductions', ['setCurrent']),
  },
  async mounted() {
    await this.find({ query: { groupId: this.currentGroup._id } });
  },
  watch: {
    id(v) { this.setCurrent(v); },
  },
};
</script>