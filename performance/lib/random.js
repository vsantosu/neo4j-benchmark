"use strict";

/**
 * @author Edgardo A. Barsallo Yi (ebarsallo)
 * Creates a random set of number to be used for the write test. Each number will represent an index.
 * @module lib/random
 * @see module:lib/test-core
 */

/** Import modules */
const Enums = require('./enums');
const fs = require('fs');
const PD = require('probability-distributions');


/* Probability Distribution Types */
const PDType = Enums.PD;

/** Description of the class */
class Random {

    /**
     * Create a template object.
     * @param {object} [param= {}] - Parameter with default value of object {}.
     */
    constructor(param = {}) {

        this._property = param.prop || 'someValue';
    }

    /**
     * generate.
     * Generate random numbers according an chosen distribution.
     *
     * @param distr type of distribution.
     * @param online    indicates if the random numbers will be save online or offline.
     * @returns {*}
     */
    generate (distr, n, options = {}) {

        let output;

        /* options */
        let min = options.min || 0;
        let max = options.max || 100;

        switch (distr)
        {
            case PDType.BINOMIAL:
                output = PD.rbinom(n, 100, 0.80);
                break;

            case PDType.BETA:
                output = PD.rbeta(n, 0.5, 3);
                break;

            case PDType.CAUCHY:
                output = PD.rcauchy(n, 0, 1);
                break;

            case PDType.CHI_SQUARED:
                output = PD.rchisq(n, 5);
                break;

            case PDType.EXPONENTIAL:
                output = PD.rexp(n, 5);
                break;

            case PDType.F_DISTRIBUTION:
                output = PD.rf(n, 2, 5);
                break;

            case PDType.GAMMA:
                output = PD.rgamma(n, 0.5, 20);
                break;

            case PDType.LAPLACE:
                output = PD.rlaplace(n, 0, 1);
                break;

            case PDType.LOG_NORMAL:
                output = PD.rlnorm(n, 0, 1);
                break;

            case PDType.NEGATIVE_BINOMIAL:
                output = PD.rbinom(n, 6, 0.4);
                break;

            case PDType.NORMAL:
                output = PD.rnorm(n, 0, 1);
                break;

            case PDType.POISSON:
                output = PD.rpois(n, 5);
                break;

            case PDType.UNIFORM:
                output = PD.runif(n, min, max);
                break;

            case PDType.UNIFORM_WHOLE:
                output = PD.rint(n, min, max);
                break;

            default:
                return;

        }

        return output;
    }


}


/* exporting the module */
module.exports = Random;


let random = new Random();
let numbers = random.generate(PDType.UNIFORM_WHOLE, 5000, {min: 0, max: 49999});

/* write output to a file */
let file = fs.createWriteStream('../data/random-5k.txt');
/* error handling */
file.on('error', function(e) {
    console.log(e);
});
numbers.forEach(function(x) {
   file.write(x + '\n');
});
file.end();

console.log('done!')