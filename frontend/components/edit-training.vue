<template>
  <v-card>
    <ve-toolbar
      :training="training"
    />
    <v-card-text>
      <v-container grid-list-xs>
        <v-layout row wrap>
          <v-flex xs12 sm6>
            <v-select
              label="Document Set"
              :disabled="bindId !== 'new'"
              :items="bindId === 'new' ? binds : [binder]"
              item-text="name"
              item-value="_id"
              :value="training.bindId"
              @input="$router.push(`./${$event}?edit`)"
            />
          </v-flex>
          <v-flex xs12 sm6 v-if="bindId !== 'new'">
            <v-text-field
              label="Training Name"
              v-model="training.name"
            />
          </v-flex>
          <v-flex xs12 sm6 v-if="bindId !== 'new'">
            <v-switch
              label="Publish"
              :value="!!training.publish"
              @input="training.publish = $event ? new Date() : null"
            />
          </v-flex>
        </v-layout>
        <v-layout row wrap v-if="bindId !== 'new'">
          <v-flex shrink>
            <h2>Steps</h2>
          </v-flex>
          <v-spacer/>
          <v-btn @click.stop="stepDialog = true">
            <v-icon left>far fa-plus</v-icon>
            <span>Add Step</span>
          </v-btn>
          <v-flex xs12><v-list>
            <v-list>
              <v-list-tile
                v-for="(step, i) in sortBy(training.steps, 'index')"
                :key="i"
              >
                <v-list-tile-content>
                  <v-list-tile-title v-text="step.name" />
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon
                    v-if="step.index - 1 > -1"
                    @click.stop="swap(step.index-1, step.index)"
                  >fal fa-arrow-up</v-icon>
                  <v-icon
                    v-if="step.index + 1 > training.steps.length"
                    @click.stop="swap(step.index, step.index+1)"
                  >fal fa-arrow-down</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-list></v-flex>
        </v-layout>
      </v-container>
      <v-dialog
        v-model="stepDialog"
        persistent
        max-width="500px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">Add Step</span>
          </v-card-title>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <v-select
                  label="Step Type"
                  required
                  :items="stepTypes"
                  v-model="step.type"
                />
              </v-flex>
              <v-flex xs12 sm6 v-if="step.type === 'doc'">
                <v-select
                  label="Document"
                  required
                  :items="binder.steps"
                  item-text="data.name"
                  item-value="_id"
                  v-model="step.docId"
                  @input="step.name = `Review ${binder.steps.find(i=>i._id === $event).data.name}`"
                />
              </v-flex>
              <v-flex xs12 sm6 v-if="step.type === 'perm-timeout'">
                <v-select
                  label="Training Module"
                  required
                  :items="otherTrains"
                  item-text="name"
                  item-value="_id"
                  :value="trainId"
                  @input="
                    step.perm = `${currentGroup._id}.training.${$event}.complete`
                    step.name = `Finish ${otherTrains.find(i=>i._id === $event).name} Training.`
                  "
                />
              </v-flex>
              <v-flex
                xs12 sm6
                v-if="
                  step.type
                  && (step.type !== 'doc' || step.docId)
                  && (step.type !== 'perm-timeout' || trainId)
                "
              >
                <v-text-field label="Step Name" required v-model="step.name"/>
              </v-flex>
              <v-flex xs12 sm6 v-if="step.type === 'perm-timeout' && trainId">
                <v-text-field
                  label="Cooldown Duration (days)"
                  note="Days to wait after training is completed. 0 = none."
                  required
                  :value="step.duration || 0"
                  @input="step.duration = $event"
                  min="0"
                  max="365"
                  step="1"
                />
              </v-flex>
              <v-flex xs12 v-if="step.type === 'comment-link'">
                <v-text-field
                  label="Link"
                  note="(optional) Starts with http:// or https://"
                  required
                  type="url"
                  :value="step.link || ''"
                  @input="step.link = $event"
                />
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-spacer/>
            <v-btn flat @click.native="stepDialog = false">Close</v-btn>
            <v-btn
              color="primary" flat
              @click.native="stepAdd"
              :disabled="!stepValid"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import sortBy from 'lodash/sortBy';
import veToolbar from './view-edit-toolbar.vue';

export default {
  components: {
    veToolbar,
  },
  data() {
    return {
      sortBy,
      training: { steps: [] },
      stepDialog: false,
      step: {},
      stepTypes: [
        { text: 'Review Document or Complete Quiz/Induction', value: 'doc' },
        { text: 'Require Previous Training', value: 'perm-timeout' },
        { text: 'Comment (with link)', value: 'comment-link' },
      ],
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { getBind: 'get', findBind: 'find' }),
    ...mapGetters('trainings', { getTrain: 'get', findTrain: 'find' }),
    ...mapState('binders', ['isCreatePending', 'isPatchPending']),
    bindId() { return this.$route.params.bindId; },
    binder() {
      const bind = this.getBind(this.bindId) || { items: [] };
      bind.items.forEach((i) => {
        i.data = this.$store.getters[`${i.type}/get`](i.itemId) || {};
      });
      return bind;
    },
    otherTrains() {
      return this.findTrain({
        query: {
          bindId: { $ne: this.bindId },
          $or: [
            { groupId: this.currentGroup._id },
            { public: true },
          ],
        },
      }).data;
    },
    binds() {
      return this.findBind({
        query: {
          _id: { $nin: this.otherTrains.map(t => t.bindId) },
          groupId: this.currentGroup._id,
        },
      }).data;
    },
    trainId() {
      return this.step.perm
        ? (this.step.perm.match(/(?<=training\.)[0-9abcdef]{24}(?=\.complete)/) || [])[0]
        : null;
    },
    stepValid() {
      return this.step.type && this.step.name
      && (
        (this.step.type === 'doc' && this.step.docId)
        || (
          this.step.type === 'perm-timeout' && this.trainId
          && this.step.duration >= 0 && this.step.duration <= 365
        )
        || this.step.type === 'comment-link'
      );
    },
  },
  methods: {
    setTrain() {
      if (this.bindId === 'new') return null;
      const { Training } = this.$FeathersVuex;
      const bindId = (this.binder || {})._id;
      if (!bindId) return this.$router.push('./');
      let [train] = this.findTrain({ query: { bindId } }).data;
      if (!train) {
        train = new Training({
          bindId,
          groupId: this.currentGroup._id,
          name: `${this.binder.name} Training`,
        });
      }
      this.training = train;
      return train;
    },
    swap(a, b) {
      this.training.steps.forEach((s) => {
        if (s.index === a) s.index = b;
        else if (s.index === b) s.index = a;
      });
      this.training.steps = sortBy(this.training.steps, 'index');
    },
    stepAdd() {
      this.step.index = this.training.steps.length;
      this.training.steps.push(this.step);
      this.step = {};
      this.stepDialog = false;
    },
  },
  mounted() {
    this.setTrain();
  },
  watch: {
    binder() { this.setTrain(); },
  },
};
</script>
