
export default {
	getList: 'users/getList',
	editUser: (id) => 'users/' + id,
	getMyInfo: (token) => 'users/getMyInfo?access_token=' + token,
	addUser: 'users/createUser',
	getEmails: 'users/getEmails',
	deleteUser: 'users/deleteUser',
	logout: 'users/logout',
	login: 'users/login',
	getDetail: (id) => 'users/' + id,
	exportUserInformation: () => `users/exportUserInformation?access_token=${localStorage.getItem('sessionId')}`
}
