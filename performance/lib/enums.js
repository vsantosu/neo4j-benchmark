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


    /* probability distribution defined */
    this.PD = {
        BINOMIAL           : 0,
        BETA               : 1,
        CAUCHY             : 2,
        CHI_SQUARED        : 3,
        EXPONENTIAL        : 4,
        F_DISTRIBUTION     : 5,
        GAMMA              : 6,
        LAPLACE            : 7,
        LOG_NORMAL         : 8,
        NEGATIVE_BINOMIAL  : 9,
        NORMAL             : 10,
        POISSON            : 11,
        UNIFORM            : 12,
        UNIFORM_WHOLE      : 13
    };

}


/* exporting the module */
module.exports = Object.freeze(new BenchmarkEnum());