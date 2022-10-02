const Bull = require('bull');
const queueHard = new Bull('queue-hard');
const queueLight = new Bull('queue-light');
const queueMedium = new Bull('queue-medium');

// parámetro cantidad de queues a crear.
const data = process.argv[2];
if(!data){
    console.log('se espera parámetro cantidad de jobs');
    process.exit(1);
}
for(i=0; i < data; i++){
    queueHard.add({
        job:i, 
        type:'hard',
    });
}
queueHard.process((job, done) => {
    const Filter = require('./defer-binding/implementation')({job:job});
    const next = 'medium';
    Filter.run(job, next, done);
});

queueMedium.process((job, done) => {
    const Filter = require('./defer-binding/implementation')({job:job});
    const next = 'light';
    Filter.run(job, next, done);
});

queueLight.process((job, done) => {
    const Filter = require('./defer-binding/implementation')({job:job});
    const next = null;
    Filter.run(job, next, done);
});

// Se termina de procesar todos los "hard" antes de pasar a los medium.
// solucion => procesos separados con promises para no dejar "stalled" la queue con código bloqueante. 
queueHard.on('completed', (job, result) => {
    console.log('>>> Hard', `job id ${job.id}`, 'completed');
    console.log('>>> Next =>', result);
    queueMedium.add(result);
});

queueMedium.on('completed', (job, result) => {
    console.log('>>> Medium', `job id ${job.id}`, 'completed');
    console.log('>>> Next =>', result);
    queueLight.add(result);
});

queueLight.on('completed', (job, result) => {
    console.log('>>> Light', `job id ${job.id}`, 'completed');
    console.log('>>> End =>', result);
});