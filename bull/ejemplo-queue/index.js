// https://optimalbits.github.io/bull/

//add => es del productor crea un job y lo agrega a la queue.
//process => es del consumidor procesa los jobs que hay en la queue.


const Bull = require('bull');

// queue name unique.
const Queue     = new Bull('queue-test');
// Repeated jobs
const Queue2    = new Bull('queue-test-2');

// productor.
// por defecto los jobs siguen arquitectura FIFO. Se puede modificar en las Queue Options.
const jobs = [
    {
        nombre: 'job 1',
        status: 'error',
    },
    {
        nombre: 'job 2',
        status: 'mensaje',
    },
    {
        nombre: 'job 3',
        status: 'ok',
    },
]

jobs.forEach(function(job){
    Queue.add(job);
});

// consumidor.
// done no requerido. Callback para notificar si el job se hace correctamente o no => escuchar el evento.
// si no lo invoco, bull deja actual job como activo y el siguiente job waiting.
Queue.process((job, done) => {
    // job.data contiene los datos personalizados cuando se creó el job.
    if(job.data.status == 'ok'){
        done();
    }
    if(job.data.status == 'mensaje'){
        done(null, {mensaje:'done...'});
    }
    if(job.data.status == 'error'){
        done(new Error('hubo un error...'));
    }
});

// Repeated jobs => agrega job cada N cron expression https://crontab.cronhub.io/
// Ver estado de jobs con https://www.npmjs.com/package/bull-arena
Queue2.add({
    nombre: 'job x',
    status: 'process',
}, { repeat: { cron: '*/2 * * * * *' }} ); //every 2 seconds.

Queue2.process((job, done) => {
    //Ver progreso en arena UI.
    var process = 0;
    const intID = setInterval(() => {
        process += 20
        job.progress(process);    
    }, 2); //cada 2 secs.

    setTimeout(() => {
        clearInterval(intID);
        done(null, {mensaje:'done 100%'});  
    }, 10000 ); //done en 10 secs.
});

// eventos
Queue.on('completed', job => {
    const mensaje = (job.returnvalue.mensaje)?job.returnvalue.mensaje:'';
    // job.id contiene id de este job.
    console.log(`job ${job.id} completed ${mensaje}`);
});

Queue.on('failed', job => {
    console.log(`job ${job.id} failed, ${job.failedReason}`);
});

Queue.on('active', job => {
    console.log(`job ${job.id} active`);
});

Queue2.on('completed', job => {
    const mensaje = (job.returnvalue.mensaje)?job.returnvalue.mensaje:'';
    console.log(`job ${job.id} completado ${mensaje}`);
});