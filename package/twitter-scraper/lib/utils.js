"use strict";
// Load modules
// Load my modules
// Constant declaration
// Module variables declaration
// Module interfaces declaration
// Module types declaration
// Module functions declaration
function streamToPromise(stream, emitErrors = false) {
    const promise = new Promise((res, rej) => {
        stream.once('finish', res); // For writable streams
        stream.once('end', res); // For all others
        if (emitErrors === true) {
            stream.once('error', rej);
        }
    });
    return promise;
}
exports.streamToPromise = streamToPromise;
// Module class declaration
// Module initialization (at first load)
// Module exports
//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78 
//# sourceMappingURL=utils.js.map