const Bull = require('bull');
const queueHard = new Bull('queue-hard');
const queueLight = new Bull('queue-light');
const queueMedium = new Bull('queue-medium');

const data = process.argv[2];
if(!data){
    console.log('se espera parametro cantidad de jobs!');
    process.exit(1);
}
for(i=0; i < data; i++){
    queueHard.add({
        job:i, 
        type:'hard',
    });
}

// Se termina de procesar todos los filtros "hard, medium, light" antes de pasar al siguiente "hard".
// solucion => procesos separados con promises para no dejar "stalled" la queue con código bloqueante y agregar procesos simultáneos.
queueMedium.process(`${__dirname}/processors/processor-medium.js`);
queueHard.process(`${__dirname}/processors/processor-hard.js`);
queueLight.process(`${__dirname}/processors/processor-light.js`);

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
