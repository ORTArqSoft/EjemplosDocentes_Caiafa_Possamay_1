module.exports = function (job) {
    const Filter = require('../defer-binding/implementation')({job:job});
    const next = null;
    return Filter.run(job, next, null);
}