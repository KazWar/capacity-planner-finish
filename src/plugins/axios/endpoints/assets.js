export default {
	getAssetsList: (arr) => 'Assets/getList?assetTypes=' + arr,
	getWorkOrdersAsset: (id) => 'Assets/getAssetWOs?assetId=' + id,
	saveReasonMaintenance: 'Assets/saveReasonMaintenance',
	assetAssignmentData: 'AssetAssignmentData/getList',
	saveConstructionType: 'AssetConstructionTypes/saveConstructionType',
	hideSeriesCode: 'AssetSeries/hideSeriesCode',
	makeSnapshot: 'AssetSeries/makeSnapshot',
	assetSeriesList: 'AssetSeries/getList',
	saveAsset: 'Assets/saveAsset'
}
