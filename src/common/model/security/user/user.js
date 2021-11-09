import initialPermissions from './features.json'

export class User {

	constructor (data = {}) {
		Object.assign(this, data)
	}

	// Unique user id.
	id = null

	// User first name.
	firstName = null

	// User last name.
	lastName = null

	// Short description about this user.
	description = null

	// What the user uses to log into the system.
	username = null

	// Currently active user profile.
	profile = null

	// User phone number.
	phoneNr = null

	// Boolean to indicate whether this user account is enabled or disabled.
	// Disabled users cannot log into the system.
	active = false

	// Date on which this user was created.
	createdOn = null

	// Date on which the user's settings were edited.
	editedOn = null

	// List of features this user can access.
	permissions = null

	// Function to return full user name.
	get fullName () {
		return `${this.firstName} ${this.lastName}`
	}

	// Creates an empty user with an initial permissionList.
	new () {
		return new User({ "permissions": initialPermissions })
	}
}
