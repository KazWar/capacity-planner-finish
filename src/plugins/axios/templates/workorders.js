import { apis, endpoints } from '../axios'

const geWorkorderstListServiceRequestsMBN2 = () => apis.get(endpoints.workorders.getListServiceRequestsMBN2)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getPitStopWorkOrders = () => apis.get(endpoints.workorders.getPitStopWo)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkordersBWO = () => apis.get(endpoints.workorders.getBWOWo)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkorderDetail = (id) => apis.get(endpoints.workorders.getDetail(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkorderFilteredDetail = (id, filter) => apis.get(endpoints.workorders.getFilteredDetail(id, filter))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWoByMaterialNumber = (id) => apis.get(endpoints.workorders.getWoByMaterialNumber(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkordersByIds = (ids) => apis.get(endpoints.workorders.getWorkordersByIds(ids))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkordersByInRollingStock = (id) => apis.get(endpoints.workorders.getWorkordersByInRollingStock(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getBWORelatedWO = (id) => apis.get(endpoints.workorders.getBWORelatedWO(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkOrdersMonitorList = () => apis.get(endpoints.workorders.getMonitorList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkorderCommodityGroups = () => apis.get(endpoints.workorders.getCommodityGroups)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkorderSbList = (id, day) => apis.get(endpoints.workorders.getSbList(id, day))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkorderSbList2Count = (id, day, tomorrow) => apis.get(endpoints.workorders.getSbList2Count(id, day, tomorrow))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkorderSbList2 = (id, day, tomorrow, params) => apis.get(endpoints.workorders.getSbList2(id, day, tomorrow, params))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveWorkOrder = (obj) => apis.post(endpoints.workorders.saveWorkOrder, {data: obj})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const createWorkOrder = (obj) => apis.post(endpoints.workorders.saveWorkOrder, {data: obj})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const updateWorkOrder = (obj) => apis.put(endpoints.workorders.updateWorkOrder(obj.id), obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkordersDuplicates = () => apis.get(endpoints.workorders.searchDuplicates)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getMobileTeamsWo = () => apis.get(endpoints.workorders.getMobileTeamsWo)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const removeWorkordersDuplicates = (obj) => apis.post(endpoints.workorders.removeDuplicates, {})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const linkWorkorder = (obj) => apis.post(endpoints.workorders.linkWorkorder, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const unLinkWorkorder = (obj) => apis.post(endpoints.workorders.unLinkWorkorder, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const approveWO = (obj) => apis.put(endpoints.workorders.approveWO, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const resetWO = (obj) => apis.post(endpoints.workorders.resetWO, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const changeNtLocationType = (obj) => apis.post(endpoints.workorders.changeNtLocationType, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteWorkorder = (num) => apis.post(endpoints.workorders.deleteWO, {WO: num})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveWorkOrderPlan = (id) => apis.put(endpoints.workorders.planWO, {id: id.toString()})
	.then(response => {
		return response.data
	})

const assignSR = (id, ids) => apis.put(endpoints.workorders.assignSR, {data: [{
		id: id,
		reasonAssignment: ids
	}]})
	.then(response => {
		return response.data
	})

const setKlantBehoefte = (code, val) => apis.put(endpoints.workorders.setKlantBehoefte, {code, val})
	.then(response => {
		return response.data
	})

const planSelectionWorkorder = (ids, id) => apis.put(endpoints.workorders.planSelection, {workOrderIds: ids, locationId: id})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const resetWorkOrderPlan = (id, num) => apis.post(endpoints.workorders.resetWorkOrders, {
	id,
	num
})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

//REMOVE THIS METHOD IN SPRINT 44
const resetBWO = (num) => apis.post(endpoints.workorders.resetBWO, {WO: num})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })
//
const changeStatusBWOwo = (num) => apis.post(endpoints.workorders.changeStatusBWOwo, {WO: num})
	.then(response => {
		return response.data
	})

const saveBWO = (num) => apis.post(endpoints.workorders.planBWO, {WO: num})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const assignBWOwo = (obj) => apis.post(endpoints.workorders.assignBWOwo, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const fillBWO = (id) => apis.post(endpoints.workorders.fillBWO, {workOrderId: id})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	geWorkorderstListServiceRequestsMBN2,
	getWorkordersBWO,
	saveWorkOrder,
	saveWorkOrderPlan,
	getPitStopWorkOrders,
	getWorkOrdersMonitorList,
	removeWorkordersDuplicates,
	getWorkordersDuplicates,
	deleteWorkorder,
	resetWorkOrderPlan,
	getWorkorderCommodityGroups,
	changeStatusBWOwo,
	resetBWO,
	saveBWO,
	fillBWO,
	getBWORelatedWO,
	getWorkorderDetail,
	getWorkorderFilteredDetail,
	getWorkorderSbList,
	getWorkorderSbList2Count,
	setKlantBehoefte,
	getWorkorderSbList2,
	planSelectionWorkorder,
	getMobileTeamsWo,
	linkWorkorder,
	changeNtLocationType,
	assignSR,
	approveWO,
	resetWO,
	getWoByMaterialNumber,
	getWorkordersByIds,
	getWorkordersByInRollingStock,
	unLinkWorkorder,
	createWorkOrder,
	updateWorkOrder,
	assignBWOwo
}
