<template>
  <div :style="{backgroundColor: `#${bgColor}`}" class="algorithm-factory" style="height: calc(100vh - 160px);overflow-y: scroll;">
   <!-- <div :class="[transparentsubheader?'transparentsubheader':'', 'sub-header container-fluid']">
      <div class="title" v-if="!hidepagename">Algorithm Factory</div>
      <div class="tools noselect">
      </div>
    </div>-->
    <section>
      <div>
        <div class="container-fluid">
          <transition name="component-fade" mode="in-out">
            <div class="dashboard-container">
              <md-card class="chart-card" md-with-hover>
                <div class="chart-description-container">
                  <md-card-area md-inset>
                    <md-card-header>
                      <h2 class="md-title">Volume</h2>
                    </md-card-header>
                  </md-card-area>
                  <div class="chart-description">
                    <md-card-content>
                      <!-- <div class="donut-title"><b>1</b> APIs running</div> -->
                      <donut
                        class="assets-pie"
                        :colors="['#2298aa', '#007acc', '#f7e308', '#1646b6', '#af0456', '#29BBD2', '#0098FF', '#9e33cc', '#47175B', '#0A2052', '#CC0466', '#FF077F', '#6ad2e2', '#66c2ff', '#faec52', '#c585e0', '#4979e9', '#fb3796', '#aae5ee', '#b3e0ff', '#fcf49c', '#e2c2f0', '#a4bcf4', '#fd9bca']"
                        :showLegend="false"
                        :showTitle="false"
                        :percentages="pieData"
                        :donutStyle="'height:330px;width:100%'"
                        :labelSize="40"
                        :legend="pieLegend"
                        :totalCalls="totalCalls"
                        :showSubLabel="true"/>
                    </md-card-content>
                  </div>
                </div>
                <div class="chart-container">
                  <div class="header">
                    <div></div>
                    <div class="tools">
                      <md-button-toggle md-single>
                        <md-button @click.native="changeDuration('hours')">hour</md-button>
                        <md-button @click.native="changeDuration('days')">day</md-button>
                        <md-button class="md-toggle" @click.native="changeDuration('weeks')">week</md-button>
                        <md-button @click.native="changeDuration('months')">month</md-button>
                        <md-button @click.native="changeDuration('years')">year</md-button>
                      </md-button-toggle>
                      <div class="filter-container" v-if="filtersInsideCards">
                        <!--Filter by Algorithms
                        <multiselect
                          v-model="value"
                          :options="options"
                          :show-labels="false"
                          placeholder="Select Algorithms"
                          @input="sortChartBasedOnCategory()">
                        </multiselect>
                        Filter by API key
                        <multiselect
                          v-model="filterByApiKey"
                          :options="apiKeys"
                          :show-labels="false"
                          :label="'name'"
                          placeholder="Select Api Key"
                          @input="sortChartBasedOnApiKey()">
                        </multiselect>-->
                        <!--Filter by Environment
                        <multiselect
                          v-model="filterByEnvironment"
                          :options="environments"
                          :show-labels="false"
                          :label="'name'"
                          placeholder="Select Environment"
                          @input="sortChartBasedOnEnvironment()">
                        </multiselect>-->
                      </div>
                    </div>
                  </div>
                  <div class="chart-block">
                    <div class="no-data" v-if="chartOptions && chartOptions.series && chartOptions.series.length === 0">
                      There is no data for the selected parameters. Please use the filters and try again.
                    </div>
                    <IEcharts v-if="chartOptions && chartOptions.series && chartOptions.series.length > 0"
                              :option="chartOptions" style="height:100%" :resizable="true"/>
                  </div>
                </div>
              </md-card>
              <md-card class="chart-card" md-with-hover>
                <div class="chart-description-container">
                  <md-card-area md-inset>
                    <md-card-header>
                      <h2 class="md-title">Quality</h2>
                    </md-card-header>
                  </md-card-area>
                  <div class="chart-description">
                    <md-card-content>
                      <donut
                        class="assets-pie"
                        :colors="['#CC0466', '#F8E71C', '#29BBD2']"
                        :showTitle="false"
                        :subPropsLabel="'calls'"
                        :percentages="qualityPieData"
                        :donutStyle="'height:330px;width:100%'"
                        :showLegend="false"
                        :legend="['Failed', 'Slow', 'Successful']"
                        :labelSize="40"
                        :totalCalls="totalCalls"
                        :showSubLabel="true"/>
                    </md-card-content>
                  </div>
                </div>
                <div class="chart-container">
                  <div class="header">
                    <div></div>
                    <div class="tools">
                      <md-button-toggle md-single>
                        <md-button @click.native="changeDurationQuality('hours')">hour</md-button>
                        <md-button @click.native="changeDurationQuality('days')">day</md-button>
                        <md-button class="md-toggle" @click.native="changeDurationQuality('weeks')">week</md-button>
                        <md-button @click.native="changeDurationQuality('months')">month</md-button>
                        <md-button @click.native="changeDurationQuality('years')">year</md-button>
                      </md-button-toggle>
                      <div class="filter-container" v-if="filtersInsideCards">
                        <!--Filter by Algorithms
                        <multiselect
                          v-model="value"
                          :options="options"
                          :show-labels="false"
                          placeholder="Select Algorithms"
                          @input="sortChartBasedOnCategory()">
                        </multiselect>
                        Filter by API key
                        <multiselect
                          v-model="filterByApiKey"
                          :options="apiKeys"
                          :show-labels="false"
                          :label="'name'"
                          placeholder="Select Api Key"
                          @input="sortChartBasedOnApiKey()">
                        </multiselect>-->
                        <!--Filter by Environment
                        <multiselect
                          v-model="filterByEnvironment"
                          :options="environments"
                          :show-labels="false"
                          :label="'name'"
                          placeholder="Select Environment"
                          @input="sortChartBasedOnEnvironment()">
                        </multiselect>-->
                      </div>
                    </div>
                  </div>
                  <div class="chart-block">
                    <div class="no-data"
                         v-if="qualityChartOptions && qualityChartOptions.series && (qualityChartOptions.series.length === 0 || (qualityChartOptions.series[0] && qualityChartOptions.series[0].data && qualityChartOptions.series[0].data.length === 0))">
                      There is no data for the selected parameters. Please use the filters and try again.
                    </div>
                    <IEcharts
                      v-if="qualityChartOptions && qualityChartOptions.series && qualityChartOptions.series[0] && qualityChartOptions.series[0].data && qualityChartOptions.series[0].data.length > 0"
                      :option="qualityChartOptions" style="height:100%" :resizable="true"/>
                  </div>
                </div>
              </md-card>
            </div>
          </transition>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import managedata from '../helpers/managedata.js'
  import donut from '../general/donuts.vue'
  import IEcharts from 'vue-echarts-v3'
  import Multiselect from 'vue-multiselect'

  const moment = require('moment')
  const _ = require('underscore')

  export default {
    name: 'DashboardToImplement',
    components: {donut, IEcharts, Multiselect},
    data: function () {
      return {
        environments: [],
        alarmMessages: [],
        algIDs: [],
        apiKeys: [],
        apiNames: {},
        arrivalForecastOptions: {},
        bgColor: null,
        callsData: {},
        chartData: {},
        chartOptions: {},
        customersData: [],
        duration: 'weeks', // weeks, months, years
        filterByApiKey: {name: 'All', auth0ClientId: null},
        filtersInsideCards: true,
        hideNotificationIcon: false,
        hidepagename: false,
        ignoredAlgIds: [],
        interval: 0,
        options: [],
        organisationIds: null,
        organisationNames: {},
        pieData: [0, 0, 0],
        pieLegend: [],
        presentationMode: false,
        qualityChartOptions: {},
        qualityDuration: 'weeks', // weeks, months, years
        qualityPieData: [0, 0, 0],
        searchTerm: '',
        selectedIds: [],
        services: [],
        servicesColumns: [],
        servicesData: [],
        showNotifications: false,
        showScreen: false,
        showSidebar: false,
        sideBarData: {},
        sideBarTitle: 'notification center',
        sideBarType: 'notifications',
        tableColumns: [],
        tableData: [],
        totalCalls: 0,
        totalUptimeAvg: 0.00,
        transparentsubheader: false,
        unreadAlarmsCount: 0,
        uptimeData: [],
        value: 'All',
        filterByEnvironment: {name: 'All', identifier: null},
      };
    },
    props: {
      getAlgorithmsFullPath: { required: true, },
      urlBaas: { required: true, },
      urlMaas: { required: true, }
    },
    created() {
      this.init();
    },
    mounted() {
      this.chartOptions = {
        title: {
          // text: 'chart test'
        },
        color: ['#2298aa', '#007acc', '#f7e308', '#1646b6', '#af0456', '#29BBD2', '#0098FF', '#9e33cc', '#47175B', '#0A2052', '#CC0466', '#FF077F', '#6ad2e2', '#66c2ff', '#faec52', '#c585e0', '#4979e9', '#fb3796', '#aae5ee', '#b3e0ff', '#fcf49c', '#e2c2f0', '#a4bcf4', '#fd9bca'],
        animation: true,
        dataZoom: [{
          show: false,
          type: 'inside',
          start: 0,
          end: 168,
          zoomOnMouseWheel: 'ctrl',
        }, {
          show: false,
          start: 0,
          end: 168,
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }],
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            var output = "<table><th>" + moment(String(params[0].data[0])).format('YYYY-MM-DD HH:mm') + "</th>";
            for (var i = 0; i < params.length; i++) {
              if (params[i].data[1] > 0) {
                output += "<tr><td>" + params[i].seriesName + "</td><td>" + params[i].data[1] + "</td></tr>";
              }
            }
            output += "</table>"
            return output;
          },
          axisPointer: {
            animation: false
          }
        },
        legend: {
          orient: 'vertical', // 'vertical'
          x: '20', // 'center' | 'left' | {number},
          y: '140', //'top' | 'center' | 'bottom' | {number}
          // backgroundColor: '#fff',
          borderColor: '',
          borderWidth: 0,
          padding: 5,    // [5, 10, 15, 20]
          itemGap: 5,
          textStyle: {color: 'black', fontSize: 10},
          data: [{name: 'Total number of calls', icon: 'roundRect'}]
        },
        xAxis: {
          type: 'time',
          interval: 3600 * 24 * 1000,
          min: 'dataMin',
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          splitLine: {
            show: true
          },
          axisLabel: {
            rotate: 0,
            fontSize: 10,
          },
        },
        yAxis: {
          type: 'value',
          min: 'dataMin',
          position: 'right',
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          splitLine: {
            show: true,
          },
        },
        grid: {
          show: false,
          top: (this.filtersInsideCards) ? 120 : 80,
          right: 60,
          bottom: 60,
          left: 190,
        },
        series: [{
          name: 'Total number of calls',
          showSymbol: false,
          smooth: true,
          type: 'bar',
          barCategoryGap: '5%',
          barWidth: 10,
          barGap: '50%',
          data: [],
        }],
      };
      this.qualityChartOptions = {
        title: {
          // text: 'chart test'
        },
        dataZoom: [{
          show: false,
          type: 'inside',
          start: 0,
          end: 168,
          zoomOnMouseWheel: 'ctrl',
        }, {
          show: false,
          start: 0,
          end: 168,
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }],
        color: ['#CC0466', '#F8E71C', '#29BBD2'],
        animation: true,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            var output = "<table><th>" + moment(String(params[0].data[0])).format('MM/DD HH:mm') + ' - ' +
              moment(String(params[0].data[0])).add(6, 'hours').format('MM/DD HH:mm') + "</th>";
            for (var i = 0; i < params.length; i++) {
              if (params[i].data[1] > 0) {
                output += "<tr><td>" + params[i].seriesName + "</td><td>" + params[i].data[1] + "</td></tr>";
              }
            }
            output += "</table>"
            return output;
          },
          axisPointer: {
            animation: false
          }
        },
        legend: {
          orient: 'vertical', // 'vertical'
          x: '20', // 'center' | 'left' | {number},
          y: 'center', //'top' | 'center' | 'bottom' | {number}
          backgroundColor: '#fff',
          borderColor: '',
          borderWidth: 0,
          padding: 5,    // [5, 10, 15, 20]
          itemGap: 5,
          textStyle: {color: 'black', fontSize: 10},
          data: [{name: 'Successful', icon: 'roundRect'}, {name: 'Failed', icon: 'roundRect'}, {
            name: 'Slow',
            icon: 'roundRect'
          }],
          type: 'scroll',
          top: 15,
        },
        xAxis: {
          type: 'time',
          interval: 3600 * 24 * 1000,
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          splitLine: {
            show: true
          },
          axisLabel: {
            rotate: 0,
            fontSize: 10,
          }
        },
        yAxis: {
          type: 'value',
          min: 'dataMin',
          position: 'right',
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          splitLine: {
            show: true,
          },
        },
        grid: {
          show: false,
          top: (this.filtersInsideCards) ? 120 : 80,
          right: 60,
          bottom: 60,
          left: 250,
        },
        series: [{
          name: 'Time',
          type: 'bar',
          barWidth: 10,
          barGap: '50%',
          barCategoryGap: '5%',

          data: []
        }
        ]
      };

      this.arrivalForecastOptions = {
        visualMap: [{
          show: false,
          type: 'continuous',
          seriesIndex: 0,
          min: 40,
          max: 100
        }],
        xAxis: {
          type: 'category',
          data: ['03-04-2017', '04-05-2017', '05-06-2017', '06-07-2017', '08-08-2017', '09-09-2017', '06-08-2017', '08-08-2017', '09-09-2017', '09-09-2017', '04-05-2017', '05-06-2017', '10-10-2017', '08-08-2017', '09-09-2017', '12-11-2017', '11-11-2017', '12-12-2017', '01-13-2018', '02-14-2018', '03-15-2018', '04-16-2018', '05-17-2018', '06-18-2018', '05-13-2018', '02-14-2018', '03-15-2018', '06-16-2018', '06-17-2018', '06-18-2018']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [95, 90, 100, 80, 85, 70, 68, 70, 68, 100, 95, 90, 95, 94, 94, 95, 90, 100, 80, 85, 70, 68, 70, 40, 100, 95, 90, 95, 94, 94, 95, 90, 100, 80, 85, 70, 68, 70, 40, 100, 95, 90, 95, 94, 94],
          type: 'line',
          smooth: true
        }]
      };
      this.tableColumns = [
        {name: 'id', displayName: 'id', visible: false, type: 'string', isEditable: false},
        {name: 'organisation', displayName: 'Organization', visible: true, type: 'string', isEditable: false},
        {name: 'customer', displayName: 'Customer', visible: true, type: 'string', isEditable: false},
        {name: 'algorithm', displayName: 'Algorithm', visible: true, type: 'string', isEditable: false},
        {name: 'time', displayName: 'Time Bucket', visible: true, type: 'string', isEditable: false},
        {name: 'callsCount', displayName: 'Runs', visible: true, type: 'string', isEditable: false},
        {name: 'usersCount', displayName: 'Employees', visible: true, type: 'string', isEditable: false},
      ];
    },
    methods: {
      init() {
        this.getAlgorithms().then(() => {
          this.getlinechartData(this.getPieData);
          this.getPieDataQuality(this.getlinechartDataQuality);
        }).catch(() => {});

        // managedata.getAlgorithmEnvironments((response) => {
        //      this.environments = response.body;
        //      this.environments.unshift({name: 'All', identifier: null});
        //      console.log('env', response.body)
        //   }, (err) => {
        //     this.openSnackbarError(err);
        //   });
      },
      getPieData() {
        this.pieLegend = [];
        this.totalCalls = 0;
        this.pieData = [0, 0, 0];
        this.totalCalls = 0;
        this.$nextTick(() => {
          this.chartOptions.series.forEach((alg, i) => {
            this.pieLegend.push(alg.name);
            alg.data.forEach((value) => {
              if (!this.pieData[i]) {
                this.pieData.push(0);
              }
              this.pieData[i] += value[1];
              this.totalCalls += value[1];
            });
          });
        });
      },
      // sortChartBasedOnApiKey: function () {
      //   this.getlinechartData(this.getPieData);
      //   this.getPieDataQuality(this.getlinechartDataQuality);
      // },
      // sortChartBasedOnEnvironment: function () {
      //   // if (this.filterByEnvironment === 'All') {
      //   //   this.selectedIds = null;
      //   // } else {
      //   //   console.log('this.wbAlgorithmUsers[0].algorithms', this.wbAlgorithmUsers[0].algorithms)
      //   //   this.selectedIds = this.wbAlgorithmUsers[0].algorithms.filter(item => item.environment === this.filterByEnvironment.name)
      //   //     .map(item => item.id);
      //   // }
      //   this.getlinechartData(this.getPieData);
      //   this.getPieDataQuality(this.getlinechartDataQuality);
      // },
      // sortChartBasedOnCategory: function (cb) {
      //   if (this.value === 'All') {
      //     // this.selectedIds = this.wbAlgorithmUsers[0].algorithms.map(item => item.algorithmId);
      //     this.selectedIds = null;
      //   } else {
      //     console.log('this.wbAlgorithmUsers[0].algorithms', this.wbAlgorithmUsers[0].algorithms)
      //     this.selectedIds = this.wbAlgorithmUsers[0].algorithms.filter(item => item.Category === this.value)
      //       .map(item => item.algorithmGroupKey);
      //   }
      //   this.getlinechartData(this.getPieData);
      //   this.getPieDataQuality(this.getlinechartDataQuality);
      // },
      addChartItem: (name, stack) => ({
        showSymbol: false,
        type: 'bar',
        barCategoryGap: '5%',
        barGap: '50%',
        stack,
        data: [],
        name,
        seriesLayoutBy: 'row',
      }),
      getAlgorithms() {
        return new Promise((resolve, reject) => {
          managedata.allowedOrganizationsAndAlgorithmUsersNS(this.getAlgorithmsFullPath, (res) => {
            this.wbAlgorithmUsers = res.body.wbAlgorithmUsers;
            this.apiKeys = JSON.parse(JSON.stringify(res.body.wbAlgorithmUsers));
            this.apiKeys.unshift({ name: 'All', auth0ClientId: null });

            this.options = this.wbAlgorithmUsers[0].algorithms.map(item => item.Category)
              .filter((value, index, self) => self.indexOf(value) === index && value && value.length > 0);
            this.options = this.options.sort();
            this.options.unshift('All');
            resolve(res.body.wbAlgorithmUsers);
          }, (err) => {
            reject(err);
          });
        });
      },
      getlinechartData(cb) {
        this.chartOptions.series.forEach(function (serie) {
          if (serie && serie.data)
            serie.data = [];
        });
        this.chartOptions.legend.data = [];
        let timeZoneOffset = (new Date().getTimezoneOffset() / 60);
        const from = moment().subtract(1, this.duration).startOf('day').add(timeZoneOffset, 'hours').format('YYYY-MM-DD HH:mm');
        const to = moment().add(timeZoneOffset, 'hours').format('YYYY-MM-DD HH:mm');

        this.apiNames = {};
        this.organisationNames = {};
        let algsToSee = [];
        let organisationsToSee = [];
        this.organisationIds = this.wbAlgorithmUsers.map(i => {
          this.organisationNames[i.auth0ClientId] = i.name;
          let algIds = [];
          if (i.algorithms) {
            algIds = i.algorithms.map(alg => alg.algorithmId);
          }
          if (!this.selectedIds) {
            algsToSee = algsToSee.concat(algIds);
            organisationsToSee = [];
          } else {
            algsToSee = this.selectedIds;
            algsToSee.forEach(algKey => {
              this.wbAlgorithmUsers.forEach(algUser => {
                if (algUser.algorithms) {
                  algUser.algorithms.forEach(alg => {
                    if (this.selectedIds.indexOf(alg.algorithmId) !== -1) {
                      if (organisationsToSee.indexOf(algUser.auth0ClientId) === -1)
                        organisationsToSee.push(algUser.auth0ClientId);
                    }
                  });
                }
              });
            });
          }
          return i.auth0ClientId;
        });

        if (this.organisationIds.length === 1) {
          this.organisationIds.push('');
        }

        let options = {
          organisation: this.organisationIds,
          from,
          to,
          datapoints: 24,
          select: {aggregator: 'count', property: 'quantity'},
          group: 'algorithmGroupKey',
        };

        if (this.selectedIds && this.selectedIds.length > 0) {
          options.where = {algorithmGroupKey: {inq: this.selectedIds}};
        }

        if (this.filterByEnvironment.name != 'All') {
          options.where = {environment: this.filterByEnvironment.name};
        }

        if (this.filterByApiKey && this.filterByApiKey.auth0ClientId) {
          options.organisation = [this.filterByApiKey.auth0ClientId];
        }

        if (this.duration === 'weeks') {
          options.datapoints = 24;
        } else if (this.duration === 'months') {
          options.datapoints = 30;
        } else if (this.duration === 'years') {
          options.datapoints = 50;
        }
        managedata.getAutoAggregatedDateFilteredLogs(this.urlBaas, options, (response) => {
          let res = {};
          let editedResponse = response.body;
          Object.keys(editedResponse).forEach(i => {
            if (editedResponse[i].length > 0) {
              res[i] = editedResponse[i];
            }
          });
          this.algIDs = Object.keys(res);
          this.fillLineChartData(res, cb);
        }, (err) => {
          console.log(err);
        });
      },
      fillLineChartData(data, cb) {
        this.chartOptions.series.forEach(i => i.data = []);
        this.chartOptions.series = [];
        this.chartOptions.legend.data = [];
        let tempData = JSON.parse(JSON.stringify(this.chartOptions));
        if (this.duration === 'hours') {
          tempData.xAxis.interval = 3600 * 2 * 1000;
        } else if (this.duration === 'days') {
          tempData.xAxis.interval = 3600 * 6 * 1000;
        } else if (this.duration === 'weeks') {
          tempData.xAxis.interval = 3600 * 24 * 1000;
        } else if (this.duration === 'months') {
          tempData.xAxis.interval = 7 * 3600 * 24 * 1000;
        } else if (this.duration === 'years') {
          tempData.xAxis.interval = 3600 * 24 * 31 * 1000;
        }
        tempData.tooltip.formatter = function (params) {
          let curDate = moment(params[0].axisValue).format('DD-MM-YYYY HH:mm')
          let output = `<div>${curDate}</div>`;
          for (var i = 0; i < params.length; i++) {
            if (params[i].data[1] > 0) {
              output += `<div style="display:inline-block;background:${params[i].color};width:10px;height:10px;border-radius:50%"></div>`;
              output += ` ${params[i].seriesName}:  ${params[i].data[1]} </br>`;
            }
          }
          return output;
        };
        if (!Array.isArray(data)) {
          managedata.getGroupNamesForKeys(this.urlBaas, JSON.stringify(this.algIDs), (result) => {
            this.apiNames = result.body;
            this.algIDs.forEach((key) => {
              tempData.legend.data.push({name: this.apiNames[key], icon: 'roundRect', key: key});
            });
            tempData.legend.data.sort(function (a, b) {
              if (a.name < b.name) return -1;
              if (a.name > b.name) return 1;
              return 0;
            });
            tempData.legend.data.forEach((legend, index) => {
              tempData.series[index] = this.addChartItem(this.apiNames[legend.key], 'group');
              if (data[legend.key]) {
                data[legend.key].forEach((item, i) => {
                  if (!tempData.series[index].data[i]) {
                    tempData.series[index].data.push([item.time, item.count_quantity]);
                  } else {
                    tempData.series[index].data[i][1] += item.count;
                  }
                });
              }
            });
            tempData.legend.type = 'scroll';
            tempData.legend.top = 70;
            if (this.filtersInsideCards)
              tempData.legend.top = 120;
            tempData.grid.left = 250;
            this.chartOptions = tempData;
            this.getPieData();
            this.$forceUpdate();
          });
          if (cb) cb();
        }
      },
      changeDuration(durationType) {
        this.duration = durationType;
        this.getlinechartData(this.getPieData);
      },
      // Quality Chart's functions
      changeDurationQuality(durationType) {
        this.qualityDuration = durationType;
        this.getPieDataQuality(this.getlinechartDataQuality);
      },
      getPieDataQuality(cb) {
        let from = moment().subtract(1, this.qualityDuration).startOf('day').utc().format('YYYY-MM-DD HH:mm');
        let options = {};
        if (this.value === 'All') {

          options = {
            organisation: this.organisationIds,
            from,
            to: moment().utc().format('YYYY-MM-DD HH:mm'),
          };
          if (this.filterByApiKey && this.filterByApiKey.auth0ClientId) {
            options.organisation = [this.filterByApiKey.auth0ClientId];
          }

          this.ignoredAlgIds = [];

          managedata.getRunsStatus(this.urlBaas, options, (response) => {
            this.qualityPieData = [response.body.failed, response.body.slow, response.body.successful];
            // this.totalCalls = response.body.failed + response.body.slow + response.body.successful;
            if (cb) cb();
          }, (err) => {
            console.log(err);
          });
        }
        if ((this.filterByEnvironment.name !== 'All') || (this.value !== 'All')) {
          let ignoredAlgKeys = [];

          if (this.value !== 'All') {
            this.wbAlgorithmUsers[0].algorithms.forEach((algorithm) => {
              if (algorithm.Category !== this.value) {
                ignoredAlgKeys.push(algorithm.algorithmId);
              }
            });
          }

          if (this.filterByEnvironment.name !== 'All') {
            this.wbAlgorithmUsers[0].algorithms.forEach(algorithm => {
              if (algorithm.environment !== this.filterByEnvironment.name) {
                ignoredAlgKeys.push(algorithm.algorithmId);
              }
            });
          }

          const filter = { where: { algorithmKey: { inq: ignoredAlgKeys } } };

          managedata.getAlgorithmsByKeys(this.urlBaas, filter, (res) => {
              this.ignoredAlgIds = res.body.map(i => `${i.id}`);
              options = {
                organisation: this.organisationIds,
                from: from,
                to: moment().utc().format('YYYY-MM-DD HH:mm'),
                ignore: ignoredAlgKeys
              };
              if (this.filterByApiKey && this.filterByApiKey.auth0ClientId) {
                options.organisation = [this.filterByApiKey.auth0ClientId];
              }
              managedata.getRunsStatus(this.urlBaas, options, (response) => {

                this.qualityPieData = [response.body.failed, response.body.slow, response.body.successful];
                // self.totalCalls = response.body.failed + response.body.slow + response.body.successful;
                if (cb) cb();
              }, (err) => {
                console.log(err);
              });
            }
            , err => {
              console.log('Error:', err);
            })
        }
      },
      getlinechartDataQuality: function () {
        let timeZoneOffset = (new Date().getTimezoneOffset() / 60);
        const from = moment().subtract(1, this.qualityDuration).startOf('day').add(timeZoneOffset, 'hours').format('YYYY-MM-DD HH:mm');
        const to = moment().add(timeZoneOffset, 'hours').format('YYYY-MM-DD HH:mm');

        if (this.qualityChartOptions.xAxis && this.qualityDuration === 'hours') {
          this.qualityChartOptions.xAxis.interval = 3600 * 2 * 1000;
        } else if (this.qualityChartOptions.xAxis && this.qualityDuration === 'days') {
          this.qualityChartOptions.xAxis.interval = 3600 * 6 * 1000;
        } else if (this.qualityChartOptions.xAxis && this.qualityDuration === 'weeks') {
          this.qualityChartOptions.xAxis.interval = 3600 * 24 * 1000;
        } else if (this.qualityChartOptions.xAxis && this.qualityDuration === 'months') {
          this.qualityChartOptions.xAxis.interval = 3600 * 24 * 7 * 1000;
        } else if (this.qualityChartOptions.xAxis && this.qualityDuration === 'years') {
          this.qualityChartOptions.xAxis.interval = 3600 * 24 * 31 * 1000;
        }

        let options = {};

        if (this.value === 'All') {
          options = {
            organisation: this.organisationIds,
            from: from,
            to: to,
            datapoints: 100,
          };
        } else {
          options = {
            organisation: this.organisationIds,
            from: from,
            to: to,
            datapoints: 100,
            ignore: this.ignoredAlgIds,
          };
        }
        if (this.qualityDuration === 'weeks') {
          options.datapoints = 24;
        } else if (this.qualityDuration === 'months') {
          options.datapoints = 30;
        } else if (this.qualityDuration === 'years') {
          options.datapoints = 50;
        }
        if (this.qualityDuration === 'weeks') {
          this.qualityChartOptions.datapoints = 24;
        } else if (this.qualityDuration === 'months') {
          this.qualityChartOptions.datapoints = 30;
        } else if (this.qualityDuration === 'years') {
          this.qualityChartOptions.datapoints = 50;
        }
        if (this.filterByApiKey && this.filterByApiKey.auth0ClientId) {
          options.organisation = [this.filterByApiKey.auth0ClientId];
        }

        if (this.filterByEnvironment !== 'All') {
          options.ignore = this.ignoredAlgIds;
        }


        managedata.getRunsStatusOverTime(this.urlBaas, options, (response) => {
          this.qualityChartOptions.series = [];

          if (!this.qualityChartOptions.series[0]) {
            this.qualityChartOptions.series[0] = {
              showSymbol: false,
              smooth: true,
              type: 'bar',
              barCategoryGap: '5%',
              barGap: '50%',
              stack: 1,
              data: [],
              name: "Failed",
            };
          }
          if (!this.qualityChartOptions.series[1]) {
            this.qualityChartOptions.series[1] = {
              showSymbol: false,
              smooth: true,
              type: 'bar',
              barCategoryGap: '5%',
              barGap: '50%',
              stack: 1,
              data: [],
              name: "Slow",
            };
          }
          if (!this.qualityChartOptions.series[2]) {
            this.qualityChartOptions.series[2] = {
              showSymbol: false,
              smooth: true,
              type: 'bar',
              barCategoryGap: '5%',
              barGap: '50%',
              stack: 1,
              data: [],
              name: "Successful",
            };
          }
          this.qualityChartOptions.legend.top = 70;
          if (this.filtersInsideCards)
            this.qualityChartOptions.legend.top = 120;

          let apisCount = Object.keys(response.data).length;
          response.data.forEach((item, i) => {
            // Failed
            if (!this.qualityChartOptions.series[0].data[i])
              this.qualityChartOptions.series[0].data.push([item.time, item.failed]);
            else
              this.qualityChartOptions.series[0].data[i][1] = this.qualityChartOptions.series[0].data[i][1] + item.failed;
            // Slow
            if (!this.qualityChartOptions.series[1].data[i])
              this.qualityChartOptions.series[1].data.push([item.time, item.slow]);
            else
              this.qualityChartOptions.series[1].data[i][1] = this.qualityChartOptions.series[1].data[i][1] + item.slow;

            // Successful
            if (!this.qualityChartOptions.series[2].data[i])
              this.qualityChartOptions.series[2].data.push([item.time, item.successful]);
            else
              this.qualityChartOptions.series[2].data[i][1] = this.qualityChartOptions.series[2].data[i][1] + item.successful;
          });
        }, (err) => {
          console.log(err);
        });
      },
    },
    watch: {},
  };
