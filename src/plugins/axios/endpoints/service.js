export default {
	changeStatus: 'ServiceRequests/changeStatus',
	saveEmplacement: 'ServiceWindowEmplacements/saveEmplacement',
	getServiceWindows: (ids) => 'ServiceWindows/getServiceWindows?serviceWindowIds=' + ids,
	deleteEmplacement: 'ServiceWindowEmplacements/deleteEmplacement',
	setEmplacementForWorkOrder: 'ServiceWindowEmplacements/setEmplacementForWorkOrder',
	setEmplacementForTask: 'ServiceWindowEmplacements/setEmplacementForTask',
	unsetEmplacementFromWorkOrder: 'ServiceWindowEmplacements/unsetEmplacementFromWorkOrder',
	unsetEmplacementFromTask: 'ServiceWindowEmplacements/unsetEmplacementFromTask'
}
