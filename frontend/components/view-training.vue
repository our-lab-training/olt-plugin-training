<template>
  <v-card>
    <ve-toolbar
      :binder="binder"
    />
    <v-card-text v-if="train.name">
      {{train.name}}
    </v-card-text>
    <v-card-text>
      <v-layout row wrap>
          <v-flex shrink>
            <h2>Documents</h2>
          </v-flex>
          <v-spacer/>
          <v-flex xs12><v-list>
            <v-list-group
              v-for="cat in Object.keys(items)"
              :key="cat"
              :value="true"
              no-action
            >
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ (type.cats.find(c => c.value === cat) || {}).text }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile
                v-for="(item, i) in items[cat]"
                :key="i"
                :to="`../${item.type}/${item.itemId}`"
              >
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{item.data.name}}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>
          </v-list></v-flex>
        </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import veToolbar from './view-edit-toolbar.vue';

export default {
  components: {
    veToolbar,
  },
  data() {
    return {
      binder: { items: [] },
      types: [
        {
          text: 'Workspace',
          value: 'workspace',
          cats: [
            { text: 'Risk Assessment', value: 'risk-ass', required: true },
            { text: 'Local Health and Safety Manual', value: 'manual', required: true },
            { text: 'Quiz', value: 'quiz' },
            { text: 'Induction', value: 'induct' },
            { text: 'Other', value: 'other' },
          ],
        },
        {
          text: 'Task/Process',
          value: 'task',
          cats: [
            { text: 'Risk Assessment', value: 'risk-ass' },
            { text: 'Method Statement', value: 'meth-state' },
            { text: 'Other', value: 'other' },
          ],
        },
        {
          text: 'Tool/Equipment',
          value: 'tool',
          cats: [
            { text: 'Risk Assessment', value: 'risk-ass', required: true },
            { text: 'Standard Operating Procedure', value: 'sop', required: true },
            { text: 'Operation Manual', value: 'manual', required: true },
            { text: 'Quiz', value: 'quiz' },
            { text: 'Induction', value: 'induct' },
            { text: 'Other', value: 'other' },
          ],
        },
      ],
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { getBind: 'get' }),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.binder.write`); },
    type() { return this.types.find(t => t.value === this.binder.type); },
    items() {
      const items = groupBy(cloneDeep(this.binder.items), 'category');
      Object.values(items).forEach(catItems => catItems.forEach((item) => {
        item.data = this.$store.getters[`${item.type}/get`](item.itemId) || {};
      }));
      return items;
    },
  },
  methods: {
    setBind() {
      const bind = this.getBind(this.id);
      if (!bind) return this.$router.push('./');
      this.binder = bind;
      return this.binder;
    },
  },
  mounted() {
    this.setBind();
  },
  watch: {
    id() {
      this.setBind();
    },
  },
};
</script>
