export class Settings {

	constructor(data = {}) {
		Object.assign(this, data)
	}

	// Currently selected language. i18n defaults to english if not set.
	locale = null
}
