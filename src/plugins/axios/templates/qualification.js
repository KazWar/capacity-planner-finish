import { apis, endpoints } from '../axios'

const getQualificationList = () => apis.get(endpoints.qualification.getList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getQualificationList
}
