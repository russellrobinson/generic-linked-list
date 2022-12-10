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

The project focuses on backend development with NodeJs in mind. However, as it is written
in TypeScript (which compiles to JavaScript), you can use it in code targeting browsers.

## What's wrong with Arrays?

Arrays are a powerful and well-used data structure in both JavaScript and TypeScript.

However, some array operations are O(n) in Time Complexity. These include `shift` and `unshift`.

This means working with large datasets is usually faster with a Linked List compared to an Array.

## Time-space trade off

Linked lists are a classic time-space tradeoff when compared with arrays
for some operations.

Because a linked list has a "pointer" to the next element in the list,
each element in the list uses slightly more memory than the same list stored in an array.

But, that extra memory provides huge speed improvement for some
operations.

Most linked list operations are similar in speed to array.

### Operations faster than array
* shift
* unshift

_These operations are **many hundreds to thousands of times faster** than an array!_

If you're working with lists of 10's or 100's of thousands of elements, and you need these operations,
you should consider a linked list instead of an array for storing those elements.

### Operations slower than array

Some linked list operations are significantly slower than an array because the list must
be traversed from beginning to some point in the list (usually all the way to the end).

* slice
* at
* pop
* lastIndexOf
* fill

If your use case requires these operations on a large lists, then you should consider using
a different data structure (such as Array).

### Operations not implemented

The following operations cannot be implemented efficiently in a singly-linked list and
are not implemented.

These can be implemented in a doubly-linked list, and such a data strcuture is planned for a
future release of this package.

* reverse
* reduceRight

## Code size
The majority of the code in this package is contained in unit tests.

Code sizes:
* The compiled Typescript is 7 kilobytes when minified.
* The full JavaScript code including comments is around 40 kilobytes.
* The unit tests are around 120 kilobytes.

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

### Run the examples
Plain JavaScript:
```shell
$ node dist/examples/plainjs.js
A simple numeric list is [ 0, 1, 2 ]
```

Typescript (directly):
```shell
$ node dist/examples/example.js a b c
Your linked list is a,b,c

A list of numbers expanded using spread syntax [ 1, 2, 3 ]
The same list converted to a string [1,2,3]

Let's build a list of Person objects...
A list of people expanded using spread syntax { name: 'John', age: 12, parent: { name: 'John', age: 42 } } { name: 'Kylie', age: 14 }
The same list converted to a string {"name":"John","age":12,"parent":{"name":"John","age":42}},{"name":"Kylie","age":14}

Here's the array after converting the people list to an array:
[
  { name: 'John', age: 12, parent: { name: 'John', age: 42 } },
  { name: 'Kylie', age: 14 }
]
```

Typescript (compiled):
```shell
$ node dist/examples/example.js a b c
Your linked list is a,b,c
[ 1, 2, 3 ]
[1,2,3]
{ name: 'John', age: 12, parent: { name: 'John', age: 42 } } { name: 'Kylie', age: 14 }
{"name":"John","age":12,"parent":{"name":"John","age":42}},{"name":"Kylie","age":14}
[
  { name: 'John', age: 12, parent: { name: 'John', age: 42 } },
  { name: 'Kylie', age: 14 }
]
```

### TypeScript examples

#### Example 1

```typescript
import { LinkedList } from 'generic-linked-list';

const numList = new LinkedList([1, 2, 3]);
console.log(...numList);
console.log(numList.toString());
```

Expected output:

```text
[ 1, 2, 3 ]
[1,2,3]
```

#### Example 2

```typescript
import { LinkedList } from 'generic-linked-list';

type Person = { name: string, age: number; parent?: Person };
const peopleList = new LinkedList<Person>();
peopleList.push(
  {name: 'John', age: 12, parent: {name: 'John', age: 42}},
  {name: 'Kylie', age: 14}
);
console.log(...peopleList);
console.log(peopleList.toString());
```

Expected output:

```text
{ name: 'John', age: 12, parent: { name: 'John', age: 42 } } { name: 'Kylie', age: 14 }
{"name":"John","age":12,"parent":{"name":"John","age":42}},{"name":"Kylie","age":14}
```

#### Example 3 (plain JavaScript)

```javascript
const LinkedList = require('generic-linked-list').LinkedList;

const sampleList = new LinkedList([0, 1, 2]);
console.log(`Your linked list is ${[...sampleList]}`);
```

Expected output:

```text
Your linked list is 0,1,2
```

## Where to next?

The documentation is generated using [TypeDoc](https://www.npmjs.com/package/typedoc) using
comments in the source code.

The project's GitHub page contains the documentation and
is [the best place to start](https://russellrobinson.github.io/generic-linked-list/classes/linked_list.LinkedList.html).

## Example code

To access example code that actually runs:

- download the package;
- look in the `src/examples` folder.

## Version 2 Compatiblility
Version 2 aims to be even closer to a drop-in replacement for Array.

Version 2 implements additional constructor options to make LinkedList more similar to Array construction.
It also clarifies the semantics of the `from` method.

In particular, the constructor now implements both a length and an item list constructor.

### Version 2 Constructor
This means that the following code in Version 1:

```typescript
const list = new LinkedList<number>([1, 2]);
```
must be changed to:
```typescript
const list = new LinkedList<number>(...[1, 2]);
```
or
```typescript
const list = new LinkedList<number>(1, 2);
```

If you want to build a LinkedList from an array with the spread operator, use the `from` method:
```typescript
const list = LinkedList.from([1, 2]);
```

### Version 2 `from` method
`LinkedList.from` behaves differently to Array when called with non-array constructors.  See the
[documentation for Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#calling_from_on_non-array_constructors) about this.

## Version History

| Version    | Date        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2.0.0-rc10 | 10-Dec-2022 | Version 2 is mostly compatible with version 1, except for the following:<br/>* Constructor and `from` enhancements may require some refactoring of your existing version 1 code.<br/>* The `push` method also accepts an iterator.  `Array.push` does not support this. <br/>*  Added support for negative indexes in these methods:<ul><li>`at`<li>`indexOf`<li>`includes`<li>`slice`</ul><br/>* Added the following methods:<ul><li>`entries`<li>`flat`<li>`from`<li>`grow`<li>`join`<li>`keys`<li>`keysAsList`<li>`lastIndexOf`<li>`of`<li>`map`<li>`pop`<li>`reduce`<li>`splice`<li>`truncate`</ul> |
| 1.1.3      | 11-Nov-2022 | Documentation and test improvements.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 1.1.2      | 15-Oct-2022 | Added missing `index.ts` file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 1.1.1      | 15-Oct-2022 | Test improvements.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1.1.0      | 15-Oct-2022 | Added `slice` and `end` methods.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.0.3      | 22-Sep-2022 | Documentation and test improvements.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 1.0.1      | 17-Sep-2022 | Documentation improvements.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.0.0      | 17-Sep-2022 | First "official" release.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Node.js version

The project was developed in NodeJs version 14.15.4 and should run seamlessly in any later
version of Node.js.

## TypeScript version

The project was developed with TypeScript 4.5.5 and should compile seamlessly in any later
version of TypeScript.

## About the author

Russell Robinson is a Software Engineer with decades of experience across a range of industries.

He lives in Melbourne, Australia and can be contacted via email (russellr@openconcepts.com.au).

