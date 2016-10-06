'use strict';

console.log('init…');
setTimeout(() => {
  console.log('did finish!');
  process.exit(0);
}, 3000);
