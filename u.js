'use strict';

function removeEmpty(array) {
  array = array.filter(empty);

  if (array.length === 0) {
    throw new Error('done');
  }

  return array;
}


Object.assign(module.exports, {
	empty: v => !!v,
  removeEmpty
});
