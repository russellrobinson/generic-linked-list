/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

//
// this import works within the generic-linked-list project
//
import { LinkedList } from '..';
//
// use the following in a different project
//
//import { LinkedList } from 'generic-linked-list';

type Person = { name: string, age: number; parent?: Person };
const peopleList = new LinkedList<Person>();
peopleList.push(
  {name: 'John', age: 12, parent: {name: 'John', age: 42}},
  {name: 'Kylie', age: 14}
);
console.log(...peopleList);
console.log(peopleList.toString());
