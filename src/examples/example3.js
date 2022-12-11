/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

//
// this import works within the generic-linked-list project
//
const LinkedList = require('..').LinkedList;
//
// use the following in a different project
//
//const LinkedList = require('generic-linked-list').LinkedList;

const sampleList = new LinkedList([0, 1, 2]);
console.log(`Your linked list is ${[...sampleList]}`);
