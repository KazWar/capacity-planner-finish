<template>
  <div class="algorithms" style="height: calc(100vh - 160px);overflow-y: scroll; position: relative;">
    <!--<div class="sub-header container-fluid">
      <div class="title">Algorithms</div>
      <div class="tools">
        <md-icon :class="{'active': showSidebarCategories}"
                 style="margin-top: 9px;"
                 @click.native="showSidebarCategories = !showSidebarCategories">category
        </md-icon>
      </div>
    </div>-->
    <section style="position: relative">
      <div :class="[showSidebar?'sidebar-opened':'']">
        <div class="container-fluid" :class="[(viewType !== 'module')?'hidden':'']">
          <transition name="component-fade" mode="in-out">
            <div class="algorithms-container" v-if="showalgorithm">
              <div
                v-for="(algorithm, index) in filteredAlgorithms"
                :key="index"
              >
                <md-card md-with-hover :class="['site-card', algorithm.selected?'selected':'']">
                  <md-card-area md-inset>
                    <md-card-header>
                      <h2 class="md-title" @click.self="showDetailedAlgorithm(algorithm)">
                        <template v-if="algorithm.shortDescription">{{algorithm.shortDescription}}</template>
                        <template v-else>{{algorithm.name}}</template>
                        <i v-if="issuesCount(algorithm) > 0" class="material-icons">info</i>
                      </h2>
                    </md-card-header>
                  </md-card-area>
                  <div :key="index">
                    <md-card-content>
                      <div class="asset-details">
                        <div class="asset-title">calls in last month:</div>
                        <div>
                          {{algorithm.callsCount || 0}}
                        </div>
                      </div>
                      <div class="asset-details">
                        <div class="asset-title">resp. time</div>
                        <div>
                          {{parseInt(algorithm.averageResponseTime) || 0}}ms
                        </div>
                      </div>
                      <div class="asset-details">
                        <div class="asset-title">last call</div>
                        <div>
                          {{algorithm.lastCall | dateFormat}}
                        </div>
                      </div>
                      <div class="asset-details">
                        <div class="asset-title">errors</div>
                        <div>
                          {{issuesCount(algorithm)}}
                        </div>
                      </div>
                    </md-card-content>
                  </div>
                </md-card>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <transition
        name="slide-left"
        enter-active-class="slideAppear"
        leave-active-class="slideDisappear">
        <div class="portal-apps-sidebar" v-if="showSidebarCategories">
          <div class="categories-title">
            Categories
            <md-icon class="close-categories" @click.native="showSidebarCategories = false">close</md-icon>
          </div>
          <div class="category" v-for="(cat, index) in categories">
            <div class="md-checkbox md-theme-default" :class="{'md-checked': localSelectedCategories.includes(cat)}"
                 :value="cat">
              <div tabindex="0" class="md-checkbox-container">
                <input type="checkbox" tabindex="-1" :id="`${cat}-${index}`" :value="cat"
                       v-model="localSelectedCategories">
              </div>
              <label class="md-checkbox-label" :for="`${cat}-${index}`">{{cat}}</label>
            </div>
          </div>
        </div>
      </transition>
      <div class="detailedScreen" v-if="showDetailed">
        <algorithm-detail :algorithm-id="algorithmIdProp"
                          :url-baas="urlBaas"
                          :url-maas="urlMaas"
                          :get-algorithms-full-path="getAlgorithmsFullPath"
                          @closeDetailed="closeDetailedAlgorithm"></algorithm-detail>
      </div>
    </section>
  </div>
