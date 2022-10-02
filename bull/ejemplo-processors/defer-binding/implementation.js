module.exports = (options) => {
    const job = options.job;
    const Implementation = require(`./filters/${job.data.type}.js`);
    return new Implementation();
};