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

const numList = new LinkedList([1, 2, 3]);
console.log(...numList);
console.log(numList.toString());

type Person = { name: string, age: number; parent?: Person };
const peopleList = new LinkedList<Person>();
peopleList.push({name: 'John', age: 12, parent: {name :'John', age: 42}}, {name: 'Kylie', age: 14});
console.log(...peopleList);
console.log(peopleList.toString());

// convert to an array
const peopleArray = [...peopleList];
console.log(peopleArray);
console.log(new Array('x', 'y'));
