import * as readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('First number: ', a => {
  rl.question('Second number: ', b => {
    console.log('Sum:', Number(a) + Number(b));
    rl.close();
  });
});