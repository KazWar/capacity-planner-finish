<template>
  <div class="algorithms">
    <div class="sub-header container-fluid">
      <div class="title">
        <div class="back-btn" @click="$emit('closeDetailed')">
          <i class="material-icons">keyboard_backspace</i>
        </div>
        Algorithm details
      </div>
      <div class="custom-tabs">
        <div @click="toggleCustomeTab(0)" :class="[(currentTab === 0)?'active':'']">Details</div>
        <div @click="toggleCustomeTab(1)" :class="[(currentTab === 1)?'active':'']">Documentation</div>
        <div @click="toggleCustomeTab(2)" :class="[(currentTab === 2)?'active':'']">Historical runs</div>
      </div>
    </div>
    <md-tabs class="tabs-with-hidden-header">
      <md-tab id="details" md-label="details">
        <details-algorithm-sub-tab v-if="algorithms.length > 0" v-for="algorithmItem in algorithms" :key="algorithmItem.id" :algorithm="algorithmItem" :currentTab="currentTab">
        </details-algorithm-sub-tab>
      </md-tab>
      <md-tab id="documentation" md-label="documentation">
        <documentation-sub-tab :algorithm="algorithm" :currentTab="currentTab">
        </documentation-sub-tab>
      </md-tab>
      <md-tab id="historical-runs" md-label="historical runs">
        <historical-sub-tab :algorithm="algorithm"
                            :algorithmsFromDetails="algorithms"
                            :currentTab="currentTab"
                            :url-baas="urlBaas"
                            :url-maas="urlMaas"
                            :get-algorithms-full-path="getAlgorithmsFullPath">
        </historical-sub-tab>
      </md-tab>
    </md-tabs>
  </div>
</template>

<script>
  import managedata from '../../helpers/managedata';
  import detailsAlgorithmSubTab from './tabs/DetailsAlgorithmSubTab.vue';
  import documentationSubTab from './tabs/DocumentationSubTab.vue';
  import historicalSubTab from './tabs/HistoricalSubTab.vue';

  const moment = require('moment');

  export default {
    name: 'AlgorithmDetails',
    data: () => ({
      currentTab: 0,
      algorithm: null,
      algorithms: [],
      from: null,
      to: null,
    }),
    components: {
      detailsAlgorithmSubTab,
      historicalSubTab,
      documentationSubTab,
    },
    props: {
      algorithmId: { required: true, },
      getAlgorithmsFullPath: { required: true, },
      urlBaas: { required: true, },
      urlMaas: { required: true, }
    },
    mounted() {
      this.from = moment().subtract(1, 'months').utc().format('YYYY-MM-DD HH:mm');
      this.to = moment().utc().format('YYYY-MM-DD HH:mm');
      this.getAlgorithmsData(this.algorithmId);
    },
    methods: {
      getAlgorithms() {
        const options = [
          { key: 'algorithmGroupKey', value: this.algorithm.algorithmGroupKey },
          { key: 'from', value: this.from },
          { key: 'to', value: this.to },
        ];
        managedata.getAlgorithmGroupDetailsNS(this.urlMaas, options, (response) => {
          this.algorithms = response.body;
        });
      },
      getAlgorithmsData(id) {
        managedata.getAlgorithmsOverviewByIdNS(this.urlMaas, this.from, this.to, false, id, (result) => {
          let algorithms = result.body;
          algorithms.filter(alg => !alg.ignore && alg.id == id).map((algorithm) => {
            managedata.getAlgorithmDetailsNS(this.urlMaas, algorithm.id, this.from, this.to, (res) => {
              algorithm = Object.assign(algorithm, res.body);
              this.algorithm = algorithm;
              this.getAlgorithms();
            }, (err) => {
               console.log(err);
            });
          });
        }, (err) => {
          console.log(err);
        });
      },
      toggleCustomeTab(tab) {
        const tabs = this.$el.querySelectorAll('.tabs-with-hidden-header .md-tabs-navigation-scroll-container .md-tab-header');
        if (tabs && tab !== null && tabs[tab]) {
          tabs[tab].click();
          this.currentTab = tab;
        }
      },
    },
    watch: {
    },
  };
</script>

<style scoped>
  .sub-header {
    position: absolute;
    width: 100%;
    z-index: 7;
    top: 0;
    background: #fff;
    height: 60px;
    border-bottom: 1px solid #d4d4d4;
    color: #606060;
    display: flex;
    justify-content: space-between;
  }

  .sub-header .title {
    line-height: 60px;
    height: 60px;
    display: flex;
    margin: 0 15px;
    color: #6f6f6f;
    font-size: 1.1em;
  }
  .sub-header .back-btn i {
    display: inline-block;
    width: 40px;
    line-height: 60px;
    height: 60px;
    color: #6f6f6f;
    font-size: 1.6em;
    cursor: pointer;
  }
  .sub-header .back-btn i:hover {
    color: #42b3ff;
  }
  .sub-header .custom-tabs {
    display: flex;
    height: 100%;
    justify-content: flex-end;
  }
  .sub-header.container-fluid:after {
    display: none;
  }
  .sub-header .custom-tabs > div {
    height: 100%;
    display: flex;
    padding: 0 20px;
    align-items: center;
    cursor: pointer;
    border-bottom: 4px solid transparent;
    transition: all .25s;
  }
  .sub-header .custom-tabs > div:hover,
  .sub-header .custom-tabs > div.active {
    border-color: #0b2152;
  }
</style>
