/**
 * Created by beren on 28/12/2016.
 */
import Vue from 'vue';
import _ from 'underscore';

const applicationId = 30;

function getCurrentUrlParameters() {
  const windowHash = window.location.hash;
  return _.chain(windowHash.slice(windowHash.indexOf('?') + 1).split('&'))
  .map(function (item) { if (item) { return item.split('='); } })
.compact()
  .object()
  .value();

}

export default {
  get: (url, params, cb, errcb) => {
    const currentUrlParameters = getCurrentUrlParameters();
    const token = currentUrlParameters['access_token'] || localStorage.getItem('WBToken');

    let urlString = url;
    params.push({ key: 'access_token', value: token });
    // extra parameters
    for (let i = 0; i < params.length; i++) {
      if (i === 0) {
        urlString += '?';
      } else {
        urlString += '&';
      }
      urlString += params[i].key + '=' + params[i].value;
    }
    Vue.http.get(urlString).then((response) => {
      cb(response);
    }, (err) => {
      errcb(err);
    });
  },
  post: function (url, data, cb, errcb){
    // extra parameters
    const currentUrlParameters = getCurrentUrlParameters();
    const token = currentUrlParameters['access_token'] || localStorage.getItem('WBToken');

    let urlString = url;
    urlString += '?access_token=' + token;
    Vue.http.post(urlString, data).then((response) => {
      cb(response);
    }, (err) => {
        errcb(err);
    });
  },
  postWithHeaders: function (url, data, cb, errcb, headers){
    // extra parameters
    const currentUrlParameters = getCurrentUrlParameters();
    const token = currentUrlParameters['access_token'] || localStorage.getItem('WBToken');

    let urlString = url;
    urlString += '?access_token=' + token;

    Vue.http.post(urlString, data, {headers}).then((response) => {
      cb(response);
    }, (err) => {
        errcb(err);
    });
  },
  put: function(url, data, cb, errcb){
    // extra parameters
    const currentUrlParameters = getCurrentUrlParameters();
    const token = currentUrlParameters['access_token'] || localStorage.getItem('WBToken');

    let urlString = url;
    urlString += '?access_token=' + token;

    Vue.http.put(urlString, data).then((response) => {
      cb(response);
    }, (err) => {
      errcb(err);
    });
  },
  delete: function(url, id, cb, errcb){
    // extra parameters
    Vue.http.delete(url + '/' + id).then((response) => {
      cb(response);
    }, (err) => {
      errcb(err);
    });
  },
  convertObjectAndArray: function(obj) {
    let result = null;
    let objStr = JSON.stringify(obj);
    result = objStr.replace(/\{/g, '%7B');
    result = result.replace(/\}/g, '%7D');
    result = result.replace(/\:/g, '%3A');
    result = result.replace(/\"/g, '%22');
    result = result.replace(/\,/g, '%2C');
    result = result.replace(/ /g, '%20');
    result = result.replace(/\[/g, '%5B');
    result = result.replace(/\]/g, '%5D');
    return result
  },
  convertObject: function(obj) {
    let result = null;
    let objStr = JSON.stringify(obj);
    result = objStr.replace(/\{/g, '%7B');
    result = result.replace(/\}/g, '%7D');
    result = result.replace(/\:/g, '%3A');
    result = result.replace(/\"/g, '%22');
    result = result.replace(/\,/g, '%2C');
    result = result.replace(/ /g, '%20');
    return result
  },
  convertArray: function(obj) {
    let result = null;
    let objStr = JSON.stringify(obj);
    result = objStr.replace(/\[/g, '%5B');
    result = objStr.replace(/\]/g, '%5D');
    result = objStr.replace(/\"/g, '%22');
    result = objStr.replace(/\,/g, '%2C');
    result = objStr.replace(/ /g, '%20');
    return result
  },
  /* For NS */
  allowedOrganizationsAndAlgorithmUsersNS(url, cb, errcb) {
    this.get(`${url}`, [], (response) => {
      cb(response);
    }, (response) => {
      errcb(response);
    });
  },
  getAlgorithmsNS(url, from, to, groupPerClient, cb, errcb) {
/*    const environment = c.environment === 0 ? 'production' : 'test';*/
    this.get(`${url}Services/getAlgorithmsOverview`, [
      {key: 'from', value: from},
      {key: 'to', value: to},
      {key: 'groupPerClient', value: groupPerClient},
/*      {key: 'environment', value: environment},*/
    ], (response) => {
      cb(response);
    }, (response) => {
      errcb(response);
    });
  },
  getAlgorithmsOverviewByIdNS(url, from, to, groupPerClient, algId, cb, errcb) {
/*    const environment = c.environment === 0 ? 'production' : 'test';*/
    this.get(`${url}Services/getAlgorithmsOverview`, [
      { key: 'from', value: from },
      { key: 'to', value: to },
      { key: 'groupPerClient', value: groupPerClient },
/*      { key: 'environment', value: environment },*/
      { key: 'filter[where][id]', value: algId },
    ], (response) => {
      cb(response);
    }, (response) => {
      errcb(response);
    });
  },
  getAlgorithmDetailsNS(url, serviceId, from, to, cb, errcb) {
/*    const environment = c.environment === 0 ? 'production' : 'test';*/
    this.get(`${url}Services/getAlgorithmDetails`, [
      { key: 'serviceId', value: serviceId },
      { key: 'from', value: from },
      { key: 'to', value: to },
/*      { key: 'environment', value: environment },*/
    ], (response) => {
      cb(response);
    }, (response) => {
      errcb(response);
    });
  },
  getAlgorithmGroupDetailsNS(url, options, cb, errcb) {
    this.get(`${url}Services/getAlgorithmGroupDetails`, options, (response) => {
      cb(response);
    }, (response) => {
      errcb(response);
    });
  },
  /*getMdFileNS(filename) {
    return new Promise((resolve, reject) => {
      this.get(`${coreUrl}Docs/getDocByFileName`, [{ key: 'filename', value: filename }], (response) => {
        resolve(response);
      }, (response) => {
        reject(response);
      });
    });
  },*/
  /* NS BAAS */
  getGroupNamesForKeys(url, options, cb, errcb) {
    this.get(`${url}Algorithms/getGroupNamesForKeys`, [
      { key: 'algorithmGroupKeys', value: options },
    ], function (response) {
      cb(response);
    }, function (response) {
      errcb(response);
    });
  },
  getAutoAggregatedDateFilteredLogs(url, options, cb, errcb) {
    // console.log(this.convertObject(options.select));
    let dataOptions = [
      // { key:'algorithmId', value: options.algorithmId },
      // { key:'customer', value: options.customer },
      // { key:'organisation', value: this.convertObjectAndArray(options.organisation) },
      { key:'from', value: options.from },
      { key:'to', value: options.to },
      { key:'select', value: this.convertObject(options.select) },
      { key:'datapoints', value: options.datapoints },
      //{ key:'group', value: 'algorithmGroupKey' },
    ];
    if(options.algorithmId) {
      dataOptions.push(
        { key:'algorithmId', value: options.algorithmId }
      );
    }
    if(options.organisation){
      dataOptions.push(
        { key:'organisation', value: options.organisation }
      );
    }
    if (options.where)
      dataOptions.push({ key:'where', value: this.convertObjectAndArray(options.where) });
    if (options.group)
      dataOptions.push({ key:'group', value: options.group });
    if (options.appId)
      dataOptions.push({ key:'appId', value: options.appId });

    this.get(`${url}RunLogs/getAutoAggregatedDateFilteredLogs`, dataOptions,
      function(response) {
        cb(response);
      }, function(response) {
        errcb(response);
      })
  },
  getRunsStatus(url, options, cb, errcb) {
    let resOptions = [
      { key:'organisation', value: options.organisation },
      { key:'from', value: options.from },
      { key:'to', value: options.to },
    ];

    if (options.ignore)
      resOptions.push({ key:'ignore', value: this.convertObjectAndArray(options.ignore) });
    if (options.appId)
      resOptions.push({ key:'appId', value: options.appId });

    this.get(`${url}RunLogs/getRunsStatus`,
      resOptions, function(response) {
        cb(response);
      }, function(response) {
        errcb(response);
      });
  },
  getAlgorithmsByKeys(url, options, cb, errcb) {
    this.get(`${url}Algorithms`, [{key: 'filter', value: this.convertObjectAndArray(options)}],
      function(response) {
        cb(response);
      }, function(response) {
        errcb(response);
      })
  },
  getRunsStatusOverTime(url, options, cb, errcb) {
    let resOptions = [
      { key:'organisation', value: options.organisation },
      { key:'from', value: options.from },
      { key:'to', value: options.to },
      { key:'dataPoints', value: options.datapoints },
    ];

    if (options.ignore)
      resOptions.push({ key:'ignore', value: this.convertObjectAndArray(options.ignore) });
    if (options.appId)
      resOptions.push({ key:'appId', value: options.appId });

    this.get(`${url}RunLogs/getRunsStatusOverTime`, resOptions, function(response) {
      cb(response);
    }, function(response) {
      errcb(response);
    });
  },
  getAlgorithmRuns(url, options, cb, errcb) {
    this.get(`${url}AlgorithmRuns`, [{key: 'filter', value: this.convertObjectAndArray(options)}], function(response) {
      cb(response);
    }, function(response) {
      errcb(response);
    })
  },
};
