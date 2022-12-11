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

const numList = new LinkedList([1, 2, 3]);
console.log(...numList);
console.log(numList.toString());
