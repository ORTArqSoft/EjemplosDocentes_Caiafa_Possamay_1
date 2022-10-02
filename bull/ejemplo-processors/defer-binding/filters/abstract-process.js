class AbstractProcess {
    run(job, next, done) {
        throw new Error('No implementeado!');
    }
    tiempoProceso(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}

module.exports = AbstractProcess;