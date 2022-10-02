module.exports = function (job) {
    const Filter = require('../defer-binding/implementation')({job:job});
    const next = 'light';
    return Filter.run(job, next, null);
}