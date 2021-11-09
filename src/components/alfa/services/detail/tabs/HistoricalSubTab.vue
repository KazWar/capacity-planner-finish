<template>
  <div class="historical-run">
    <md-card>
      <template v-if="algorithm">
        <div class="chart-container">
          <div class="header">
            <div></div>
            <div class="tools">
              <md-button-toggle md-single>
                <md-button class="md-toggle" @click.native="changeDuration('weeks')">week</md-button>
                <md-button @click.native="changeDuration('months')">month</md-button>
                <md-button @click.native="changeDuration('years')">year</md-button>
              </md-button-toggle>
            </div>
          </div>
          <div class="chart-block">
            <div class="no-data" v-if="(chartOptions && chartOptions.series && chartOptions.series.length === 0) ||
          (chartOptions.series && chartOptions.series[0] && chartOptions.series[0].data && chartOptions.series[0].data.length === 0)">
              No data for current period and selected algorithm. Select another date range or algorithm, please
            </div>
            <IEcharts :option="chartOptions" style="height:100%" :resizable="true"/>
          </div>
        </div>
      </template>
    </md-card>
    <!--<data-table
      :dataext="tableData"
      :columns="tableColumns"
      tableName="historicalRuns"
      :hasControls="false"
      :allowCreation="false"
      :dataLength="tableData.length"
      :showTitle="false"
      :pagination="{
      size: 50,
    }"
      :hasSelection="false">
    </data-table>-->
    <md-table>
      <md-table-header>
        <md-table-row>
          <md-table-head>Status</md-table-head>
          <!--<md-table-head>Organisation</md-table-head>-->
          <md-table-head>Algorithm</md-table-head>
          <!--<md-table-head>Environment</md-table-head>-->
          <md-table-head>Start</md-table-head>
          <md-table-head>End</md-table-head>
        </md-table-row>
      </md-table-header>
      <md-table-body>
        <md-table-row v-for="(row, index) in tableData" :key="index">
          <md-table-cell>{{ row.status }}</md-table-cell>
          <!--<md-table-cell>{{ row.organisation }}</md-table-cell>-->
          <md-table-cell>{{ row.algorithm }}</md-table-cell>
          <!--<md-table-cell>{{ row.environment }}</md-table-cell>-->
          <md-table-cell>{{ row.timeStart }}</md-table-cell>
          <md-table-cell>{{ row.timeEnd }}</md-table-cell>
        </md-table-row>
      </md-table-body>
    </md-table>
  </div>
</template>

