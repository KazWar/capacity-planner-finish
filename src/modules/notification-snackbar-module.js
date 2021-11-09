/**
 * The notification snackbar component will depend on this module,
 * all entries of the notification snackbar will be stored here for global usage.
 *
 * @author Stan Hurks, OxPlus BV
 */
export default {
    transitionTimeMS: 300,

    durationTimeMS: 10000,

    counter: 0,

    entries: [],

    /**
     * Adds a regular entry to the list of entries
     * @param {string} content the content
     */
    add: function (content) {
        this.addEntry(content, this.durationTimeMS, {})
    },

    /**
     * Adds a warning entry to the list of entries
     * @param {string} content the content
     */
    addWarning: function (content) {
        this.addEntry(content, this.durationTimeMS, {
            'warning': true
        })
    },

    /**
     * Add an entry to the list of entries
     * @param {string} content the content
     * @param {number} durationMS the duration in milliseconds
     * @param {object} classes the object of classes
     */
    addEntry: function (content, durationMS, classes) {
        var id = ++this.counter
        var entry = {
            id,
            content: content,
            classes: classes,
            timeoutDone: false,
            transitionStarted: false,
            transitionDone: false
        }
        this.entries.push(entry)

        setTimeout(() => {
            entry.timeoutDone = true

            setTimeout(() => {
                entry.transitionDone = true
            }, this.transitionTimeMS)
        }, durationMS)
    }
}
