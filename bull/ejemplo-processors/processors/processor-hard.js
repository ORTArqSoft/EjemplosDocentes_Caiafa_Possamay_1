module.exports = function (job) {
    const Filter = require('../defer-binding/implementation')({job:job});
    const next = 'medium';
    return Filter.run(job, next, null);
}