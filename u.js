'use strict';

const empty = v => !!v;
const removeEmpty = array => array.filter(empty);
const promisedEach = fn => array => Promise.all(array.map(fn));

// injects function that allows to preview current state of data
// use as:
//  .then(inspect(value => {
//    // do whatever you want with data
//  }))
function inspect(fn) {
  return v => {
    fn((JSON.parse(JSON.stringify(v))));
    return v;
  };
};

Object.assign(module.exports, {
	empty,
  removeEmpty,
  promisedEach,
  inspect
});
