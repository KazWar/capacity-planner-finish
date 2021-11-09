export class Guardian {

	constructor(data = {}) {
		Object.assign(this, data)
	}

	// List of all the present features in the application.
	features = []

	// Currently logged in user.
	principal = null

	// The principals permissions.
	permissions = null

	canUse(feature){
		// Check if input is defined.
		if (!feature) {
			console.log(`${feature} is undefined or null.`)
			return false
		}

		// Find the feature in the list of application features.
		let foundFeature = []
		this.#findObjects(this.features,"name", feature, foundFeature)

		// Check if the feature was found.
		if (!Guardian.#checkIfObjectIsFound(foundFeature)){
			console.log(`The feature: ${feature} is not found.`)
			return false
		}

		// Check if the feature is enabled.
		if(!Guardian.#isFeatureEnabled(foundFeature)){
			console.log(`${feature} is currently disabled.`)
			return false
		}

		// Find the permission in the principals permissions.
		let permission = []
		this.#findObjects(this.permissions,"name", feature, permission)

		// Check if the permission was found.
		if (!Guardian.#checkIfObjectIsFound(permission)){
			console.log(`The permission: ${feature} is not found.`)
			return false
		}

		// Check if the principal is allowed to use the feature.
		if (!Guardian.#isPrincipalAllowed(permission)){
			console.log(`This user isn't allowed to use the feature:${permission}.`)
			return false
		} else {
			return true
		}
	}

	// Private helper function to check if the feature is globally enabled.
	static #isFeatureEnabled(feature){
		// Check if input is defined.
		if (!feature){
			return console.log(`${feature} is undefined or null.`)
		}

		return !!feature.some(f => f.enabled === true);
	}

	// Private helper function to check if the principal is allowed to use the feature.
	static #isPrincipalAllowed(permission) {
		// Check if input is defined.
		if (!permission) {
			return console.log(`${permission} is undefined or null.`)
		}

		return !!permission.some(p => p.enabled === true);
	}

	// Private helper function to check if object has been found.
	// Checking for length because the return object from the findObjects method is an array.
	static #checkIfObjectIsFound(array) {

		// Check if input is defined.
		if (!array) {
			return console.log(`${array} is undefined or null.`)
		}

		return array.length !== 0;
	}

	// This should probably be rewritten at some point to take in no parameters and just return something
	// if something is found and not return an array with the possibily found objects inside.
	// https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-array
	// Extracts an object out of an nested array of features based on search parameters.
	#findObjects(obj, targetProp, targetValue, finalResults) {
		function getObject(theObject) {
			let result = null;
			if (theObject instanceof Array) {
				for (let i = 0; i < theObject.length; i++) {
					getObject(theObject[i]);
				}
			} else {
				for (let prop in theObject) {
					if (theObject.hasOwnProperty(prop)) {
						if (prop === targetProp) {
							if (theObject[prop] === targetValue) {
								finalResults.push(theObject);
							}
						}
						if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
							getObject(theObject[prop]);
						}
					}
				}
			}
		}

		getObject(obj);
	}
}
