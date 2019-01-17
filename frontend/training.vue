<template>
  <v-container grid-list-md>
    <v-layout row wrap justify-center>
      <v-flex xs12 :md4="id" :md6="!id" v-if="!id || this.$vuetify.breakpoint.mdAndUp">
        <list-train />
      </v-flex>
      <v-flex xs12 md8 v-if="id">
        <edit-train
          v-if="edit"
        />
        <view-train v-else />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import editTrain from './components/edit-training.vue';
import listTrain from './components/list-training.vue';
import viewTrain from './components/view-training.vue';

export default {
  components: {
    editTrain,
    listTrain,
    viewTrain,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.binder.write`); },
    edit() { return this.writePerm && (typeof this.$route.query.edit !== 'undefined' || this.id === 'new'); },
  },
  methods: {
    ...mapActions('binders', ['find']),
    ...mapMutations('binders', ['setCurrent']),
  },
  async mounted() {
    await this.find({ query: { groupId: this.currentGroup._id } });
  },
  watch: {
    id(v) { this.setCurrent(v); },
  },
};
</script>
