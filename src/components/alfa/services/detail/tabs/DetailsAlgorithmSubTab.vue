<template>
  <md-card>
    <template v-if="algorithm">
      <div clas="main-info">
        <p>Name: {{algorithm.shortDescription || algorithm.name}}</p>
        <p>Environment: {{algorithm.environment}}</p>
        <p>Last Call: {{algorithm.lastCall | dateFormat}}</p>
        <p>Calls in last month: {{algorithm.callsCount}}</p>
        <p>Response time: {{parseInt(algorithm.averageResponseTime) || 0}} milliseconds</p>
      </div>
      <div>
        <p>Listing of the errors: </p>
        <div class="mark-all-as-read" @click="markAllAsRead">Mark all as read<i class="material-icons">done</i></div>
        <div class="errors-wrapper">
          <div :class="['details-block', 'notification-item', message.isWatched?'watched':'']" v-for="(message, index) in algorithm.issues">
            <div @click="toggleMessage(message)">
              <md-icon>fiber_manual_record</md-icon>
              <div class="algorithm-name">{{message.customer}} {{message.time | dateFormat}}</div>
              <div v-if="message.show">
                <div class="time">
                  <span>[{{message.time | dateFormat}}]</span>
                </div>
                <div class="algorithm-message">
                  <div class="topic">Topic: {{message.topic}}</div>
                  Message: {{message.message}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </md-card>
</template>

<script>
import managedata from '../../../helpers/managedata.js';
const moment = require('moment');

export default {
  name: 'DetailsSubTab',
  data: function () {
    return {
    };
  },
  props: ['algorithm', 'currentTab', 'getAlgorithmsFullPath', 'urlBaas', 'urlMaas'],
  methods: {
    toggleMessage(message) {
      message.show = !message.show;
      this.$forceUpdate();
    },
    markAllAsRead(message) {
      let newErrors = this.algorithm.issues.map((err) => {
        err.show = !err.show;
        err.isWatched = true;
        /*managedata.markAlarmMessageAsRead(err, (response) => {
        }, (respErr) => {
          console.log(respErr);
        });*/
        return err;
      });
      Promise.all(newErrors).then(() => {
        this.algorithm.issues = newErrors;
        console.log('all messages was read');
        this.$forceUpdate();
      });
    },
    toggleMessage(message) {
      if(!message.isRead) {
        /*managedata.markAlarmMessageAsRead(message, (response) => {
          let newErrors = this.algorithm.issues.map(err => {
            if (err.message === message.message &&
              err.organisation === message.organisation &&
              err.serviceId === message.serviceId &&
              err.topic === message.topic &&
              err.time === message.time) {
              err.show = !err.show;
              err.isWatched = true;
            }
            return err;
          });
          Promise.all(newErrors).then(() => {
            this.algorithm.issues = newErrors;
            console.log('message was read');
            this.$forceUpdate();
          });
        }, (err) => {
          console.log(err);
        });*/
      }
    },
  },
};
</script>

<style scoped>
  .md-card {
    padding: 20px;
    flex-direction: row;
  }
  .md-card > div {
    width: 50%;
  }
  .mark-all-as-read {
    text-transform: uppercase;
    font-size: 12px;
    padding: 5px 20px;
    position: absolute;
    top: 12px;
    right: 0;
    cursor: pointer;
  }
  .mark-all-as-read i {
    font-size: 18px;
    margin-left: 6px;
  }
  .mark-all-as-read:hover {
    text-decoration: underline;
  }
  .mark-all-as-read:hover i {
    color: green;
  }
  .errors-wrapper {
    max-height: 200px;
    overflow: auto;
  }
  .details-block:first-of-type {
    padding-top: 10px;
  }
  .details-block>div:first-of-type {
    width: 32%;
    text-transform: lowercase;
  }
  .details-block a {
    font-size: 0.6rem;
  }
  .details-block.notification-item {
    padding: 5px 20px 5px 5px;
  }
  .details-block.notification-item:hover {
    cursor: pointer;
    background: #f3f3f3;
  }
  .details-block.notification-item>div {
    width: 100%;
    text-transform: none;
  }
  .details-block.notification-item .md-icon {
    font-size: 1.2rem;
  }
  .details-block.notification-item .topic {
    text-transform: uppercase;
    font-weight: 800;
  }
  .details-block.notification-item .time {
    padding: 0 20px;
    color: #4e4e4e;
  }
  .details-block.notification-item .algorithm-name {
    font-weight: 800;
    display: inline-block;
    font-size: 0.9rem;
    color: #4e4e4e;
  }
  .details-block.notification-item .algorithm-message {
    color: #7b7b7b;
    font-size: 0.75rem;
    padding-left: 20px;
    margin: 10px 0 20px;
  }
  .content .details-block a,
  .content .details-block a:hover {
    color: #4a90e2;
  }
  .details-block p {
    margin: 0;
  }
  .details-block .md-icon {
    color: #d0021b;
    font-size: 1rem;
    min-width: auto;
    min-height: auto;
    width: auto;
    height: auto;
  }
  .details-block.watched .md-icon {
    color: #aaa;
  }
  .details-block .md-icon.active {
    color: #7ed321;
  }
</style>
