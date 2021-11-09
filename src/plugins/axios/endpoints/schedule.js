export default {
	getList: (id, startDate, endDate) => 'TrainSchedules/getList?locationId=' + id + '&startDate=' + startDate + '&endDate=' + endDate,
	getMechanicsList: (startDate, endDate, id) => 'MechanicShifts/getList?dateStart=' + startDate + '&endDate=' + endDate + '&locationId=' + id,
	getMobileTeamsMechanicsShifts: (startDate, endDate, id) => 'MechanicShifts/getList?dateStart=' + startDate + '&endDate=' + endDate + '&locationId=' + id,
	getScheduleMobileList: 'MechanicShifts/getScheduleMobileList',
	createMechanicSchedule: 'MechanicShifts/createSchedule',
	changeMechenicAvailability: 'MechanicShifts/changeAvailability'
}
