import { apis, endpoints } from '../axios'

const getUserList = () => apis.get(endpoints.user.getList)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getUserDetail = (id) => apis.get(endpoints.user.getDetail(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getMyInfo = (id) => apis.get(endpoints.user.getMyInfo(id))
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const deleteUser = (id) => apis.delete(endpoints.user.deleteUser, {data: {userId: id}})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const login = (username,password) => apis.post(endpoints.user.login,{
		email: username,
		password: password
	})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const logout = () => apis.post(endpoints.user.logout, {})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const editUser = (obj) => apis.put(endpoints.user.editUser(obj.id), obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const addUser = (obj) => apis.post(endpoints.user.addUser, obj)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const getUserEmails = () => apis.get(endpoints.user.getEmails)
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

const downloadUserInformation = () => apis.get(endpoints.user.exportUserInformation(), {
		responseType: 'blob'
	})
	.then(response => {
		return response.data
	})
	.catch(err => { throw err })

export {
	getUserEmails,
	downloadUserInformation,
	getUserList,
	deleteUser,
	login,
	logout,
	getMyInfo,
	getUserDetail,
	addUser,
	editUser
}