</script>

<style>
  .algorithm-factory .multiselect__single {
    font-size: 14px;
  }

  .algorithm-factory .multiselect__content-wrapper {
    top: 33px;
    font-size: 14px;
  }

  .algorithm-factory .multiselect__content {
    max-width: 100%;
  }

  .algorithm-factory .multiselect__content span {
    white-space: normal;
  }

  .algorithm-factory .multiselect__option {
    padding: 8px 12px;
    min-height: 20px;
  }

  .chart-switcher {
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
    font-size: 12px;
  }

  .chart-switcher > div {
    line-height: 20px;
    height: 20px;
    font-size: 12px !important;
    margin: 0 6px;
  }

  div.md-table div.md-table-head-text {
    position: relative;
    right: 0;
    transform: none;
  }

  div.md-card.md-table-card .md-toolbar {
    background-color: #ff9800;
  }
</style>
<style scoped>
  .chart-block {
    height: 395px;
  }

  .no-data {
    color: #aaa;
    text-transform: lowercase;
    font-size: 18px;
    padding: 0 120px;
    display: inline-block;
    width: 100%;
    height: 400px;
    margin-top: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #d7dde7;
    text-align: center;
    /*position: absolute;*/
  }

  .chart-container .header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
  }

  .chart-container .header .tools {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin: 15px;
    z-index: 999;
    width: 100%;
  }

  .chart-container .filter-container {
    display: flex;
    font-size: 12px;
    width: 840px;
  }

  .chart-container .filter-container .multiselect {
    max-width: 200px;
    margin-right: 10px;
  }

  .chart-container .header .title {
    padding: 20px 10px 10px 30px;
    text-transform: uppercase;
  }

  .chart-container .header .md-button-toggle:not(:last-of-type) {
    margin-right: 10px;
  }

  .chart-container .header .md-button-toggle .md-button {
    font-size: .8rem;
    height: 30px;
    text-transform: lowercase;
    border: 1px solid #e5e5e5;
    font-weight: 800;
  }

  .chart-container .header .md-button-toggle .md-button:not(:last-of-type) {
    border-right: 0;
  }

  .dashboard-container > div.chart-card .chart-description {
    position: relative;
  }

  .donut-title {
    position: absolute;
    top: 30px;
    font-size: 18px;
    width: 100%;
    text-align: center;
  }

  .md-switch {
    text-transform: uppercase;
    font-size: .8rem;
  }

  .sub-header {
    position: fixed;
    width: 100%;
    z-index: 7;
    top: 0;
    background: #fff;
    height: 60px;
    margin: 0;
    border-bottom: 1px solid #d4d4d4;
    color: #606060;
  }

  .transparentsubheader {
    border-bottom: 0px solid #d4d4d4;
    background: transparent;
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
    color: #ff9800;
    position: relative;
  }

  .sub-header .tools > i.active {
    background: #4a90e2;
    color: #fff;
  }

  .sub-header .tools > i.notification-icon.active {
    background: #ff9800;
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
    width: 260px;
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
    background-color: #ff9800;
  }

  .asset-details {
    padding-top: 10px;
    display: flex;
  }

  .asset-details p {
    margin: 0;
  }

  .asset-details .pretitle-value {
    font-size: 1.2rem;
  }

  .site-card {
    cursor: pointer;
  }

  .site-card.selected,
  .site-card.selected:hover {
    z-index: 3;
  }

  .site-card,
  .md-card .md-subhead {
    margin-bottom: 20px;
  }

  div.md-card div.md-card-header:first-child > h2.md-title:first-child,
  div.md-card div.md-card-header > h2.md-title {
    font-size: 1.2rem;
    margin: 0;
  }

  .md-card .md-subhead {
    opacity: 0.9;
  }

  .md-card .md-card-area {
    background: #0098FF;
    color: #fff;
  }

  .md-card .md-card-content {
    min-height: 223px;
    padding: 10px 0;
    border-right: 1px solid #e5e5e5;
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
    background-color: #ff9800;
  }

  .md-card .md-card-content .md-subheading .md-icon {
    float: right;
    color: #4a90e2;
    cursor: pointer;
    margin-top: 4px;
    transition: all .2s;
  }

  .md-card .md-card-content .md-subheading .md-icon:hover {
    color: #ff9800;
  }

  .md-card .md-card-content .asset-details {
    padding: 4px 32px;
    color: #7b7b7b;
    font-size: 0.7rem;
  }

  .md-card .md-card-content .asset-details > div:first-of-type {
    width: 80px;
  }

  .md-card .md-card-content .asset-details:first-of-type {
    padding-top: 10px;
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
    width: calc(100% - 80px);
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

  .dashboard-container {
    display: flex;
    flex-wrap: wrap;
  }

  .dashboard-container > div {
    width: 100%;
    margin: 2%;
  }

  section {
    display: flex;
    min-height: calc(100vh - 150px);
  }

  section > div {
    width: 100%;
    position: relative;
  }

  .sidebar {
    z-index: 5;
    position: fixed;
    right: 0;
    top: 140px;
    width: 400px;
    height: calc(100vh - 140px);
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
    z-index: 2;
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

  .dashboard-container > div.chart-card,
  .dashboard-container > div.chart-card .md-card {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }

  .dashboard-container > div.chart-card .chart-description-container {
    width: 300px;
  }

  .dashboard-container > div.chart-card .chart-description .asset-details {
    flex-wrap: wrap;
  }

  .dashboard-container > div.chart-card .chart-description .pretitle-value,
  .dashboard-container > div.chart-card .chart-description .asset-title {
    width: 100%;
    text-align: center;
    text-transform: none;
  }

  .dashboard-container > div.chart-card .chart-description .pretitle-value {
    font-size: 1.8rem;
  }

  .dashboard-container > div.chart-card .asset-details {
    padding-top: 10px;
    padding-bottom: 10px;
    color: #666;
  }

  .dashboard-container > div.chart-card .chart-description .pretitle-value .md-icon {
    font-size: 1rem;
    color: #ff9800;
  }

  .dashboard-container > div.chart-card .chart-description .asset-title {
    font-size: .8rem;
    font-weight: 600;
  }

  .chart-card {
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.2);
  }

  .chart-container {
    width: calc(100% - 300px);
  }

  .chart-container .header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .chart-container .header .tools {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin: 0;
    padding: 15px;
    width: calc(100% - 300px);
  }

  .chart-container .header .title {
    padding: 20px 10px 10px 30px;
    text-transform: uppercase;
  }

  .chart-container .header .md-button-toggle:not(:last-of-type) {
    margin-right: 10px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .chart-container .header .md-button-toggle .md-button {
    font-size: .8rem;
    height: 30px;
    text-transform: lowercase;
    border: 1px solid #e5e5e5;
    font-weight: 800;
  }

  .chart-container .header .md-button-toggle .md-button:not(:last-of-type) {
    border-right: 0;
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
