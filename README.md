# Single-Linked List Using Generics

## About
This project implements a Single-Linked List that you can use for a linked list of any data type.

The motivations for this project are:

- to provide a _mostly_ drop-in replacement for Arrays (see below);
- that works with any data type;
- written in a strongly-typed language (TypeScript);
- that is well-documented;
- and is well-tested;
- and is suitable for professional Software Engineering projects.

The project focuses on backend development with NodeJs in mind.  However, as it is written
in TypeScript (which compiles to JavaScript), you can use it in code targeting browsers.

## What's wrong with Arrays?

Arrays are a powerful and well-used data structure in both JavaScript and TypeScript.

However, some operations are O(n) in Time Complexity.  These include shift and unshift.

This means working with large datasets is faster with a Linked List compared to an Array.

## Getting started
1. Import the library.
2. Create your linked list.
3. Use it!

### Add to your project

With `yarn`:
```shell
yarn add generic-linked-list --save
```

With `npm`:
```shell
npm --save-prod i generic-linked-list
```

### Typescript Examples 

#### Example 1
```
import { LinkedList } from 'generic-linked-list';

const numList = new LinkedList([1, 2, 3]);
console.log(...numList);
console.log(numList.toString());
```
Expected output:
```
1 2 3
1,2,3
```

#### Example 2
```
import { LinkedList } from 'generic-linked-list';

type Person = { name: string, age: number; parent?: Person };
const peopleList = new LinkedList<Person>();
peopleList.push(
  {name: 'John', age: 12, parent: {name :'John', age: 42}},
  {name: 'Kylie', age: 14}
);
console.log(...peopleList);
console.log(peopleList.toString());
```

Expected output:
```
{ name: 'John', age: 12, parent: { name: 'John', age: 42 } } { name: 'Kylie', age: 14 }
{"name":"John","age":12,"parent":{"name":"John","age":42}},{"name":"Kylie","age":14}
```

## Where to next?

The documentation is generated using [TypeDoc](https://www.npmjs.com/package/typedoc) using
comments in the source code.

My github page contains the documentation and is [the best place to start](https://russellrobinson.github.io/generic-linked-list/classes/linked_list.LinkedList.html).

## Example code
To access example code that actually runs:

- download the package;
- look in the `src/examples` folder.

## Node.js version
The project was developed in NodeJs version 14.15.4 and should run seamlessly in any later
version of Node.js.

## TypeScript version
The project was developed with TypeScript 4.5.5 and should compile seamlessly in any later
version of TypeScript.

## About the author
Russell Robinson is a Software Engineer with decades of experience across a range of industries.

He lives in Melbourne, Australia, and can be contacted by email.

