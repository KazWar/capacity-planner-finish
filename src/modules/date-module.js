/**
 * All date related functionality.
 *
 * @author Stan Hurks, OxPlus BV
 */
export default {
    monthNames: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
    
    monthNamesShort: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],

    dayNames: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],

    /**
     * Convert a date string to a date object
     * @param {string} dateString the date string
     */
    toDateObject (dateString) {
        return new Date(
            dateString.substring(2, 3) === '-' ? dateString.substring(6, 10) : dateString.substring(0, 4),
            Number(dateString.substring(2, 3) === '-' ? dateString.substring(3, 5) : dateString.substring(5, 7)) - 1,
            dateString.substring(2, 3) === '-' ? dateString.substring(0, 2) : dateString.substring(8, 10),
            dateString.length > 10 ? dateString.substring(11, 13) : 0,
            dateString.length > 10 ? dateString.substring(14, 16) : 0,
            dateString.length > 10 ? dateString.substring(17, 19) : 0,
            0
        )
    },

    /**
     * Convert a date object to a date string
     * @param {Date} dateObject the date object
     */
    toDateString (dateObject) {
        var day = String(dateObject.getDate())
        var month = String(dateObject.getMonth() + 1)
        var year = String(dateObject.getFullYear())
        var hours = String(dateObject.getHours())
        var minutes = String(dateObject.getMinutes())
        var seconds = String(dateObject.getSeconds())

        day = day.length === 1 ? '0' + day : day
        hours = hours.length === 1 ? '0' + hours : hours
        month = month.length === 1 ? '0' + month : month
        minutes = minutes.length === 1 ? '0' + minutes : minutes
        seconds = seconds.length === 1 ? '0' + seconds : seconds

        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    },

    getDateDayMonthTimeNumbers(date){
        var dateString = this.toDateString(date)
        return date.getDate() + '-' + (date.getMonth() + 1) + ' ' + dateString.substring(11, 16)
    },

    /**
     * Get the array of dates from a time span
     * @param {string} startDate the start date
     * @param {string} endDate the end date
     */
    getDatesFromTimeSpan (startDate, endDate) {
        var date = startDate.substring(0, 10)
        var dates = [date]

        while (endDate > date) {
            var dateObject = this.toDateObject(date)
            dateObject.setTime(dateObject.getTime() + (24 * 60 * 60 * 1000))
            date = this.toDateString(dateObject).substring(0, 10)
            dates.push(date)
        }
        return dates
    },

    /**
     * TODO: unit
     * Formats a date
     * @param {Date} date the date to format
     */
    formatDayMonthTimeStamp (date) {
        var dateString = this.toDateString(date)
        return date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + dateString.substring(0, 4) + ' ' + dateString.substring(11, 16)
    },

    /**
     * TODO: unit
     * Format the date (dayName date month) ex: Maandag 21 Januari
     * @param {Date} date the date
     */
    formatDayNameDateMonth (date) {
        return this.dayNames[date.getDay()] + ' ' + date.getDate() + ' ' + this.monthNames[date.getMonth()]
    },

    /**
     * TODO: unit
     * Format the date (dayName date month year) ex: Maandag 21 Januari 2018
     * @param {Date} date the date
     */
    formatDayNameDateMonthYear (date) {
        return this.dayNames[date.getDay()] + ' ' + date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear()
    },

    /**
     * TODO: unit
     * Format the date (dayName date month) ex: Maandag 21 Januari
     * @param {Date} date the date
     */
    formatAbbreviatedDayNameDateMonth (date) {
        return this.dayNames[date.getDay()].substring(0, 2) + ' ' + date.getDate() + ' ' + this.monthNames[date.getMonth()]
    },

    /**
     * TODO: unit
     * Format a date (date month year)
     * @param {Date} date the date
     */
    formatDateMonthYear (date) {
        return date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear()
    }
}
