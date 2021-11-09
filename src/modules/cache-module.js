/**
 * This module will keep track of all cache data per page within the application
 * @author Stan Hurks, OxPlus BV
 */
export default {
    revisionCountByTaskId: {},

    workOrders: {
        getListLocationMaterialNumbersTodayTomorrowPO: {},
        getListServiceRequestsLocationDate: {},
        getListServiceRequestsMBNArrivalDeparture: {},
        getListServiceRequestsMBN: {}
    },

    mechanicSchedules: {
        getShiftsLocationTodayTomorrow: {}
    },

    trainSchedules: {
        getListLocationTodayTomorrow: {}
    },

    equipment: {
        getListLocation: {},
        getList: {}
    },

    locations: {
        getList: {}
    },

    qualifications: {
        getList: {}
    }
}
