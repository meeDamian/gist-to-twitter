'use strict';

const empty = v => !!v;
const promisedEach = fn => array => Promise.all(array.map(fn));

function removeEmpty(array) {
  array = array.filter(empty);

  if (array.length === 0) {
    throw new Error('done');
  }

  return array;
}

function propsEqual(a, b, ...props) {
  return props.filter(p => {
    const A = a[p], B = b[p];

    // both are false-y
    if (!A && !B) {
      return false;
    }

    // one is empty
    if (!A || !B) {
      return true;
    }

    return A.toLowerCase().trim() !== B.toLowerCase().trim();
  }).length === 0;
}

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
}


Object.assign(module.exports, {
	empty,
  removeEmpty,
  promisedEach,
  propsEqual,
  inspect
});
