/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

const LinkedList = require('..').LinkedList;

const sampleList = new LinkedList([0, 1, 2]);
console.log(`Your linked list is ${[...sampleList]}`);
