/**
 * Get the last day of a month
 */
Date.prototype.lastDayOfMonth = function () {
  let month = this.getMonth()
  if (month === 1) {
    return this.getFullYear() % 4 === 0 ? 29 : 28
  }
  if ([0, 2, 4, 6, 7, 9, 11].indexOf(month) !== -1) {
    return 31
  }
  return 30
}

/**
 * Replaces a substring within a string by its starting and ending index.
 * @param {number} startIndex the start index of the substring
 * @param {number} endIndex the end index of the substring
 * @param {string} replacement the replacement for the substring
 */

String.prototype.replaceAt = function (startIndex, endIndex, replacement) {
  return this.substr(0, startIndex) + replacement + this.substr(endIndex)
}

