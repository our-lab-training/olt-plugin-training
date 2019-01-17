<template>
  <v-card>
    <v-toolbar dense class="binder-list">
      <!-- <v-flex shrink>
        <v-select
          :items="types"
          v-model="type"
        />
      </v-flex> -->
      <v-toolbar-title>My Training</v-toolbar-title>
      <v-spacer />
      <v-flex shrink>
        <v-text-field
          v-model="search"
          append-icon="far fa-search"
        />
      </v-flex>
      <v-tooltip top>
        <v-btn
          v-if="writePerm && bindId !== 'new'"
          slot="activator"
          to="./new"
          flat icon
        >
          <v-icon>far fa-plus</v-icon>
        </v-btn>
        <span>New Training</span>
      </v-tooltip>
    </v-toolbar>
    <v-list three-line>
      <v-list-tile
        v-for="train in trains"
        :key="train._id"
        :to="`./${train._id}`"
      >
        <v-list-tile-content>
          <v-list-tile-title v-text="train.name" />
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-if="!trains.length" :to="writePerm ? './new' : '#'">
        <v-list-tile-content>
          <v-list-tile-title v-text="'No Training Found!'" />
          <v-list-tile-sub-title v-if="writePerm" class="text--primary">
            <v-icon style="font-size: inherit;">far fa-plus</v-icon>
            Create new training
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      search: '',
      types: [
        { text: 'All', value: '' },
        { text: 'Workspace', value: 'workspace' },
        { text: 'Task/Process', value: 'task' },
        { text: 'Tool/Equipment', value: 'tool' },
      ],
      type: '',
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('trainings', { findTrain: 'find' }),
    bindId() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.training.write`); },
    trains() {
      const query = {
        groupId: this.currentGroup._id,
        publised: v => (new Date(v)).getTime() < Date.now(),
      };
      if (this.search) {
        const reg = RegExp(`(${this.search.replace(/\s/g, ')|(')})`, 'i');
        query.name = reg.test;
      }
      return this.findTrain({ query }).data;
    },
  },
};
</script>

<style lang="stylus" scoped>
.binder-list >>> .v-select,
.binder-list >>> .v-text-field
  width min-content
  min-width 100px
</style>
