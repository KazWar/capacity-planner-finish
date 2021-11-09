export default {
	getDetail: (id) => 'tasks/getOne?id=' + id,
	saveTask: 'tasks/saveTask',
	deleteTask: (id) => 'tasks/getOne?id=' + id,
	saveEquipmentTask: 'TaskEquipments/',
	deleteEquipmentTask: (id) => 'TaskEquipments/' + id,
	createQualificationTask: 'TaskQualifications',
	saveQualificationTask: 'Tasks/saveTaskQualifications',
	deleteQualificationTask: (id) => 'TaskQualifications/' + id
}
