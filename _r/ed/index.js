"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline");
var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('First number: ', function (a) {
    rl.question('Second number: ', function (b) {
        console.log('Sum:', Number(a) + Number(b));
        rl.close();
    });
});