<script>
  import managedata from '../../../helpers/managedata.js';
  import IEcharts from 'vue-echarts-v3';

  const moment = require('moment');

  export default {
    name: 'HistoricallSubTab',
    data: () => ({
      chartOptions: {},
      duration: 'weeks',
      tableColumns: [],
      tableData: [],
      algorithms: {},
      organisationNames: {}
    }),
    props: ['algorithm', 'currentTab', 'algorithmsFromDetails', 'urlMaas', 'urlBaas', 'getAlgorithmsFullPath'],
    components: {
      IEcharts,
    },
    watch: {
      algorithm(val) {
        if (val && this.currentTab === 2) {
          this.init();
        }
      },
      currentTab(val) {
        if (val && val === 2 && this.algorithm) {
          this.init();
        }
      },
    },
    methods: {
      init() {
        this.chartOptions = {
          color: ['#29BBD2', '#0098FF', '#F8E71C', '#47175B', '#0A2052', '#CC0466', '#FF077F', '#6ab04c', '#95afc0', '#ffbe76', '#7ed6df', '#686de0'],
          animation: true,
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              var output = "<table><th>" + moment(String(params[0].data[0])).format('MM/DD HH:mm') + "</th>";
              for (var i = 0; i < params.length; i++) {
                output += "<tr><td>" + params[i].seriesName + "</td><td>" + params[i].data[1] + "</td></tr>";
              }
              output += "</table>";
              return output;
            },
            axisPointer: {
              animation: false,
            },
          },
          legend: {
            //width: 500,
            orient: 'vertical', // 'vertical'
            x: '20', // 'center' | 'left' | {number},
            //y: '20', // 'top' | 'center' | 'bottom' | {number}
            backgroundColor: '#fff',
            borderColor: '',
            borderWidth: 0,
            padding: 5,    // [5, 10, 15, 20]
            itemGap: 5,
            textStyle: {color: 'black'},
            top: 120,
            type: 'scroll',
            y: 'center',
            data: [],
          },
          xAxis: {
            type: 'time',
            interval: 3600 * 24 * 1000,
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisLabel: {
              rotate: 0,
              fontSize: 10,
            },
          },
          yAxis: [
            {
              offset: 20,
              type: 'value',
              splitLine: {
                show: false,
              },
              position: 'right',
            },
          ],
          grid: {
            show: false,
            top: 80,
            right: 60,
            bottom: 60,
            left: 250,
          },
          barGap: '-2',
          barWidth: '20',
          series: [],
        };
        this.tableColumns = [
          {name: 'status', displayName: 'Status', visible: true, type: 'string', isEditable: false},
          {name: 'organisation', displayName: 'Organisation', visible: true, type: 'string', isEditable: false},
          {name: 'algorithm', displayName: 'Algorithm', visible: true, type: 'string', isEditable: false},
          {name: 'environment', displayName: 'Environment', visible: true, type: 'string', isEditable: false},
          {name: 'timeStart', displayName: 'Start', visible: true, type: 'string', isEditable: false},
          {name: 'timeEnd', displayName: 'End', visible: true, type: 'string', isEditable: false},
        ];
        this.$nextTick(() => {
          this.getLinechartData(this.getTableData);
        });
      },
      changeDuration(durationType) {
        this.duration = durationType;
        this.chartOptions.series.length = 0;
        this.getLinechartData();
      },
      getLinechartData(cb) {
        if (!this.algorithm) return;
        this.organisationNames = {};
        this.algorithms = {};
        let self = this;
        managedata.allowedOrganizationsAndAlgorithmUsersNS(this.getAlgorithmsFullPath, (res) => {
          if (res.body && res.body.wbAlgorithmUsers) {
            res.body.wbAlgorithmUsers.forEach((algUser) => {
              this.organisationNames[algUser.auth0ClientId] = algUser.name;
              if (algUser.algorithms) {
                algUser.algorithms.forEach((alg) => {
                  this.algorithms[alg.algorithmId] = alg.id;
                })
              }
            });
          }
          let organisationIds = [];
          Object.keys(self.organisationNames).forEach(function (item, index) {
            organisationIds.push(item);
          });

          const from = moment().subtract(1, this.duration).startOf('day').utc().format('YYYY-MM-DD HH:mm');
          if (this.chartOptions.xAxis && this.duration == 'weeks') {
            this.chartOptions.xAxis.interval = 3600 * 24 * 1000;
          } else if (this.chartOptions.xAxis && this.duration == 'months') {
            this.chartOptions.xAxis.interval = 3600 * 24 * 7 * 1000;
          } else if (this.chartOptions.xAxis && this.duration == 'years') {
            this.chartOptions.xAxis.interval = 3600 * 24 * 31 * 1000;
          }
          const options = {
            where: {algorithmGroupKey: {inq: [self.algorithm.algorithmGroupKey]}},
            from: from,
            to: moment().utc().format('YYYY-MM-DD HH:mm'),
            datapoints: 24,
            organisation: organisationIds,
            select: {"aggregator": "count", "property": "quantity", "as": "count"},
            group: "environment",
          };

          managedata.getAutoAggregatedDateFilteredLogs(this.urlBaas, options, (response) => {
            this.algorithmsFromDetails.forEach((algorithm, index) => {

              if (algorithm.callsCount > 0) {
                this.chartOptions.series[index] = {
                  showSymbol: false,
                  smooth: true,
                  type: 'bar',
                  data: [],
                  stack: 1,
                  name: algorithm.environment,
                };

                this.chartOptions.legend.data.push({name: algorithm.environment, icon: 'roundRect'});
                let diff = new Date().getTimezoneOffset();
                let chartData = response.data.filter((alg) => alg.environment == algorithm.environment)

                //Object.keys(chartData).forEach(function(chartItem,index) {
                chartData.forEach((item, i) => {
                  const time = moment(item.time).add(-1 * diff, 'minutes').toISOString();
                  this.chartOptions.series[index].data.push([time, item.count]);
                });
              }
            });
            if (cb) cb();
          }, (err) => {
            console.log(err);
          });
        }, (err) => console.log('Error:', err));

      },
      getTableData() {
        const from = moment().subtract(1, this.duration).startOf('day');
        const to = moment();
        let organisationIds = [];
        Object.keys(this.organisationNames).forEach((item) => {
          organisationIds.push(item);
        });
        let filter = {};
        filter['algorithmGroupKey'] = {inq: [this.algorithm.algorithmGroupKey]};
        filter['timeStart'] = {gt: from.toISOString()};
        filter['timeEnd'] = {lt: to.toISOString()};
        /*filter['organisation'] = {inq: organisationIds};*/
        managedata.getAlgorithmRuns(this.urlBaas, {where: filter, fields: {result: false}, order: 'timeCall DESC'}, (runs) => {
          this.tableData = runs.body.map(run => ({
            algorithm: run.algorithmId,
            environment: run.environment,
            timeStart: moment(run.timeStart).format('DD-MM-YYYY HH:mm'),
            timeEnd: moment(run.timeEnd).format('DD-MM-YYYY HH:mm'),
            status: run.error ? 'ERROR' : 'FINISHED',
            organisation: this.organisationNames[run.organisation],
          }));
        });
      },
    },
  };
</script>

<style scoped>

  .md-card {
    margin: 0 0 20px;
    padding: 20px;
    flex-direction: row;
  }

  .chart-container {
    width: 100%;
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

  .chart-block {
    height: 400px;
  }

  .no-data {
    color: #aaa;
    text-transform: lowercase;
    font-size: 18px;
    padding: 0 120px;
    display: inline-block;
    width: 100%;
    height: 400px;
    margin: 40px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #d7dde7;
    text-align: center;
    /*position: absolute;*/
  }
</style>
