<template>
  <div v-if='drawChart' class="pie-container">
    <IEcharts @mouseover="onPieHover" @mouseout="onPieMouseOut" :option='chart' :style="donutStyle"  @ready='ready' @click='' :resizable="true"> </IEcharts>
    <div class="sub-label-value" :style="{'font-size':labelSize + 'px', 'color': subLabelColor}">
      <div>{{subLabelValue}}</div>
    </div>
    <div class="sub-label" v-if="showSubLabel" :style="{'color': subLabelColor}">
      {{subLabel}}
    </div>
  </div>
</template>
<style scoped>
  .pie-container {
    position: relative;
  }
  .sub-label {
    position: absolute;
    top: 56%;
    width: 46%;
    left: 26%;
    line-height: .9rem;
    font-size: .9rem;
    text-align: center;
    color: #000;
  }
  .sub-label-value {
    top: 35%;
    position: absolute;
    width: 30%;
    height: 30%;
    left: 35%;
    color: #000;
    display: flex;
    background: none;
    justify-content: center;
    align-items: center;
  }
  .sub-label-value > div {
    display: inline-block;
    font-family: sans-serif;
    font-weight: bold;
    text-align: center;
    background: #fff;
  }
</style>
<script>
  import IEcharts from 'vue-echarts-v3';

export default {
    name: 'donut',
    components: {
      IEcharts,
    },
    props: [
      'percentages', 'title', 'clickable',
      'showLegend', 'showTitle',
      'donutStyle', 'labelSize',
      'showSubLabel', 'isGrayscale', 'centerText',
      'totalCalls', 'legend', 'subPropsLabel', 'colors',
    ],
    watch: {
      percentages() {
        this.setData();
      },
      totalCalls(val) {
        this.subLabelValue = val;
      },
      legend(val) {
        if (val) this.chart.legend.data = val;
      },
    },
    data: () => ({
      subLabelColor: null,
      drawChart: false,
      subLabel: this.subPropsLabel,
      subLabelValue: this.totalCalls || 0,
      chart: {
        color: ['#e01812', '#ea774e', '#83d2b1', '#cfcfcf', '#4a90e2'],
        title: {
          show: this.showTitle,
          text: '',
          textAlign: 'center',
          x: '50%',
          textStyle: {
            color: '#666',
            fontWeight: 'bolder',
          },
          top: '6%',
        },
        tooltip: {
          trigger: 'item',
          /*formatter: (params, ticket, callback) => {
            return ''; // params.data.value;
          },*/
        },
        series: {
          hoverAnimation: false,
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          data: [],
        },
        legend: {
          orient: 'vertical',
          y: 'bottom',
          x: 'right',
          padding: 5,    // [5, 10, 15, 20]
          itemGap: 4,
          textStyle: { fontSize: '10' },
          show: this.showLegend,
          data: ['Failed calls', 'Slow handling time', 'Successful calls'],
        },
      },
    }),
    mounted() {
      this.setData();
      this.drawChart = true;
      this.chart.title.text = this.title;
      if (this.legend) this.chart.legend.data = this.legend;
      if (this.colors) this.chart.color = this.colors;
    },
    methods: {
      setData() {
        // let count = 0;
        // let spaces = '';
        // let sum = 0;
        /* const data */
        this.chart.series.data = this.percentages.map((percentage, i) => {
          // count++;
          // var space = spaces.substring(0, count);
          // sum += percentage;
          return { value: percentage, name: this.chart.legend.data[i] };
        });
        // this.chart.series.data = data;
      },
      onPieHover(e) {
        this.subLabel = e.name;
        this.subLabelValue = e.value;
        this.subLabelColor = e.color;
      },
      onPieMouseOut() {
        this.subLabel = this.subPropsLabel;
        this.subLabelValue = this.totalCalls;
        this.subLabelColor = '#000';
      },
    },
  };
</script>
