import { apis, endpoints } from '../axios'

const getAssetsList = (arr) => apis.get(endpoints.assets.getAssetsList(arr))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getWorkOrdersAsset = (id) => apis.get(endpoints.assets.getWorkOrdersAsset(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getAssetsSeriesList = () => apis.get(endpoints.assets.assetSeriesList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getAssetAssignmentDataList = () => apis.get(endpoints.assets.assetAssignmentData)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

// const getAssetsWithActualFleetStatus = (id) => apis.get(endpoints.assets.getAssetsWithActualFleetStatus(id))
// 	.then(response => {
// 		return response.data
// 	})
// 	.catch(err => { throw err })

const hideAssetsSeriesCode = (obj) => apis.post(endpoints.assets.hideSeriesCode, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const makeAssetSnapshot = () => apis.post(endpoints.assets.makeSnapshot, {})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveAssetConstructionType = (obj) => apis.post(endpoints.assets.saveConstructionType, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveAsset = (obj) => apis.post(endpoints.assets.saveAsset, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const saveAssetReasonMaintenance = (obj) => apis.post(endpoints.assets.saveReasonMaintenance, {data:obj})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getAssetsList,
	getWorkOrdersAsset,
	getAssetsSeriesList,
	getAssetAssignmentDataList,
	hideAssetsSeriesCode,
	makeAssetSnapshot,
	saveAsset,
	saveAssetConstructionType,
	saveAssetReasonMaintenance,
}
