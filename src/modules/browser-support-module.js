/**
 * Keeps track of supported/unsupported functionality based on the
 * user's browser and its capabilities.
 * 
 * @author Stan Hurks, OxPlus
 */
export default class BrowserSupport {
    constructor() {
        this.initialize()
    }

    /**
     * Initialize the browser support module
     */
    initialize = () => {
        this.passiveOption()
        delete this.initialize
    }

    /**
     * Checks whether the user can use the passive option
     */
    passiveOption = () => {
        try {
            let opts = Object.defineProperty({}, 'passive', {
                get: () => {
                    this.passiveOption = true
                }
            })
            window.addEventListener('test', null, opts)
            this.passiveOption = true
        } catch (ex) {
            console.error("Your browser does not support the passive option, consider using another browser for optimized scrolling.")
            this.passiveOption = false
        }
    }
}