</template>
<script>
  import managedata from '../helpers/managedata';
  // import dataTable from '../../general/dataTable.vue';
  import algorithmDetail from './detail/AlgorithmDetail.vue';

  const moment = require('moment');

  export default {
    name: 'Algorithms',
    components: { algorithmDetail },
    data: () => ({
      algorithms: [],
      applications: [],
      algorithm: [],
      searchTerm: '',
      selectedItem: '',
      viewType: 'module',
      applicationsColumns: [],
      algorithmColumns: [],
      showAppications: true,
      showalgorithm: true,
      showNotifications: false,
      showSidebar: false,
      sideBarType: 'notifications',
      sideBarTitle: 'notification center',
      sideBarData: {},
      alarmMessages: [],
      unreadAlarmsCount: 0,
      alarmMessageSocketName: 'AlarmMessage/POST',
      algorithmocketName: 'algorithm/POST',
      callStatisticsSocketName: 'CallStatistics/POST',
      applicationSocketName: 'Application/POST',
      showDetailed: false,
      selectedApplication: null,
      showSidebarCategories: false,
      categories: [],
      localSelectedCategories: [],
      algorithmIdProp: null,
    }),
    props: {
      getAlgorithmsFullPath: { required: true, },
      urlBaas: { required: true, },
      urlMaas: { required: true, }
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        this.getAlgorithmsData();
      },
      issuesCount(algorithm) {
        if (!algorithm.issues) return 0;
        const filteredAlgs = algorithm.issues.filter(i => !i.isRead && !i.isWatched);
        return filteredAlgs.length;
      },
      getAlgorithmsData() {
        const from = moment().subtract(1, 'months').utc().format('YYYY-MM-DD HH:mm');
        const to = moment().utc().format('YYYY-MM-DD HH:mm');
        managedata.getAlgorithmsNS(this.urlMaas, from, to, false, (result) => {
          this.algorithms = result.body
            .filter(alg => !alg.ignore).sort((a, b) => {
              if (a.shortDescription > b.shortDescription) {
                return 1;
              } else if (a.shortDescription < b.shortDescription) {
                return -1;
              }
              return 0;
            });
          this.algorithms.forEach((alg) => {
            if (!alg.category) {
              alg.category = 'No category';
            }
            if (!this.localSelectedCategories.includes(alg.category)) {
              this.categories.push(alg.category);
              this.localSelectedCategories.push(alg.category);
              this.categories.sort((a, b) => {
                if (a === 'No category') return 1;
                if (b === 'No category') return -1;
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
              });
            }
          });
        }, err => {
          console.log(err);
        });
      },
      showDetailedAlgorithm(algorithm) {
        this.showDetailed = true;
        this.algorithmIdProp = algorithm.id;
      },
      closeDetailedAlgorithm() {
        this.showDetailed = false;
        this.algorithmIdProp = null;
      },
    },
    computed: {
      filteredAlgorithms() {
        return this.algorithms.filter(alg => this.localSelectedCategories.includes(alg.category));
      },
    },
  };
</script>

<style>
  .algorithms .md-tabs nav {
    display: none !important;
  }
</style>

