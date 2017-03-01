"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * This module decription
 * @module path/moduleFileName
 * @see module:path/referencedModuleName
 */


/**
 * Benchmark Enumerations.
 * @constructor
 */
function BenchmarkEnum()  {

    this.Test = {
        SINGLE_READ:       'read',
        SINGLE_WRITE:      'writ',
        SINGLE_READ_WRITE: 'read-writ',
        NEIGHBORS:         'neig'
    };

}


/* exporting the module */
module.exports = Object.freeze(new BenchmarkEnum());