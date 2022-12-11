/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

import { LinkedList } from '../linked-list';
import { argv } from 'process';

const params = argv.slice(2);   // skip node and script path
const sampleList = new LinkedList<string>(...params);

console.log(`Your linked list is ${sampleList.length === 0 ? 'empty!' : [...sampleList]}`);

if (sampleList.length === 0) {
  console.log(`Try providing 1 or more parameters`);
}
console.log(``);

const numList = new LinkedList([1, 2, 3]);
console.log(`A list of numbers expanded using spread syntax`, ...numList);
console.log(`The same list converted to a string`, numList.toString());

console.log(``);
console.log(`Let us build a list of Person objects...`);
type Person = { name: string, age: number; parent?: Person };
const peopleList = new LinkedList<Person>();
peopleList.push({name: 'John', age: 12, parent: {name :'John', age: 42}}, {name: 'Kylie', age: 14});

console.log(`A list of people expanded using spread syntax`,...peopleList);
console.log(`The same list converted to a string`,peopleList.toString());

console.log(``);
const peopleArray = [...peopleList];
console.log(`Here's the array after converting the people list to an array:`);
console.log(peopleArray);
