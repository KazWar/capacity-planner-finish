export class Feature {

	constructor(data = {}) {
		Object.assign(this, data)
	}

	// Name of the feature.
	name = null

	// Short description of the feature.
	description = null

	// Boolean which denotes whether this feature is enabled for the profile/user.
	enabled = false

	// Boolean which denotes whether this feature is automatically selected because of a parent profile.
	default = false

	// Array containing feature objects.
	features = []
}