<style scoped>
  .detailedScreen {
    position: absolute !important;
    z-index: 999;
    background-color: #f7f7f9;
    min-height: 100%;
  }

  .tabs-with-hidden-header nav {
    display: none !important;
  }

  .algorithmsTableData .md-table-body,
  .applicationTableData .md-table-body {
    height: auto;
    max-height: 500px;
  }

  .algorithms .sidebar > .header {
    background: #0098FF !important;
    z-index: 1 !important;
  }

  .algorithms .md-title .md-theme-default.md-switch.md-checked.md-primary .md-switch-thumb {
    background-color: rgba(180, 130, 52, 1);
  }

  .algorithms .md-theme-default.md-switch.md-checked.md-primary .md-ink-ripple {
    display: none;
  }

  .algorithms .md-title .md-theme-default.md-switch.md-checked.md-primary .md-switch-container {
    background-color: rgba(180, 130, 52, 0.5);
  }

  .algorithms .md-title .md-switch {
    position: absolute;
    left: 10px;
    top: 6px;
  }

  .algorithms .algorithmTableData .md-table-body,
  .algorithms .applicationTableData .md-table-body {
    height: auto;
    max-height: 500px;
  }

  div.md-card div.md-card-header > h2.md-title i {
    position: absolute;
    right: 16px;
  }

  .toggler {
    width: 100%;
    cursor: pointer;
    position: relative;
    text-align: center;
    margin: 35px 0 10px;
    height: 30px;
    line-height: 30px;
  }

  .toggler div {
    display: inline-block;
    background: #f7f7f9;
    z-index: 2;
    position: absolute;
    color: #6f6f6f;
    padding: 0 6px;
    text-align: center;
    width: 160px;
    left: calc(50% - 80px);
  }

  .toggler div i {
    float: right;
    line-height: 30px;
  }

  .toggler:after {
    content: '';
    width: 100%;
    position: absolute;
    height: 1px;
    background: #d4d4d4;
    left: 0;
    top: 50%;
    z-index: 0;
  }

  .sub-header {
    position: fixed;
    width: 100%;
    z-index: 7;
    top: 0;
    background: #fff;
    height: 60px;
    border-bottom: 1px solid #d4d4d4;
    color: #606060;
  }

  .sub-header .title {
    line-height: 60px;
    height: 60px;
    display: inline-block;
    margin: 0 15px;
    color: #6f6f6f;
    font-size: 1.1em;
  }

  .sub-header .tools {
    display: inline-block;
    height: 100%;
    float: right;
  }

  .sub-header .tools i {
    display: inline-block;
  }

  .sub-header .tools > i {
    height: 40px;
    width: 40px;
    line-height: 40px;
    text-align: center;
    color: #4a90e2;
    cursor: pointer;
  }

  .sub-header .tools > i.notification-icon {
    color: #0098FF;
    position: relative;
  }

  .sub-header .tools > i.active {
    background: #4a90e2;
    color: #fff;
  }

  .sub-header .tools > i.notification-icon.active {
    background: #0098FF;
  }

  .sub-header .tools > i.notification-icon > i {
    position: absolute;
    right: -1px;
    top: -2px;
    background: #4a90e2;
    color: #fff;
    font-size: .65rem;
    border-radius: 4px;
    font-style: normal;
    font-family: 'WidgetBrain';
    width: auto;
    height: auto;
    line-height: normal;
    padding: 3px;
  }

  .sub-header .search-container {
    width: 200px;
    margin-right: 20px;
    display: inline-block;
    height: 100%;
  }

  .sub-header .tools .search-container i {
    position: absolute;
    top: 14px;
  }

  .sub-header .search-container .md-input-container {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  .sub-header .search-container .md-input-container input {
    height: 53px;
    margin: 0;
    padding-left: 36px;
    padding-top: 16px;
  }

  .sub-header .search-container .md-input-container:after {
    height: 2px;
    background-color: rgba(0, 0, 0, .4);
  }

  .sub-header .search-container .md-input-container.md-input-focused:after {
    background-color: #0098FF;
  }

  .asset-details {
    padding-top: 10px;
    display: flex;
  }

  .asset-details p {
    margin: 0;
  }

  .site-card {
    cursor: pointer;
  }

  .site-card.selected,
  .site-card.selected:hover {
    z-index: 5;
  }

  .site-card,
  .md-card .md-subhead {
    margin-bottom: 20px;
  }

  div.md-card div.md-card-header:first-child > h2.md-title:first-child,
  div.md-card div.md-card-header > h2.md-title {
    font-size: .8rem;
    word-wrap: break-word;
    line-height: 1.8;
    margin: 0;
  }

  .md-card .md-subhead {
    opacity: 0.9;
  }

  .md-card .md-card-area {
    background: #4a90e2;
    color: #fff;
  }

  .md-card .md-card-content {
    padding: 10px 0;
  }

  .md-card .md-card-content .md-subheading {
    padding: 0 16px 10px;
    border-bottom: 1px solid #e5e5e5;
  }

  .md-card .md-card-content .md-subheading button.md-button {
    margin: 0;
    background-color: #4a90e2;
    color: #fff;
  }

  .md-card .md-card-content .md-subheading button.md-button:hover {
    background-color: #0098FF;
  }

  .md-card .md-card-content .md-subheading .md-icon {
    float: right;
    color: #4a90e2;
    cursor: pointer;
    margin-top: 4px;
    transition: all .2s;
  }

  .md-card .md-card-content .md-subheading .md-icon:hover {
    color: #0098FF;
  }

  .md-card .md-card-content .asset-details {
    padding: 0 32px;
    color: #7b7b7b;
    font-size: 0.7rem;
  }

  .md-card .md-card-content .asset-details > div:first-of-type {
    width: 40%;
  }

  .md-card .md-card-content .asset-details:first-of-type {
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .md-card .md-card-content .asset-details .md-icon {
    color: #d0021b;
  }

  .md-card .md-card-content .asset-details .md-icon.active {
    color: #7ed321;
  }

  .md-card .md-card-content .asset-details .asset-title {
    text-transform: lowercase;
    font-size: 0.7rem;
    display: inline-block;
    width: 50%;
  }

  .container-fluid.hidden {
    visibility: hidden;
    max-width: 0px;
    max-height: 0px;
    overflow: hidden;
  }

  .map-container {
    width: 800px;
    height: 500px;
  }

  .md-card .md-card-header:last-child {
    margin: 0;
  }

  .applications-container,
  .algorithms-container {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }

  div.md-card div.md-card-header:first-child > h2.md-title:first-child,
  div.md-card div.md-card-header > h2.md-title {
    font-size: .8rem;
    word-wrap: break-word;
    line-height: 1.8;
    margin: 0;
    padding-left: 36px;
    padding-right: 10px;
  }

  .applications-container > div,
  .algorithms-container > div {
    width: 340px;
    margin: 15px;
  }

  .applications-container > div > div,
  .algorithms-container > div > div {
    height: 100%;
  }

  .algorithms-container .md-card .md-card-area {
    background: #0098FF;
  }

  section {
    display: flex;
  }

  section > div {
    width: 100%;
    position: relative;
    padding-top: 60px;
  }

  section > div.sidebar-opened {
    /*overflow: hidden;
    max-height: calc(100vh - 75px);*/
    width: calc(100% - 400px);
  }

  .sidebar {
    z-index: 5;
    position: fixed;
    right: 0;
    top: 80px;
    width: 400px;
    height: calc(100vh - 75px);
    overflow: auto;
    border-left: 1px solid #d4d4d4;
    background: #fff;
  }

  .screen {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    background: rgba(74, 144, 226, 0.4);
    z-index: 4;
  }

  .slideAppear {
    animation: slideLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .slideDisappear {
    animation: slideRight 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  @keyframes slideLeft {
    0% {
      max-width: 0px;
      overflow: hidden;
    }
    100% {
      max-width: 100%;
      overflow: auto;
    }
  }

  @keyframes slideRight {
    0% {
      max-width: 100%;
      overflow: auto;
    }
    100% {
      max-width: 0px;
      overflow: hidden;
    }
  }

  .portal-apps-sidebar {
    width: 250px;
    min-height: calc(100vh - 140px);
    max-height: calc(100% - 140px);
    background-color: #fff;
    padding: 15px;
    margin-top: 60px;
  }

  .portal-apps-sidebar .md-checkbox {
    margin: 8px 8px 8px 0;
  }

  .portal-apps-sidebar .md-checkbox-container input {
    cursor: pointer;
  }

  .close-categories {
    position: absolute;
    right: 9px;
    top: -4px;
    cursor: pointer;
  }

  .categories-title {
    text-transform: uppercase;
    color: #9a9a9a;
    font-size: 15px;
    margin-top: 20px;
    position: relative;
  }

  .md-checkbox .md-checkbox-container input {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    margin: 0;
    opacity: 0;
    z-index: 999;
  }

  .md-checkbox .md-checkbox-label {
    height: auto;
    padding-left: 8px;
    line-height: 20px;
    font-size: 15px;
  }

  .md-theme-default.md-checkbox.md-checked .md-checkbox-container {
    background-color: #2196f3;
    border-color: #2196f3;
  }

  ::-webkit-scrollbar {
    width: 7px;
  }

  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.3);
    border-radius: 1px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 1px;
    /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);*/
    background:#4a90e2;

  }

</style>
