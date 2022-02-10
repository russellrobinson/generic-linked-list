/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

import { LinkedList } from '../linked-list';
import { argv } from 'process';

const params = argv.slice(2);   // skip node and script path
const sampleList = new LinkedList<string>(params);

console.log(`Your linked list is ${sampleList.length === 0 ? 'empty!' : [...sampleList]}`);

if (sampleList.length === 0) {
  console.log(`Try providing 1 or more parameters`);
}
