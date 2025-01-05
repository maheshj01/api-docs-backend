// threadWorker.ts
// src/utils/threadWorker.ts
import { parentPort } from 'worker_threads';

function expensiveOperation() {
    let sum = 0;
    for (let i = 0; i < 10000000000; i++) {
        sum += i;
    }
    return sum;
}

if (parentPort) {
    const result = expensiveOperation();
    parentPort.postMessage(result);
}

