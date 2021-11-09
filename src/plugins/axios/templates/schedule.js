import { apis, endpoints } from '../axios'

const createMechanicSchedule = (obj) => apis.post(endpoints.schedule.createMechanicSchedule, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const changeMechanicsAvailability = (obj) => apis.post(endpoints.schedule.changeMechenicAvailability, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getMechanicsScheduleList = (startDate, endDate, id) => apis.get(endpoints.schedule.getMechanicsList(startDate, endDate, id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getTrainScheduleList = (id, startDate, endDate) => apis.get(endpoints.schedule.getList(id, startDate, endDate))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getMobileTeamsMechanicsShifts = (startDate, endDate, id) => apis.get(endpoints.schedule.getMobileTeamsMechanicsShifts(startDate, endDate, id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	createMechanicSchedule,
	changeMechanicsAvailability,
	getMechanicsScheduleList,
	getTrainScheduleList,
	getMobileTeamsMechanicsShifts,
}
