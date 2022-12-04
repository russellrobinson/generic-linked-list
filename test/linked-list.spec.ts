/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

import { expect } from 'chai';
import { hrtime } from 'process';
import { LinkedList, RecursiveLinkedList } from '../src';
import * as _ from 'lodash';

function forceGC() {
  if (global.gc) {
    global.gc();
  } else {
    console.error('cannot forceGC');
    process.exit(1);
  }
}

describe('linked-list', () => {

  function toMega(amount: number): number {
    return amount / 1024 / 1024;
  }

  function toMilli(amount: number): number {
    return amount / 1_000_000;
  }

  describe('LinkedList', () => {
    type makeFn<T> = (count: number) => T;
    const returnCount: makeFn<number> = (count: number) => count;

    function unshiftArray<T>(count: number, makeValue: (count: number) => T, arr: T[] = []): T[] {
      for (let ii = 0; ii < count; ii++) {
        arr.unshift(makeValue(ii));
      }
      return arr;
    }

    function pushArray<T>(count: number, makeValue: (count: number) => T, arr: T[] = []): T[] {
      for (let ii = 0; ii < count; ii++) {
        arr.push(makeValue(ii));
      }
      return arr;
    }

    function pushList<T>(count: number, makeValue: (count: number) => T, list = new LinkedList<T>()): LinkedList<T> {
      for (let ii = 0; ii < count; ii++) {
        list.push(makeValue(ii));
      }
      return list;
    }

    function unshiftList<T>(count: number, makeValue: (count: number) => T, list = new LinkedList<T>()): LinkedList<T> {
      for (let ii = count; --ii >= 0;) {
        list.unshift(makeValue(ii));
      }
      return list;
    }

    /**
     * Check that linked list a equals linked list b
     * @param a
     * @param b
     */
    function expectEqual<T>(a: LinkedList<T>, b: LinkedList<T>): boolean {
      let result = false;

      if (a.length === b.length) {
        const aIter = a[Symbol.iterator]();
        const bIter = b[Symbol.iterator]();
        let aNext, bNext;

        do {
          aNext = aIter.next();
          bNext = bIter.next();

          expect(aNext.done).to.equal(bNext.done);
          if (!aNext.done) {
            expect(aNext.value).to.deep.equal(bNext.value);
          }
        } while (!aNext.done);
      }
      return result;
    }

    type Obj = { a: number, b: number | string };

    class TestClass {
      private readonly _arr: Obj[];
      private readonly _list: LinkedList<Obj>;

      constructor() {
        this._arr = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        this._list = LinkedList.from(this._arr);
      }

      match(value: Obj, index: number): boolean {
        return value.a === 2 && index > 1;
      }

      matchAll(value: Obj, index: number): boolean {
        return _.isNumber(value.b) || index === 3;
      }

      matchSome(value: Obj): boolean {
        return value.a === 2;
      }

      get arr(): Obj[] {
        return this._arr;
      }

      get list(): LinkedList<Obj> {
        return this._list;
      }
    }

    describe('constructor', () => {
      it('instantiates with no parameters', () => {
        const list = new LinkedList<number>();

        expect(list.length).to.equal(0);
        expect(list.shift()).to.be.undefined;
      });
      it('instantiates with item list', () => {
        const list = new LinkedList<number>(1, 2, 3);

        expect(list.length).to.equal(3);
        expect(list.shift()).to.equal(1);
        expect(list.shift()).to.equal(2);
        expect(list.shift()).to.equal(3);
      });
      it('instantiates with spread operator', () => {
        const list = new LinkedList<number>(...[1, 2, 3]);

        expect(list.length).to.equal(3);
        expect(list.shift()).to.equal(1);
        expect(list.shift()).to.equal(2);
        expect(list.shift()).to.equal(3);
      });
      describe('instantiates arrays as-is', () => {
        it('works with a single value', () => {
          const list = new LinkedList<number[]>([1, 2, 3]);

          expect(list.length).to.equal(1);
          expect(list.shift()).to.deep.equal([1, 2, 3]);
        });
        it('works with multiple values', () => {
          const list = new LinkedList<number[]>([1, 2, 3], [4, 5, 6], [0, 1]);

          expect(list.length).to.equal(3);
          expect(list.shift()).to.deep.equal([1, 2, 3]);
          expect(list.shift()).to.deep.equal([4, 5, 6]);
          expect(list.shift()).to.deep.equal([0, 1]);
        });
      });
      it('instantiates with length', () => {
        const list = new LinkedList<number | undefined>(3);

        expect(list.length).to.equal(3);
        //
        // note that we don't distinguish between undefined and empty value
        //
        expect(list.shift()).to.equal(undefined);
        expect(list.shift()).to.equal(undefined);
        expect(list.shift()).to.equal(undefined);
      });
      it('instantiates with iterator', () => {
        const list = new LinkedList<number>([1, 2, 3][Symbol.iterator]());

        expect(list.length).to.equal(3);
        expect(list.shift()).to.equal(1);
        expect(list.shift()).to.equal(2);
        expect(list.shift()).to.equal(3);
      });
      it('instantiates with another LinkedList', () => {
        const list1 = new LinkedList<number>(1, 2, 3);
        const list2 = new LinkedList<number>(list1);

        expect(list2.length).to.equal(3);
        expect(list2.shift()).to.equal(1);
        expect(list2.shift()).to.equal(2);
        expect(list2.shift()).to.equal(3);
      });
      describe('unusual lengths', () => {
        const MAX_LENGTH = (2 ** 32) - 1;

        it('-ve is not a length', () => {
          const list = new LinkedList<number>(-1);

          expect(list.length).to.equal(1);
          expect(list.shift()).to.equal(-1);
        });
        it('greater than max is a single element', () => {
          const list = new LinkedList<number>(MAX_LENGTH + 1);

          expect(list.length).to.equal(1);
          expect(list.shift()).to.equal(MAX_LENGTH + 1);
        });
      });
    });

    describe('from', () => {
      it('works with a string', () => {
        const arr = Array.from('fob');

        expect(arr.length).to.equal(3);
        expect(arr[0]).to.equal('f');
        expect(arr[1]).to.equal('o');
        expect(arr[2]).to.equal('b');

        const list = LinkedList.from('fob');

        expect(list.length).to.equal(3);
        expect(list.at(0)).to.equal('f');
        expect(list.at(1)).to.equal('o');
        expect(list.at(2)).to.equal('b');
      });
      it('works with variable args', () => {
        function makeArray(...args) {
          return Array.from(args);
        }

        const arr = makeArray(1, 2, 3);

        expect(arr.length).to.equal(3);
        expect(arr[0]).to.equal(1);
        expect(arr[1]).to.equal(2);
        expect(arr[2]).to.equal(3);

        function makeList(...args) {
          return LinkedList.from(args);
        }

        const list = makeList(1, 2, 3);

        expect(list.length).to.equal(3);
        expect(list.at(0)).to.equal(1);
        expect(list.at(1)).to.equal(2);
        expect(list.at(2)).to.equal(3);
      });
      it('works with an array of strings', () => {
        const arr = Array.from(['a', 'b', 'c']);

        expect(arr.length).to.equal(3);
        expect(arr[0]).to.equal('a');
        expect(arr[1]).to.equal('b');
        expect(arr[2]).to.equal('c');

        const list = LinkedList.from(['a', 'b', 'c']);

        expect(list.length).to.equal(3);
        expect(list.at(0)).to.equal('a');
        expect(list.at(1)).to.equal('b');
        expect(list.at(2)).to.equal('c');
      });
      it('works with an array', () => {
        const list = LinkedList.from([1, 2, 3]);

        expect(list.length).to.equal(3);
        expect(list.at(0)).to.equal(1);
        expect(list.at(1)).to.equal(2);
        expect(list.at(2)).to.equal(3);
      });
      it('works with a sequence generator', () => {
        const arrayRange = (start, stop, step) =>
          Array.from({length: (stop - start) / step + 1}, (_, i) => start + i * step);

        const arr = arrayRange(0, 4, 1);

        expect(arr.length).to.equal(5);
        expect(arr[0]).to.equal(0);
        expect(arr[1]).to.equal(1);
        expect(arr[2]).to.equal(2);
        expect(arr[3]).to.equal(3);
        expect(arr[4]).to.equal(4);

        const listRange = (start, stop, step) =>
          LinkedList.from({length: (stop - start) / step + 1}, (_, i) => start + i * step);

        const list = listRange(0, 4, 1);

        expect(list.length).to.equal(5);
        expect(list.at(0)).to.equal(0);
        expect(list.at(1)).to.equal(1);
        expect(list.at(2)).to.equal(2);
        expect(list.at(3)).to.equal(3);
        expect(list.at(4)).to.equal(4);
      });

      describe('other iterables', () => {
        it('works with Set', () => {
          const fixture = new Set(['a', 'b', 'c', 'b']);
          const list = LinkedList.from(fixture);

          expect(list.length).to.equal(3);
          expect(list.at(0)).to.equal('a');
          expect(list.at(1)).to.equal('b');
          expect(list.at(2)).to.equal('c');
        });
        it('works with Map', () => {
          const fixture = new Map([[1, 'a'], [2, 'b'], [4, 'c'], [0, 'b']]);
          const insertionOrder = Array.from(fixture.values());

          expect(insertionOrder[0]).to.equal('a');
          expect(insertionOrder[1]).to.equal('b');
          expect(insertionOrder[2]).to.equal('c');
          expect(insertionOrder[3]).to.equal('b');
          //
          // note that "values" returns in insertion order, not key order (see above check)
          //
          const list = LinkedList.from(fixture.values());

          expect(list.length).to.equal(4);
          expect(list.at(0)).to.equal('a');
          expect(list.at(1)).to.equal('b');
          expect(list.at(2)).to.equal('c');
          expect(list.at(3)).to.equal('b');
        });
      });
      describe('map function', () => {
        it('works with a string', () => {
          const list = LinkedList.from('fob', (s: string) => s.toUpperCase());

          expect(list.length).to.equal(3);
          expect(list.at(0)).to.equal('F');
          expect(list.at(1)).to.equal('O');
          expect(list.at(2)).to.equal('B');
        });

        it('maps values', () => {
          const fixture = ['a', 'b', 'c'];
          const list = LinkedList.from([2, 1, 0], (index) => fixture[index]);

          expect(list.length).to.equal(3);
          expect(list.at(0)).to.equal('c');
          expect(list.at(1)).to.equal('b');
          expect(list.at(2)).to.equal('a');
        });
        it('passes the optional thisArg', () => {
          class Mapper {
            private _fixture = ['a', 'b', 'c'];

            public doMap(index: number): string {
              return this._fixture[index];
            }
          }

          const mapper = new Mapper();

          const list = LinkedList.from([2, 1, 0], function (this: Mapper, index) {
            return this.doMap(index);
          }, mapper);

          expect(list.length).to.equal(3);
          expect(list.at(0)).to.equal('c');
          expect(list.at(1)).to.equal('b');
          expect(list.at(2)).to.equal('a');
        });
      });
      describe('calling from() on non-array constructors', () => {
        it('shows how Array.from behaves', () => {
          function NotArray(/*len*/) {
            //console.log("NotArray called with length", len);
          }

          // Iterable
          expect(Array.from.call(NotArray, new Set(["foo", "bar", "baz"]))).to.deep.equal({
            '0': 'foo', '1': 'bar', '2': 'baz', length: 3
          });
          // Array-like
          expect(Array.from.call(NotArray, {length: 1, 0: "foo"})).to.deep.equal({
            '0': 'foo', length: 1
          });
          expect(Array.from.call({}, {length: 1, 0: "foo"})).to.deep.equal(['foo']);
        });
        //
        // So, the Array behaviour is documented here:
        //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#calling_from_on_non-array_constructors
        // Frankly, I have no idea why this behaviour in Array makes sense.
        // But I *think* the different behaviour in LinkedList is at least logical.  That is,
        // an iterable or array-like has been passed in so we use it.
        //
        it('does not behave like Array with random functions', () => {
          function NotList(/*len*/) {
            //console.log("NotList called with length", len);
          }

          // Iterable
          const list1 = LinkedList.from.call(NotList, new Set(["foo", "bar", "baz"]));
          expect(list1.length).to.equal(3);
          expect(list1.at(0)).to.equal('foo');
          expect(list1.at(1)).to.equal('bar');
          expect(list1.at(2)).to.equal('baz');

          // Array-like
          const list2 = LinkedList.from.call(NotList, {length: 1, 0: "foo"});
          expect(list2.length).to.equal(1);
          expect(list2.at(0)).to.equal('foo');

          const list3 = LinkedList.from.call({}, {length: 1, 0: "foo"});
          expect(list3.length).to.equal(1);
          expect(list3.at(0)).to.equal('foo');
        });
        it('does behave like Array with an object', () => {
          expect(Array.from.call({}, {length: 1, 0: "foo"})).to.deep.equal(['foo']);
          const list = LinkedList.from.call({}, {length: 1, 0: "foo"});
          expect(list.length).to.equal(1);
          expect(list.at(0)).to.equal('foo');
        });
      });
    });

    describe('isLinkedList', () => {
      it('detects LinkedList', () => {
        const list1 = new LinkedList<number>();

        expect(LinkedList.isLinkedList(list1)).to.be.true;
        expect(LinkedList.isLinkedList(4)).to.be.false;
        expect(LinkedList.isLinkedList([])).to.be.false;
      });
    });

    describe('join', () => {
      it('it works with LinkedList', () => {
        const list = LinkedList.of<string | number>(1, 2, 3, -42, 'hello');

        expect(list.join()).to.equal('1,2,3,-42,hello');
      });
      it('accepts a separator', () => {
        const list = LinkedList.of<string | number>(1, 2, 3, -42, 'hello');

        expect(list.join('=!=')).to.equal('1=!=2=!=3=!=-42=!=hello');
      });
      it('accepts an empty string separator', () => {
        const list = LinkedList.of<string | number>(1, 2, 3, -42, 'hello');

        expect(list.join('')).to.equal('123-42hello');
      });
      it('undefined values produce empty string', () => {
        const list = LinkedList.of<number | string | undefined>(1, undefined, 2, 3, -42, 'hello');

        expect(list.join('')).to.equal('123-42hello');
      });
    });

    describe('toString', () => {
      it('it works with LinkedList', () => {
        const list = LinkedList.of<string | number>(1, 2, 3, -42, 'hello');

        expect(list.toString()).to.equal('1,2,3,-42,"hello"');
      });
    });

    describe('keys', () => {
      it('works just like Array', () => {
        const fixture = [0, 1, 2];
        const arr = ['a', 'b', 'c'];
        expect(arr.length).to.equal(3);

        let index = 0;

        for (let value of arr.keys()) {
          expect(value).to.equal(fixture[index++]);
        }
        expect(index).to.equal(fixture.length);

        const list = new LinkedList(...arr);
        expect(list.length).to.equal(3);

        index = 0;
        for (let value of list.keys()) {
          expect(value).to.equal(fixture[index++]);
        }
        expect(index).to.equal(fixture.length);
      });
    });

    describe('keysAsList', () => {
      it('returns a LinkedList of indexes', () => {
        const fixture = [0, 1, 2];
        const list = new LinkedList('a', 'b', 'c');
        expect(list.length).to.equal(3);

        const keys = list.keysAsList();
        expect(LinkedList.isLinkedList(keys)).to.be.true;
        expect(keys.length).to.equal(fixture.length);

        let index = 0;

        for (let value of fixture) {
          expect(value).to.equal(keys.at(index++));
        }
        expect(index).to.equal(fixture.length);
      });
    });

    describe('of', () => {
      it('accepts no arguments', () => {
        const arr = Array.of();
        expect(arr.length).to.equal(0);

        const list = LinkedList.of();

        expect(list.length).to.equal(0);
      });
      it('accepts variable arguments', () => {
        const arr = Array.of(1, 2, 3);
        expect(arr.length).to.equal(3);

        const list = LinkedList.of(1, 2, 3);

        expect(list.length).to.equal(3);
        expect(list.at(0)).to.equal(1);
        expect(list.at(1)).to.equal(2);
        expect(list.at(2)).to.equal(3);
      });
      it('accepts defined argument type', () => {
        const arr = Array.of<number | string>(1, 2, 3, 'a');
        expect(arr.length).to.equal(4);

        const list = LinkedList.of<number | string>(1, 2, 3, 'a');

        expect(list.length).to.equal(4);
        expect(list.at(0)).to.equal(1);
        expect(list.at(1)).to.equal(2);
        expect(list.at(2)).to.equal(3);
        expect(list.at(3)).to.equal('a');
      });
      it('accepts undefined as a value', () => {
        const arr = Array.of(undefined);
        expect(arr.length).to.equal(1);

        const list = LinkedList.of(undefined);

        expect(list.length).to.equal(1);
        expect(list.at(0)).to.equal(undefined);
      });
    });

    describe('pop', () => {
      it('pops just like Array', () => {
        const fixture = ['a', 'b', 'c', 'd'];

        const arr = Array(...fixture);
        expect(arr.length).to.equal(4);
        expect(arr.pop()).to.equal('d');
        expect(arr.length).to.equal(3);

        const list = new LinkedList(...fixture);
        expect(list.length).to.equal(4);
        expect(list.pop()).to.equal('d');
        expect(list.length).to.equal(3);
      });
      it('works on an empty list', () => {
        const fixture = [];

        const arr = Array(...fixture);
        expect(arr.length).to.equal(0);
        expect(arr.pop()).to.equal(undefined);
        expect(arr.length).to.equal(0);

        const list = new LinkedList(...fixture);
        expect(list.length).to.equal(0);
        expect(list.pop()).to.equal(undefined);
        expect(list.length).to.equal(0);
      });
      it('works on singleton list', () => {
        const fixture = ['a'];

        const arr = Array(...fixture);
        expect(arr.length).to.equal(1);
        expect(arr.pop()).to.equal('a');
        expect(arr.length).to.equal(0);

        const list = new LinkedList(...fixture);
        expect(list.length).to.equal(1);
        expect(list.pop()).to.equal('a');
        expect(list.length).to.equal(0);
      });
      it('works on a large list', () => {
        const SIZE = 1_000;
        const fixture = Array(SIZE);
        const VALUE = 'x';
        fixture.fill(VALUE);

        const arr = Array(...fixture);
        expect(arr.length).to.equal(SIZE);
        while (arr.length > 0) {
          expect(arr.pop()).to.equal(VALUE);
        }
        expect(arr.pop()).to.equal(undefined);

        const list = new LinkedList(...fixture);
        expect(list.length).to.equal(SIZE);
        while (list.length > 0) {
          expect(list.pop()).to.equal(VALUE);
        }
        expect(list.pop()).to.equal(undefined);
      });
    });

    describe('push', () => {
      it('returns the new length', () => {
        const list = new LinkedList<number>();

        expect(list.push(42)).to.equal(1);
        expect(list.push(42)).to.equal(2);
      });
      it('appends and retrieves', () => {
        const count = 10_000;
        const list = pushList(count, returnCount);

        expect(list.length).to.equal(count);
        for (let ii = 0; ii < count; ii++) {
          expect(list.shift()).to.equal(ii);
        }
        expect(list.length).to.equal(0);
        expect(list.shift()).to.be.undefined;
      });
      it('accepts multiple parameters', () => {
        const list = new LinkedList<number>();
        const arr: number[] = [];

        const count = list.push(1, 2, 3, 4);
        arr.push(1, 2, 3, 4);

        expect(list.length).to.equal(count);
        for (let ii = 0; ii < count; ii++) {
          const listValue = list.shift();
          const arrValue = arr.shift();
          expect(listValue).to.equal(ii + 1);
          expect(listValue).to.equal(arrValue);
        }
        expect(list.length).to.equal(0);
        expect(list.shift()).to.be.undefined;
      });
      it('allows no parameters, just like Array', () => {
        const arr: number[] = [];
        const list = new LinkedList<number>();

        expect(arr.push()).to.equal(0);
        expect(list.push()).to.equal(0);
      });
      describe('iterator', () => {
        it('accepts an iterator', () => {
          const setFixture = new Set([1, 2, 3, 1]);
          const list = new LinkedList<number>();

          const result = list.push(setFixture.values());
          expect(result).to.equal(3);
          expect(list.at(0)).to.equal(1);
          expect(list.at(1)).to.equal(2);
          expect(list.at(2)).to.equal(3);
        });
      });
    });
    describe('unshift', () => {
      it('returns the new length', () => {
        const list = new LinkedList<number>();

        expect(list.unshift(42)).to.equal(1);
        expect(list.unshift(42)).to.equal(2);
      });

      it('inserts and retrieves', () => {
        const count = 10_000;
        const list = unshiftList(count, returnCount);

        expect(list.length).to.equal(count);
        for (let ii = 0; ii < count; ii++) {
          expect(list.shift()).to.equal(ii);
        }
        expect(list.length).to.equal(0);
        expect(list.shift()).to.be.undefined;
      });
      it('accepts multiple parameters', () => {
        const list = new LinkedList<number>();
        const arr: number[] = [];

        const count = list.unshift(1, 2, 3, 4);
        arr.unshift(1, 2, 3, 4);

        expect(list.length).to.equal(count);
        for (let ii = 0; ii < count; ii++) {
          const listValue = list.shift();
          const arrValue = arr.shift();
          expect(listValue).to.equal(ii + 1);
          expect(listValue).to.equal(arrValue);
        }
        expect(list.length).to.equal(0);
        expect(list.shift()).to.be.undefined;
      });
      it('allows no parameters, just like Array', () => {
        const arr: number[] = [];
        const list = new LinkedList<number>();

        expect(arr.unshift()).to.equal(0);
        expect(list.unshift()).to.equal(0);
      });
    });

    describe('iteration', () => {
      it('has an iterator interface', () => {
        const count = 10_000;
        const list = unshiftList(count, returnCount);
        let index = 0;

        for (let value of list) {
          expect(value).to.equal(index++);
        }
        expect(index).to.equal(count);
      });
      it('obeys the iterator protocol', () => {
        const count = 10_000;
        const list = unshiftList(count, returnCount);
        let it = list[Symbol.iterator]();
        let next;
        let index = 0;

        do {
          next = it.next();
          if (!next.done) {
            expect(next.value).to.equal(index++);
          }
        } while (!next.done);
        expect(next.value).to.be.undefined;
        expect(index).to.equal(count);
      });
      it('provides an iterableiterator, just like Array', () => {
        const count = 10_000;
        const arr = pushArray(count, returnCount);
        const list = pushList(count, returnCount);

        const arrIter: IterableIterator<number> = arr[Symbol.iterator]();
        const listIter: IterableIterator<number> = list[Symbol.iterator]();
        //
        // When you create an iterator from an iterator, this just duplicates the iterator.
        // This seems illogical to me, but that's what it does in Array.
        //
        expect(arrIter[Symbol.iterator]()).to.equal(arrIter);
        expect(listIter[Symbol.iterator]()).to.equal(listIter);
      });
      it('works with nested iterators, just like Array', () => {
        const count = 100;
        const arr = pushArray(count, returnCount);
        let index = 0;

        for (const value1 of arr) {
          expect(value1).to.equal(index++);
          let position = index;
          for (const value2 of arr) {
            if (--position === 0) {
              expect(value2).to.equal(value1);
            } else {
              expect(value2).to.not.equal(value1);
            }
          }
        }
        expect(index).to.equal(count);
      });
      it('can convert to an array', () => {
        const count = 10_000;
        const list = unshiftList(count, returnCount);
        const arr = Array.from(list);

        expect(arr.length).to.equal(count);
        let index = 0;
        for (const value of list) {
          expect(value).to.equal(arr[index++]);
        }
        expect(index).to.equal(count);
      });
      it('works with the spread operator', () => {
        const count = 10_000;
        const list = unshiftList(count, returnCount);
        const arr = [...list];

        expect(arr.length).to.equal(count);
        let index = 0;
        for (const value of list) {
          expect(value).to.equal(arr[index++]);
        }
        expect(index).to.equal(count);
      });
      it('does not leak memory', () => {
        const count = 50_000;
        const returnObj: makeFn<Record<string, unknown>> = (count: number) => {
          return {
            theCount: count,
            asString: `${count}`,
            hello: 'world'
          };
        };
        const list = unshiftList(count, returnObj);
        const startMemoryUsed = process.memoryUsage().heapUsed;

        for (let ii = 0; ii < 30; ii++) {
          for (const value of list) {
            expect(value).to.exist;
          }
        }
        const endMemoryUsed = process.memoryUsage().heapUsed;
        expect(endMemoryUsed).to.be.lessThan(startMemoryUsed * 1.2);
      });
      it('instantiates with an existing list', () => {
        const count = 10_000;
        const origList = pushList(count, returnCount);
        const dupList = new LinkedList<number>(origList);

        expect(dupList.length).to.equal(origList.length);
        expect(dupList === origList).to.be.false;         // not a reference to the original

        let origIter = origList[Symbol.iterator]();
        let dupIter = dupList[Symbol.iterator]();
        let origNext;
        let dupNext;

        do {
          origNext = origIter.next();
          dupNext = dupIter.next();
          expect(origNext.done).to.equal(dupNext.done);
          if (!origNext.done) {
            expect(origNext.value).to.equal(dupNext.value);
          }
        } while (!origNext.done && !dupNext.done);
      });
    });

    describe('values', () => {
      it('works just like Array.values', () => {
        const fixture: number[] = [1, 2, 3, 4];
        const arr = new Array(...fixture);

        function compare(iter: IterableIterator<number>) {
          let index = 0;
          for (const value of iter) {
            expect(value).to.equal(fixture[index]);
            index++;
          }
          expect(index).to.equal(fixture.length);
        }

        compare(arr.values());

        const list = new LinkedList<number>(...fixture);
        compare(list.values());
      });
      it('creates a readonly iterator', () => {
        function isWritable<T extends Object>(obj: T, key: keyof T) {
          const desc = Object.getOwnPropertyDescriptor(obj, key) || {};
          return Boolean(desc.writable);
        }

        const fixture: number[] = [1, 2, 3, 4];
        const list = new LinkedList<number>(...fixture);
        const it = list.values();
        let next = it.next();

        while (!next.done) {
          expect(!isWritable(next, 'value'));
          next = it.next();
        }
      });
    });

    describe('entries', () => {
      it('works just like Array.entries', () => {
        const fixture: number[] = [1, 2, 3, 4];
        const arr = new Array(...fixture);

        let index = 0;
        for (const [itIndex, value] of arr.entries()) {
          expect(value).to.equal(fixture[index]);
          expect(itIndex).to.equal(index);
          index++;
        }
        expect(index).to.equal(fixture.length);


        const list = new LinkedList<number>(...fixture);
        index = 0;
        for (const [itIndex, value] of list.entries()) {
          expect(value).to.equal(list.at(index));
          expect(itIndex).to.equal(index);
          index++;
        }
        expect(index).to.equal(list.length);
      });
    });

    describe('at', () => {
      it('works like Array.at', () => {
        const fixture: number[] = [1, 2, 3, 4];
        const arr = new Array(...fixture);

        //
        // Earlier versions of node do not support the Array.at method.
        // For this check you need NodeJs 16.6.0 or above
        //
        if (typeof arr.at === 'function') {
          expect(arr.at(0)).to.equal(1);
          expect(arr.at(3)).to.equal(4);
          expect(arr.at(-1)).to.equal(4);
          expect(arr.at(4)).to.be.undefined;
          expect(arr.at(-4)).to.equal(1);
          expect(arr.at(-5)).to.be.undefined;
        }

        const list = new LinkedList<number>(...fixture);

        expect(list.at(0)).to.equal(1);
        expect(list.at(3)).to.equal(4);
        expect(list.at(-1)).to.equal(4);
        expect(list.at(4)).to.be.undefined;
        expect(list.at(-4)).to.equal(1);
        expect(list.at(-5)).to.be.undefined;
      });
    });

    describe('end', () => {
      it('returns the last element in a list', () => {
        const fixture: number[] = [1, 2, 3, 4];
        const list = new LinkedList<number>(...fixture);

        expect(list.end()).to.equal(4);
      });
      it('returns undefined if the list is empty', () => {
        const list = new LinkedList();

        expect(list.end()).to.be.undefined;
      });
    });

    describe('indexOf', () => {
      it('finds a matching element just like Array', () => {
        const fixture = [1, 2, 3, 4, 2];
        expect(fixture.indexOf(2)).to.equal(1);

        const list = new LinkedList<number>(...fixture);
        expect(list.indexOf(2)).to.equal(1);
      });
      describe('fromIndex', () => {
        it('works with +ve fromIndex', () => {
          const fixture = [1, 2, 3, 4, 2, 2];
          expect(fixture.indexOf(2, 3)).to.equal(4);
          expect(fixture.indexOf(2, fixture.length)).to.equal(-1);

          const list = new LinkedList<number>(...fixture);
          expect(list.indexOf(2, 3)).to.equal(4);
          expect(list.indexOf(2, list.length)).to.equal(-1);
        });
        it('works with -ve fromIndex', () => {
          const fixture = [1, 2, 3, 4, 2, 2];
          expect(fixture.indexOf(2, -3)).to.equal(4);
          expect(fixture.indexOf(2, -2)).to.equal(4);
          expect(fixture.indexOf(2, -1)).to.equal(5);
          expect(fixture.indexOf(2, -(fixture.length - 1))).to.equal(1);

          const list = new LinkedList<number>(...fixture);
          expect(list.indexOf(2, -3)).to.equal(4);
          expect(list.indexOf(2, -2)).to.equal(4);
          expect(list.indexOf(2, -1)).to.equal(5);
          expect(list.indexOf(2, -(list.length - 1))).to.equal(1);
        });
        it('large -ve fromIndex', () => {
          const fixture = [1, 2, 3, 4, 2, 2];
          expect(fixture.indexOf(2, -fixture.length - 1)).to.equal(1);

          const list = new LinkedList<number>(...fixture);
          expect(list.indexOf(2, -list.length - 1)).to.equal(1);
        });
      });
      it('returns -1 with no matching element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        expect(fixture.indexOf(5)).to.equal(-1);

        const list = new LinkedList<number>(...fixture);
        expect(list.indexOf(5)).to.equal(-1);
      });
      it('returns -1 with empty list just like Array', () => {
        // noinspection JSMismatchedCollectionQueryUpdate
        const arr: number[] = [];
        expect(arr.indexOf(1)).to.equal(-1);

        const list = new LinkedList<number>();
        expect(list.indexOf(1)).to.equal(-1);
      });
      it('uses strict equality just like Array', () => {
        //
        // strict equality doesn't work with objects - they must be the same object
        //
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        expect(fixture.indexOf({a: 2, b: 2})).to.equal(-1);

        const list = new LinkedList<Obj>(...fixture);
        expect(list.indexOf({a: 2, b: 2})).to.equal(-1);

        //
        // So, now we test with the actual object, and it works
        //
        expect(fixture.indexOf(fixture[1])).to.equal(1);
        expect(list.indexOf(fixture[1])).to.equal(1);
      });
      it('finds first matching only just like Array', () => {
        const fixture = [1, 2, 3, 4, 2];
        expect(fixture.indexOf(2)).to.equal(1);

        const list = new LinkedList<number>(...fixture);
        expect(list.indexOf(2)).to.equal(1);
      });
    });
    describe('lastIndexOf', () => {
      it('finds the correct element just like Array', () => {
        const fixture = [1, 2, 3, 4, 2];
        expect(fixture.lastIndexOf(2)).to.equal(4);

        const list = new LinkedList<number>(...fixture);
        expect(list.lastIndexOf(2)).to.equal(4);
      });
      describe('fromIndex', () => {
        it('works with +ve fromIndex', () => {
          const fixture = [1, 2, 3, 4, 2, 2];
          expect(fixture.lastIndexOf(2, 3)).to.equal(1);
          expect(fixture.lastIndexOf(2, fixture.length)).to.equal(5);

          const list = new LinkedList<number>(...fixture);
          expect(list.lastIndexOf(2, 3)).to.equal(1);
          expect(list.lastIndexOf(2, list.length)).to.equal(5);
        });
        it('works with -ve fromIndex', () => {
          const fixture = [1, 2, 3, 4, 2, 2];
          expect(fixture.lastIndexOf(2, -3)).to.equal(1);
          expect(fixture.lastIndexOf(2, -2)).to.equal(4);
          expect(fixture.lastIndexOf(2, -1)).to.equal(5);
          expect(fixture.lastIndexOf(1, -fixture.length)).to.equal(0);
          expect(fixture.lastIndexOf(2, -fixture.length)).to.equal(-1);
          expect(fixture.lastIndexOf(2, -(fixture.length + 1))).to.equal(-1);

          const list = new LinkedList<number>(...fixture);
          expect(list.lastIndexOf(2, -3)).to.equal(1);
          expect(list.lastIndexOf(2, -2)).to.equal(4);
          expect(list.lastIndexOf(2, -1)).to.equal(5);
          expect(list.lastIndexOf(1, -list.length)).to.equal(0);
          expect(list.lastIndexOf(2, -list.length)).to.equal(-1);
          expect(list.lastIndexOf(2, -(list.length + 1))).to.equal(-1);
        });
      });
      it('returns -1 with no matching element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        expect(fixture.lastIndexOf(5)).to.equal(-1);

        const list = new LinkedList<number>(...fixture);
        expect(list.lastIndexOf(5)).to.equal(-1);
      });
      it('returns -1 with empty list just like Array', () => {
        // noinspection JSMismatchedCollectionQueryUpdate
        const arr: number[] = [];
        expect(arr.lastIndexOf(1)).to.equal(-1);

        const list = new LinkedList<number>();
        expect(list.lastIndexOf(1)).to.equal(-1);
      });
      it('uses strict equality just like Array', () => {
        //
        // strict equality doesn't work with objects - they must be the same object
        //
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        expect(fixture.lastIndexOf({a: 2, b: 2})).to.equal(-1);

        const list = new LinkedList<Obj>(...fixture);
        expect(list.lastIndexOf({a: 2, b: 2})).to.equal(-1);

        //
        // So, now we test with the actual object, and it works
        //
        expect(fixture.lastIndexOf(fixture[1])).to.equal(1);
        expect(list.lastIndexOf(fixture[1])).to.equal(1);
      });
      it('finds last matching only just like Array', () => {
        const fixture = [1, 2, 3, 4, 2];
        expect(fixture.lastIndexOf(2)).to.equal(4);

        const list = new LinkedList<number>(...fixture);
        expect(list.lastIndexOf(2)).to.equal(4);
      });
    });
    describe('map', () => {
      it('maps lists just like Array', () => {
        const fixture = [1, 2, 3, 1];
        const callback = value => value * 2;

        expect(fixture.map(callback)).to.deep.equal([2, 4, 6, 2]);

        const list = new LinkedList<number>(...fixture);
        const result = list.map(callback);

        expect(result.length).to.equal(4);
        expect(result).to.not.equal(list);
        expect(result.at(0)).to.equal(2);
        expect(result.at(1)).to.equal(4);
        expect(result.at(2)).to.equal(6);
        expect(result.at(3)).to.equal(2);
      });
      it('provides an index parameter', () => {
        const fixture = ['a', 'b', 'c', 'd'];
        const callback = (value, index) => index;

        expect(fixture.map(callback)).to.deep.equal([0, 1, 2, 3]);

        const list = new LinkedList<string>(...fixture);
        const result = list.map(callback);

        expect(result.length).to.equal(4);
        expect(result).to.not.equal(list);
        expect(result.at(0)).to.equal(0);
        expect(result.at(1)).to.equal(1);
        expect(result.at(2)).to.equal(2);
        expect(result.at(3)).to.equal(3);
      });
      it('provides the list parameter', () => {
        const fixture = ['a', 'b', 'c', 'd'];
        const callback = (value, index, theList) => theList.at(index);
        const list = new LinkedList<string>(...fixture);
        const result = list.map(callback);

        expect(result.length).to.equal(4);
        expect(result).to.not.equal(list);
        expect(result.at(0)).to.equal(fixture[0]);
        expect(result.at(1)).to.equal(fixture[1]);
        expect(result.at(2)).to.equal(fixture[2]);
        expect(result.at(3)).to.equal(fixture[3]);
      });
      it('binds the thisArg', () => {
        class Mapper {
          doMap(index: number): number {
            return index * 2;
          }
        }

        const mapper = new Mapper();

        const fixture = ['a', 'b', 'c', 'd'];
        const list = new LinkedList<string>(...fixture);
        const result = list.map(function (this: Mapper, value, index) {
          return this.doMap(index);
        }, mapper);

        expect(result.length).to.equal(4);
        expect(result).to.not.equal(list);
        expect(result.at(0)).to.equal(0);
        expect(result.at(1)).to.equal(2);
        expect(result.at(2)).to.equal(4);
        expect(result.at(3)).to.equal(6);
      });
    });
    describe('concat', () => {
      it('concatenates just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const arrResult = fixture.concat(2);
        const expectedResultFixture = [1, 2, 3, 4, 2];
        expect(arrResult).to.deep.equal(expectedResultFixture);
        expect(arrResult === fixture).to.be.false;         // not a reference to the original

        const list = new LinkedList<number>(...fixture);
        const listResult = list.concat(2);
        const listResultExpected = new LinkedList<number>(expectedResultFixture);

        expectEqual(listResult, listResultExpected);
        expect(listResult === list).to.be.false;         // not a reference to the original
      });
      it('accepts no parameters just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const arrResult = fixture.concat();
        const expectedResultFixture = [1, 2, 3, 4];
        expect(arrResult).to.deep.equal(expectedResultFixture);
        expect(arrResult === fixture).to.be.false;         // not a reference to the original

        const list = new LinkedList<number>(...fixture);
        const listResult = list.concat();
        const listResultExpected = new LinkedList<number>(expectedResultFixture);

        expectEqual(listResult, listResultExpected);
        expect(listResult === list).to.be.false;         // not a reference to the original

      });
      it('accepts multiple parameters just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const arrResult = fixture.concat(5, 2, 1, NaN);
        const expectedResultFixture = [1, 2, 3, 4, 5, 2, 1, NaN];
        expect(arrResult).to.deep.equal(expectedResultFixture);
        expect(arrResult === fixture).to.be.false;         // not a reference to the original


        const list = new LinkedList<number>(...fixture);
        const listResult = list.concat(5, 2, 1, NaN);
        const listResultExpected = new LinkedList<number>(expectedResultFixture);

        expectEqual(listResult, listResultExpected);
        expect(listResult === list).to.be.false;         // not a reference to the original

      });
      it('accepts list parameters just like Array accepts arrays', () => {
        const fixture = [1, 2, 3, 4];
        const arrResult = fixture.concat(5, [2, 3], 1, [NaN, 0]);
        const expectedResultFixture = [1, 2, 3, 4, 5, 2, 3, 1, NaN, 0];
        expect(arrResult).to.deep.equal(expectedResultFixture);
        expect(arrResult === fixture).to.be.false;         // not a reference to the original

        const list = new LinkedList<number>(...fixture);
        const listResult = list.concat(5, new LinkedList(...[2, 3]), 1, new LinkedList(...[NaN, 0]));
        const listResultExpected = new LinkedList<number>(expectedResultFixture);

        expectEqual(listResult, listResultExpected);
        expect(listResult === list).to.be.false;         // not a reference to the original
      });
      it('performs shallow copy just like Array', () => {
        type LocalObj = Obj & { c?: { c1: number, c2: string } };      // extend Obj for this test
        const constObj1: LocalObj = {a: 1, b: 2, c: {c1: 1, c2: 'xx'}};
        let obj1: LocalObj = constObj1;
        const obj2: LocalObj = {a: 2, b: 2};
        const sameObj2Value: LocalObj = {a: 2, b: 2};
        const arr: LocalObj[] = [obj1, obj2];

        //
        // Establish what === does...
        //
        expect(arr[0] === obj1).to.be.true;
        expect(arr[0]).to.deep.equal(obj1);         // of course, because ===
        expect(arr[1] === obj2).to.be.true;
        expect(arr[1] === sameObj2Value).to.be.false;

        //
        // Array concat
        //
        const arrResult = arr.concat(obj1, obj2);
        expect(arrResult[2] === obj1).to.be.true;
        expect(arrResult[2]).to.deep.equal(obj1);         // of course, because ===
        expect(arrResult[2] === arrResult[0]).to.be.true;
        expect(arrResult[3] === obj2).to.be.true;
        expect(arrResult[3] === arrResult[1]).to.be.true;
        expect(arrResult[4] === sameObj2Value).to.be.false;

        //
        // Build and check list
        //
        const list: LinkedList<LocalObj> = new LinkedList<LocalObj>(...arr);
        expect(list.at(0) === obj1).to.be.true;
        expect(list.at(0)).to.deep.equal(obj1);         // of course, because ===
        expect(list.at(1) === obj2).to.be.true;
        expect(list.at(1) === sameObj2Value).to.be.false;

        //
        // Concatenate and check
        //
        const listResult = list.concat(obj1, obj2);
        expect(listResult.at(2) === obj1).to.be.true;
        expect(listResult.at(2)).to.deep.equal(obj1);         // of course, because ===
        expect(listResult.at(2) === listResult.at(0)).to.be.true;
        expect(listResult.at(3) === obj2).to.be.true;
        expect(listResult.at(3) === listResult.at(1)).to.be.true;
        expect(listResult.at(4) === sameObj2Value).to.be.false;

        //
        // Now change underlying object and confirm the copies changed
        //
        obj1 = {a: 42, b: 42};
        expect(arrResult[2] === obj1).to.be.false;               // they are now different objects
        expect(arrResult[2]).to.deep.equal(constObj1);           // but it points to the original object
        expect(listResult.at(2) === obj1).to.be.false;     // they are now different objects
        expect(listResult.at(2)).to.deep.equal(constObj1); // but it points to the original object
      });
    });
    describe('includes', () => {
      it('finds a matching element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        expect(fixture.includes(2)).to.be.true;

        const list = new LinkedList<number>(...fixture);
        expect(list.includes(2)).to.be.true;
      });
      describe('fromIndex', () => {
        it('works with +ve fromIndex just like Array', () => {
          const fixture = [1, 2, 3, 4, 2, 2];
          expect(fixture.includes(2, 3)).to.be.true;
          expect(fixture.includes(3, 3)).to.be.false;

          const list = new LinkedList<number>(...fixture);
          expect(list.includes(2, 3)).to.be.true;
          expect(fixture.includes(3, 3)).to.be.false;
        });
        it('works with -ve fromIndex just like Array', () => {
          const fixture = [1, 2, 3, 4, 2, 2];
          expect(fixture.includes(2, -3)).to.be.true;
          expect(fixture.includes(2, -2)).to.be.true;
          expect(fixture.includes(2, -1)).to.be.true;
          expect(fixture.includes(2, -(fixture.length + 1))).to.be.true;
          expect(fixture.includes(1, -fixture.length)).to.be.true;
          expect(fixture.includes(3, -4)).to.be.true;
          expect(fixture.includes(3, -3)).to.be.false;

          const list = new LinkedList<number>(...fixture);
          expect(list.includes(2, -3)).to.be.true;
          expect(list.includes(2, -2)).to.be.true;
          expect(list.includes(2, -1)).to.be.true;
          expect(list.includes(2, -(list.length + 1))).to.be.true;
          expect(list.includes(1, -list.length)).to.be.true;
          expect(list.includes(3, -4)).to.be.true;
          expect(list.includes(3, -3)).to.be.false;
        });
      });
      it('returns false with no matching element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        expect(fixture.includes(5)).to.be.false;

        const list = new LinkedList<number>(...fixture);
        expect(list.includes(5)).to.be.false;
      });
      it('returns false with empty list just like Array', () => {
        // noinspection JSMismatchedCollectionQueryUpdate
        const fixture: number[] = [];
        expect(fixture.includes(1)).to.be.false;

        const list = new LinkedList<number>();
        expect(list.includes(1)).to.be.false;
      });
      it('uses strict equality just like Array', () => {
        //
        // strict equality doesn't work with objects - they must be the same object
        //
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        expect(fixture.includes({a: 2, b: 2})).to.be.false;

        const list = new LinkedList<Obj>(...fixture);
        expect(list.includes({a: 2, b: 2})).to.be.false;

        //
        // So, now we test with the actual object, and it works
        //
        expect(fixture.includes(fixture[1])).to.be.true;
        expect(list.includes(fixture[1])).to.be.true;
      });
      it('finds NaN just like Array', () => {
        const fixture = [1, NaN, 3, 4, 2];
        expect(fixture.includes(NaN)).to.be.true;

        const list = new LinkedList<number>(...fixture);
        expect(list.includes(NaN)).to.be.true;
      });
      it('finds no NaN just like Array', () => {
        const fixture = [1, 3, 4, 2];
        expect(fixture.includes(NaN)).to.be.false;

        const list = new LinkedList<number>(...fixture);
        expect(list.includes(NaN)).to.be.false;
      });
      it('finds undefined just like Array', () => {
        const fixture = [1, undefined, 3, 4, 2];
        expect(fixture.includes(undefined)).to.be.true;

        const list = new LinkedList<unknown>(...fixture);
        expect(list.includes(undefined)).to.be.true;
      });
      it('finds null just like Array', () => {
        const fixture = [1, null, 3, 4, 2];
        expect(fixture.includes(null)).to.be.true;

        const list = new LinkedList<unknown>(...fixture);
        expect(list.includes(null)).to.be.true;
      });
    });
    describe('find & findIndex', () => {
      it('finds a matching element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const pred = value => value === 2;

        expect(fixture.find(pred)).to.equal(2);
        expect(fixture.findIndex(pred)).to.equal(1);

        const list = new LinkedList<number>(...fixture);

        expect(list.find(pred)).to.equal(2);
        expect(list.findIndex(pred)).to.equal(1);
      });
      it('returns undefined with no matching element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const pred = value => value === 5;

        expect(fixture.find(pred)).to.be.undefined;
        expect(fixture.findIndex(pred)).to.equal(-1);

        const list = new LinkedList<number>(...fixture);

        expect(list.find(pred)).to.be.undefined;
        expect(list.findIndex(pred)).to.equal(-1);
      });
      it('finds first matching only just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = value => value.a === 2;

        expect(fixture.find(pred)).to.deep.equal({a: 2, b: 2});
        expect(fixture.findIndex(pred)).to.equal(1);

        const list = new LinkedList<Obj>(...fixture);

        expect(list.find(pred)).to.deep.equal({a: 2, b: 2});
        expect(list.findIndex(pred)).to.equal(1);
      });
      it('provides an index parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => value.a === 2 && index > 1;

        expect(fixture.find(pred)).to.deep.equal({a: 2, b: 'x'});
        expect(fixture.findIndex(pred)).to.equal(3);

        const list = new LinkedList<Obj>(...fixture);

        expect(list.find(pred)).to.deep.equal({a: 2, b: 'x'});
        expect(list.findIndex(pred)).to.equal(3);
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const arrPred = (value, index, theArray) => value.a === 2 && theArray[index].b === 'x';

        expect(fixture.find(arrPred)).to.deep.equal({
          a: 2,
          b: 'x'
        });
        expect(fixture.findIndex(arrPred)).to.equal(3);

        const list = new LinkedList<Obj>(...fixture);
        const listPred = (value, index, theList) => {
          let result = false;

          if (value.a === 2) {
            const testValue = theList.at(index);
            if (testValue?.b === 'x') {
              result = true;
            }
          }
          return result;
        };

        expect(list.find(listPred)).to.deep.equal({a: 2, b: 'x'});
        expect(list.findIndex(listPred)).to.equal(3);
      });
      it('assigns thisArg just like Array', () => {
        const myObj = new TestClass();

        function pred(this: TestClass, value, index) {
          return this.match(value, index);
        }

        expect(myObj.arr.find(pred, myObj)).to.deep.equal({a: 2, b: 'x'});
        expect(myObj.arr.findIndex(pred, myObj)).to.equal(3);
        expect(myObj.list.find(pred, myObj)).to.deep.equal({a: 2, b: 'x'});
        expect(myObj.list.findIndex(pred, myObj)).to.equal(3);

        //
        // missing myObj results in an exception
        //
        expect(() => myObj.arr.find(pred)).to.throw();
        expect(() => myObj.list.find(pred)).to.throw();
      });
    });

    describe('fill', () => {
      it('fills an empty list just like Array', () => {
        const arr = Array();

        arr.fill(42);
        expect(arr.length).to.equal(0);

        const list = new LinkedList<number>();
        list.fill(42);
        expect(list.length).to.equal(0);
      });
      it('fills a singleton list just like Array', () => {
        const arr = Array(1);

        arr.fill(42);
        expect(arr.length).to.equal(1);
        expect(arr[0]).to.equal(42);

        const list = LinkedList.of(1);
        list.fill(42);
        expect(list.length).to.equal(1);
        expect(list.at(0)).to.equal(42);
      });
      it('fills a list just like Array', () => {
        const SIZE = 1000;
        const FIXTURE = 42;
        const arr = Array(SIZE);

        arr.fill(FIXTURE);
        expect(arr.length).to.equal(SIZE);
        for (const value of arr) {
          expect(value).to.equal(FIXTURE);
        }

        const list = new LinkedList<number>(SIZE);
        list.fill(FIXTURE);
        expect(list.length).to.equal(SIZE);
        for (const value of list) {
          expect(value).to.equal(FIXTURE);
        }
      });
      describe('start index', () => {
        it('sets the starting point', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, SIZE / 2);
          let index = 0;
          for (const value of arr) {
            if (index < SIZE / 2) {
              expect(value).to.equal(undefined);
            } else {
              expect(value).to.equal(FIXTURE);
            }
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, SIZE / 2);
          index = 0;
          for (const value of list) {
            if (index < SIZE / 2) {
              expect(value).to.equal(undefined);
            } else {
              expect(value).to.equal(FIXTURE);
            }
            index++;
          }
        });
        it('works with -ve', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, -SIZE / 2);
          let index = 0;
          for (const value of arr) {
            if (index < SIZE / 2) {
              expect(value).to.equal(undefined);
            } else {
              expect(value).to.equal(FIXTURE);
            }
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, -SIZE / 2);
          index = 0;
          for (const value of list) {
            if (index < SIZE / 2) {
              expect(value).to.equal(undefined);
            } else {
              expect(value).to.equal(FIXTURE);
            }
            index++;
          }
        });
        it('resets to 0 if too small', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, -SIZE - 1);
          let index = 0;
          for (const value of arr) {
            expect(value).to.equal(FIXTURE);
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, -SIZE - 1);
          index = 0;
          for (const value of list) {
            expect(value).to.equal(FIXTURE);
            index++;
          }
        });
        it('extends to the end if too large', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, SIZE + 1);
          let index = 0;
          for (const value of arr) {
            expect(value).to.equal(undefined);
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, SIZE + 1);
          index = 0;
          for (const value of list) {
            expect(value).to.equal(undefined);
            index++;
          }
        });
        it('does nothing if too small', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, 0, -SIZE - 1);
          let index = 0;
          for (const value of arr) {
            expect(value).to.equal(undefined);
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, 0, -SIZE - 1);
          index = 0;
          for (const value of list) {
            expect(value).to.equal(undefined);
            index++;
          }
        });
      });
      describe('end index', () => {
        it('sets the end point', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, 0, SIZE / 2);
          let index = 0;
          for (const value of arr) {
            if (index < SIZE / 2) {
              expect(value).to.equal(FIXTURE);
            } else {
              expect(value).to.equal(undefined);
            }
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, 0, SIZE / 2);
          index = 0;
          for (const value of list) {
            if (index < SIZE / 2) {
              expect(value).to.equal(FIXTURE);
            } else {
              expect(value).to.equal(undefined);
            }
            index++;
          }
        });
        it('works with -ve', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, 0, -SIZE / 2);
          let index = 0;
          for (const value of arr) {
            if (index < SIZE / 2) {
              expect(value).to.equal(FIXTURE);
            } else {
              expect(value).to.equal(undefined);
            }
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, 0, -SIZE / 2);
          index = 0;
          for (const value of list) {
            if (index < SIZE / 2) {
              expect(value).to.equal(FIXTURE);
            } else {
              expect(value).to.equal(undefined);
            }
            index++;
          }
        });
        it('resets to 0 if too small', () => {
          const SIZE = 100;
          const FIXTURE = 42;
          const arr = Array(SIZE);

          expect(arr.length).to.equal(SIZE);
          arr.fill(FIXTURE, 0, -SIZE - 1);
          let index = 0;
          for (const value of arr) {
            expect(value).to.equal(undefined);
            index++;
          }

          const list = new LinkedList<number>(SIZE);
          expect(list.length).to.equal(SIZE);
          list.fill(FIXTURE, 0, -SIZE - 1);
          index = 0;
          for (const value of list) {
            expect(value).to.equal(undefined);
            index++;
          }
        });
      });
    });

    describe('filter', () => {
      it('filters to matching elements just like Array', () => {
        const fixture = [1, 2, 3, 4, 2, 5, 2, 6, 2, 7];
        const pred = value => value === 2;

        expect(fixture.filter(pred)).to.deep.equal([2, 2, 2, 2]);

        const list = new LinkedList<number>(...fixture);
        const result = list.filter(pred);

        expect(result.length).to.equal(4);
        for (const value of result) {
          expect(value).to.equal(2);
        }
      });
      it('returns empty list with no matching element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const pred = value => value === 5;

        expect(fixture.filter(pred).length).to.equal(0);

        const list = new LinkedList<number>(...fixture);

        expect(list.filter(pred).length).to.equal(0);
      });
      it('provides an index parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => value.a === 2 && index > 1;

        expect(fixture.filter(pred)).to.deep.equal([{a: 2, b: 'x'}]);

        const list = new LinkedList<Obj>(...fixture);
        const result = list.filter(pred);
        const expected = new LinkedList<Obj>(...[{a: 2, b: 'x'}]);

        expectEqual(result, expected);
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];

        expect(fixture.filter((value, index, theArray) => value.a === 2 && theArray[index].b === 'x')).to.deep.equal([{
          a: 2,
          b: 'x'
        }]);

        const list = new LinkedList<Obj>(...fixture);
        const expected = new LinkedList<Obj>(...[{a: 2, b: 'x'}]);
        const result = list.filter((value, index, theList) => {
          let result = false;

          if (value.a === 2) {
            const testValue = theList.at(index);
            if (testValue?.b === 'x') {
              result = true;
            }
          }
          return result;
        });
        expectEqual(result, expected);
      });
      it('assigns thisArg just like Array', () => {
        const myObj = new TestClass();

        function pred(this: TestClass, value, index) {
          return this.match(value, index);
        }

        expect(myObj.arr.filter(pred, myObj)).to.deep.equal([{a: 2, b: 'x'}]);

        const expected = new LinkedList<Obj>(...[{a: 2, b: 'x'}]);
        const result = myObj.list.filter(pred, myObj);

        expectEqual(result, expected);

        //
        // missing myObj results in an exception
        //
        expect(() => myObj.arr.find(pred)).to.throw();
        expect(() => myObj.list.find(pred)).to.throw();
      });
    });

    describe('flat', () => {
      it('leaves a simple list unchanged', () => {
        const fixture = [1, 2, 3, 4, 2, 5, 2, 6, 2, 7];

        const arrResult = fixture.flat();
        expect(arrResult).to.not.equal(fixture);
        expect(arrResult).to.deep.equal(fixture);

        const list: RecursiveLinkedList<number> = new LinkedList(...fixture);
        const listResult = list.flat();

        expect(listResult.length).to.equal(fixture.length);
        let index = 0;
        for (const value of listResult) {
          expect(value).to.equal(fixture[index]);
          index++;
        }
      });
      it('flattens single recursion to default depth of 1', () => {
        const fixture1 = [1, 2];
        const subFixture = [3, 4];
        const fixture2 = [5, 6];
        const arrFixture = [...fixture1, subFixture, ...fixture2];
        const expectedResult = [1, 2, 3, 4, 5, 6];

        const arrResult = arrFixture.flat();
        expect(arrResult).to.not.equal(arrFixture);
        expect(arrResult).to.deep.equal(expectedResult);

        //
        // The input list looks like this:
        //      1 -> 2 -> L -> 5 -> 6
        //                |
        //                3 -> 4
        //
        const subListFixture = new LinkedList<number>(...subFixture);
        const list = new LinkedList<number | LinkedList<number>>(...fixture1, subListFixture, ...fixture2);
        const listResult = list.flat();

        expect(listResult.length).to.equal(expectedResult.length);
        let index = 0;
        for (const value of listResult) {
          expect(value).to.equal(expectedResult[index]);
          index++;
        }
      });
      it('flattens double recursion to default depth of 1', () => {
        const fixture1 = [1, 2];
        const subFixture2 = [98, 99];
        const subFixture1 = [3, subFixture2, 4];
        const fixture3 = [5, 6];
        const arrFixture = [...fixture1, subFixture1, ...fixture3];
        const expectedResult = [1, 2, 3, [98, 99], 4, 5, 6];

        const arrResult = arrFixture.flat();
        expect(arrResult).to.not.equal(arrFixture);
        expect(arrResult).to.deep.equal(expectedResult);

        //
        // The input list looks like this:
        //      1 -> 2 -> L -> 5 -> 6
        //                |
        //                3 -> L -> 4
        //                     |
        //                     98 -> 99
        //
        const subListFixture2 = new LinkedList<number>(...subFixture2);
        const subListFixture1 = new LinkedList<number | LinkedList<number>>(3, subListFixture2, 4);
        const list = new LinkedList<number | RecursiveLinkedList<number>>(...fixture1, subListFixture1, ...fixture3);
        const listResult = list.flat();

        expect(listResult.length).to.equal(expectedResult.length);
        expect(listResult.at(0)).to.equal(1);
        expect(listResult.at(1)).to.equal(2);
        expect(listResult.at(2)).to.equal(3);

        expect(LinkedList.isLinkedList(listResult.at(3))).to.be.true;
        const subList = listResult.at(3) as LinkedList<number>;
        expect(subList.at(0)).to.equal(98);
        expect(subList.at(1)).to.equal(99);

        expect(listResult.at(4)).to.equal(4);
        expect(listResult.at(5)).to.equal(5);
        expect(listResult.at(6)).to.equal(6);
      });
      it('does nothing with a depth of zero', () => {
        const ZERO = 0;
        const fixture1 = [1, 2];
        const subFixture2 = [98, 99];
        const subFixture1 = [3, subFixture2, 4];
        const fixture3 = [5, 6];
        const arrFixture = [...fixture1, subFixture1, ...fixture3];
        const expectedResult = arrFixture;

        const arrResult = arrFixture.flat(ZERO);
        expect(arrResult).to.not.equal(arrFixture);
        expect(arrResult).to.deep.equal(expectedResult);

        //
        // The input list looks like this:
        //      1 -> 2 -> L -> 5 -> 6
        //                |
        //                3 -> L -> 4
        //                     |
        //                     98 -> 99
        //
        const subListFixture2 = new LinkedList<number>(...subFixture2);
        const subListFixture1 = new LinkedList<number | LinkedList<number>>(3, subListFixture2, 4);
        const list = new LinkedList<number | RecursiveLinkedList<number>>(...fixture1, subListFixture1, ...fixture3);
        const listResult = list.flat(ZERO);

        expect(listResult.length).to.equal(expectedResult.length);
        expect(listResult.at(0)).to.equal(1);
        expect(listResult.at(1)).to.equal(2);

        expect(LinkedList.isLinkedList(listResult.at(2))).to.be.true;
        const subList1 = listResult.at(2) as LinkedList<number | RecursiveLinkedList<number>>;
        expect(subList1.at(0)).to.equal(3);
        expect(subList1.at(2)).to.equal(4);

        expect(LinkedList.isLinkedList(subList1.at(1))).to.be.true;
        const subList2 = subList1.at(1) as LinkedList<number>;
        expect(subList2.at(0)).to.equal(98);
        expect(subList2.at(1)).to.equal(99);

        expect(listResult.at(3)).to.equal(5);
        expect(listResult.at(4)).to.equal(6);
      });
      it('flattens recursively to specified depth', () => {
        const DEPTH = 3;
        const fixture1 = [1, 2];
        const subFixture3 = [998, 999];
        const subFixture2 = [98, 99];
        const subFixture1 = [3, ...[subFixture2, subFixture3], 4];
        const fixture3 = [5, 6];
        const arrFixture = [...fixture1, subFixture1, ...fixture3];
        const expectedResult = [1, 2, 3, 98, 99, 998, 999, 4, 5, 6];

        const arrResult = arrFixture.flat(DEPTH);
        expect(arrResult).to.not.equal(arrFixture);
        expect(arrResult).to.deep.equal(expectedResult);

        //
        // The input list looks like this:
        //      1 -> 2 -> L -> 5 -> 6
        //                |
        //                3 -> L -> 4
        //                     |
        //                     98 -> 99 -> L
        //                                 |
        //                                 998 -> 999
        //
        const subListFixture3 = new LinkedList<number>(...subFixture3);
        const subListFixture2 = new LinkedList<number | LinkedList<number>>(...subFixture2, subListFixture3);
        const subListFixture1 = new LinkedList<number | RecursiveLinkedList<number>>(3, subListFixture2, 4);
        const list = new LinkedList<number | RecursiveLinkedList<number>>(...fixture1, subListFixture1, ...fixture3);
        const listResult = list.flat(DEPTH);

        expect(listResult.length).to.equal(expectedResult.length);
        let index = 0;
        for (const value of listResult) {
          expect(value).to.equal(expectedResult[index]);
          index++;
        }
      });
    });

    describe('grow', () => {
      it('works with zero', () => {
        const SIZE = 0;
        const VALUE = 'x';

        const list = new LinkedList<string>();
        list.grow(SIZE, VALUE);
        expect(list.length).to.equal(SIZE);
      });
      it('grows a list from empty', () => {
        const SIZE = 1000;
        const FIXTURE = 'x';

        const list = new LinkedList<string>();
        list.grow(SIZE, FIXTURE);
        expect(list.length).to.equal(SIZE);
        for (const value of list) {
          expect(value).to.equal(FIXTURE);
        }
      });
      it('ignores the same size', () => {
        const SIZE = 1000;
        const FIXTURE = 'x';

        const list = new LinkedList<string>();
        list.grow(SIZE, FIXTURE);
        expect(list.length).to.equal(SIZE);
        list.grow(SIZE, FIXTURE);
        expect(list.length).to.equal(SIZE);
        for (const value of list) {
          expect(value).to.equal(FIXTURE);
        }
      });
      it('ignores a smaller size change', () => {
        const SIZE = 1000;
        const FIXTURE = 'x';

        const list = new LinkedList<string>();
        list.grow(SIZE, FIXTURE);
        expect(list.length).to.equal(SIZE);
        list.grow(SIZE - 10, FIXTURE);
        expect(list.length).to.equal(SIZE);
        for (const value of list) {
          expect(value).to.equal(FIXTURE);
        }
      });
      it('ignores a negative change', () => {
        const SIZE = 1000;
        const FIXTURE = 'x';

        const list = new LinkedList<string>();
        list.grow(SIZE, FIXTURE);
        expect(list.length).to.equal(SIZE);
        list.grow(-1, FIXTURE);
        expect(list.length).to.equal(SIZE);
        for (const value of list) {
          expect(value).to.equal(FIXTURE);
        }
      });
      it('grows a list from non-empty', () => {
        const INIT_SIZE = 1000;
        const INIT_FIXTURE = 'a';
        const NEW_SIZE = INIT_SIZE * 2;
        const NEW_FIXTURE = 'x';

        const list = new LinkedList<string>();
        list.grow(INIT_SIZE, INIT_FIXTURE);
        for (const value of list) {
          expect(value).to.equal(INIT_FIXTURE);
        }

        list.grow(NEW_SIZE, NEW_FIXTURE);
        expect(list.length).to.equal(NEW_SIZE);
        let index = 0;
        for (const value of list) {
          if (index < INIT_SIZE) {
            expect(value).to.equal(INIT_FIXTURE);
          } else {
            expect(value).to.equal(NEW_FIXTURE);
          }
          index++;
        }
      });
    });

    describe('every', () => {
      it('returns true if every element matches the predicate, just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const pred = value => value < 5;

        expect(fixture.every(pred)).to.be.true;

        const list = new LinkedList<number>(...fixture);
        expect(list.every(pred)).to.be.true;
      });
      it('returns false if one element does not match the predicate, just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const pred = value => value === 1;

        expect(fixture.every(pred)).to.be.false;

        const list = new LinkedList<number>(...fixture);
        expect(list.every(pred)).to.be.false;
      });
      it('returns true on empty list just like Array', () => {
        const fixture = [];
        const pred = value => value === 5;

        expect(fixture.every(pred)).to.be.true;

        const list = new LinkedList<number>(...fixture);
        expect(list.every(pred)).to.be.true;

      });
      it('provides an index parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => _.isNumber(value.b) || index === 3;

        expect(fixture.every(pred)).to.be.true;

        const list = new LinkedList<Obj>(...fixture);
        expect(list.every(pred)).to.be.true;
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const arrPred = (value, index, theArray) => _.isNumber(theArray[index].b) || theArray[index].b === 'x';

        expect(fixture.every(arrPred)).to.be.true;

        const list = new LinkedList<Obj>(...fixture);
        const listPred = (value, index, theList) => _.isNumber(theList.at(index).b) || theList.at(index).b === 'x';
        expect(list.every(listPred)).to.be.true;
      });
      it('assigns thisArg just like Array', () => {
        const myObj = new TestClass();

        function pred(this: TestClass, value, index) {
          return this.matchAll(value, index);
        }

        expect(myObj.arr.every(pred, myObj)).to.be.true;
        expect(myObj.list.every(pred, myObj)).to.be.true;

        //
        // missing myObj results in an exception
        //
        expect(() => myObj.arr.every(pred)).to.throw();
        expect(() => myObj.list.every(pred)).to.throw();
      });
    });
    describe('some', () => {
      it('returns true if an element matches the predicate, just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const pred = value => value == 3;

        expect(fixture.some(pred)).to.be.true;

        const list = new LinkedList<number>(...fixture);
        expect(list.some(pred)).to.be.true;
      });
      it('returns false if no element matches the predicate, just like Array', () => {
        const fixture = [1, 2, 3, 4];
        const pred = value => value === 5;

        expect(fixture.some(pred)).to.be.false;

        const list = new LinkedList<number>(...fixture);
        expect(list.some(pred)).to.be.false;
      });
      it('returns false on empty list just like Array', () => {
        const fixture = [];
        const pred = value => value === 5;

        expect(fixture.some(pred)).to.be.false;

        const list = new LinkedList<number>(...fixture);
        expect(list.some(pred)).to.be.false;

      });
      it('provides an index parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => index === 2;

        expect(arr.some(pred)).to.be.true;

        const list = new LinkedList<Obj>(...arr);
        expect(list.some(pred)).to.be.true;
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const arrPred = (value, index, theArray) => _.isNumber(theArray[index].b) || theArray[index].b === 'x';

        expect(fixture.some(arrPred)).to.be.true;

        const list = new LinkedList<Obj>(...fixture);
        const listPred = (value, index, theList) => _.isNumber(theList.at(index).b) || theList.at(index).b === 'x';
        expect(list.some(listPred)).to.be.true;
      });
      it('assigns thisArg just like Array', () => {
        const myObj = new TestClass();

        function pred(this: TestClass, value) {
          return this.matchSome(value);
        }

        expect(myObj.arr.some(pred, myObj)).to.be.true;

        expect(myObj.list.some(pred, myObj)).to.be.true;

        //
        // missing myObj results in an exception
        //
        expect(() => myObj.arr.some(pred)).to.throw();
        expect(() => myObj.list.some(pred)).to.throw();
      });
    });
    describe('forEach', () => {
      it('calls the callback on every element just like Array', () => {
        const fixture = [1, 2, 3, 4];
        let result = 0;

        function sum(value) {
          result += value;
        }

        fixture.forEach(sum);
        expect(result).to.equal(10);

        const list = new LinkedList<number>(...fixture);
        result = 0;
        list.forEach(sum);
        expect(result).to.equal(10);
      });
      it('does nothing on an empty list, just like Array', () => {
        const fixture = [];
        let result = true;

        function cb() {
          result = false;
        }

        fixture.forEach(cb);
        expect(result).to.be.true;

        const list = new LinkedList<number>(...fixture);

        list.forEach(cb);
        expect(result).to.be.true;
      });
      it('provides an index parameter to the callback, just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        let result = -1;

        fixture.forEach((value, index) => result = index);
        expect(result).to.equal(3);

        const list = new LinkedList<Obj>(...fixture);

        result = -1;
        list.forEach((value, index) => result = index);
        expect(result).to.equal(3);
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const fixture: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        let result: number | string = -1;

        fixture.forEach((value, index, theArray) => result = theArray[index].b);
        expect(result).to.equal('x');

        const list = new LinkedList<Obj>(...fixture);
        result = -1;
        list.forEach((value, index, theList) => {
          const indexValue = theList.at(index);

          if (indexValue !== undefined) {
            result = indexValue?.b;
          }
        });
        expect(result).to.equal('x');
      });
      it('assigns thisArg just like Array', () => {
        const myObj = new TestClass();
        let result: number | string = -1;

        function arrCb(this: TestClass, value, index) {
          result = this.arr[index].b;
        }

        myObj.arr.forEach(arrCb, myObj);
        expect(result).to.equal('x');

        function listCb(this: TestClass, value, index) {
          const indexValue = this.list.at(index);
          if (indexValue !== undefined) {
            result = indexValue.b;
          }
        }

        myObj.list.forEach(listCb, myObj);
        expect(result).to.equal('x');
      });
    });

    describe('slice', () => {
      const fixture: number[] = [1, 2, 3, 4];

      function compare<T>(iter: IterableIterator<T>, fixture: T[]) {
        let index = 0;
        for (const value of iter) {
          expect(value).to.equal(fixture[index]);
          index++;
        }
        expect(index).to.equal(fixture.length);
      }

      it('slices the original', () => {
        const arr = new Array<number>(...fixture);

        const arrSlice = arr.slice(1, 3);
        expect(arrSlice === arr).to.be.false;     // not a reference to the original
        compare(arrSlice[Symbol.iterator](), [fixture[1], fixture[2]]);

        const list = new LinkedList<number>(...fixture);
        const listSlice = list.slice(1, 3);
        expect(listSlice === list).to.be.false;   // not a reference to the original
        compare(listSlice[Symbol.iterator](), [fixture[1], fixture[2]]);
      });

      it('returns a new empty list from an empty list', () => {
        const arr = new Array<number>();

        const arrSlice = arr.slice();
        expect(arrSlice === arr).to.be.false;     // not a reference to the original
        expect(arrSlice.length).to.equal(0);

        const list = new LinkedList<number>();
        const listSlice = list.slice();
        expect(listSlice === list).to.be.false;   // not a reference to the original
        expect(listSlice.length).to.equal(0);
      });

      it('returns a copy if no parameters are given', () => {
        const arr = new Array<number>(...fixture);

        const arrSlice = arr.slice();
        expect(arrSlice === arr).to.be.false;     // not a reference to the original
        compare(arrSlice[Symbol.iterator](), fixture);

        const list = new LinkedList<number>(...fixture);
        const listSlice = list.slice();
        expect(listSlice === list).to.be.false;   // not a reference to the original
        compare(listSlice[Symbol.iterator](), fixture);
      });

      it('returns a copy if start and end indexes are given', () => {
        const arr = new Array<number>(...fixture);

        const arrSlice = arr.slice(0, arr.length);
        expect(arrSlice === arr).to.be.false;     // not a reference to the original
        compare(arrSlice[Symbol.iterator](), fixture);

        const list = new LinkedList<number>(...fixture);
        const listSlice = list.slice(0, list.length);
        expect(listSlice === list).to.be.false;   // not a reference to the original
        compare(listSlice[Symbol.iterator](), fixture);
      });

      it('does not return the last index given', () => {
        const arr = new Array<number>(...fixture);

        const arrSlice = arr.slice(0, 1);
        compare(arrSlice[Symbol.iterator](), [fixture[0]]);

        const list = new LinkedList<number>(...fixture);
        const listSlice = list.slice(0, 1);
        compare(listSlice[Symbol.iterator](), [fixture[0]]);
      });

      describe('unusual start and end indexes', () => {
        it('returns an empty result if the start >= end and is in the middle', () => {
          const arr = new Array<number>(...fixture);

          const arrSlice = arr.slice(2, 2);
          expect(arrSlice === fixture).to.be.false;     // not a reference to the original
          expect(arrSlice.length).to.equal(0);

          const list = new LinkedList<number>([...fixture]);
          const listSlice = list.slice(2, 2);
          expect(listSlice === list).to.be.false;   // not a reference to the original
          expect(listSlice.length).to.equal(0);
        });
        it('returns an empty result if the start >= end and is at the beginning', () => {
          const arr = new Array<number>(...fixture);

          const arrSlice = arr.slice(0, 0);
          expect(arrSlice === fixture).to.be.false;     // not a reference to the original
          expect(arrSlice.length).to.equal(0);

          const list = new LinkedList<number>([...fixture]);
          const listSlice = list.slice(0, 0);
          expect(listSlice === list).to.be.false;   // not a reference to the original
          expect(listSlice.length).to.equal(0);
        });
        it('returns an empty result if the start >= end and is at the end', () => {
          const arr = new Array<number>(...fixture);

          const arrSlice = arr.slice(arr.length, arr.length);
          expect(arrSlice === fixture).to.be.false;     // not a reference to the original
          expect(arrSlice.length).to.equal(0);

          const list = new LinkedList<number>([...fixture]);
          const listSlice = list.slice(list.length, list.length);
          expect(listSlice === list).to.be.false;   // not a reference to the original
          expect(listSlice.length).to.equal(0);
        });
        describe('-ve indexes', () => {
          it('works with -ve start', () => {
            const list = new LinkedList<number>(...fixture);
            const listSlice = list.slice(-1);
            expect(listSlice === list).to.be.false;   // not a reference to the original
            expect(listSlice.length).to.equal(1);
            compare(listSlice[Symbol.iterator](), fixture.slice(-1));
          });
          it('works with large -ve start', () => {
            const list = new LinkedList<number>(...fixture);
            const listSlice = list.slice(-list.length);
            expect(listSlice === list).to.be.false;   // not a reference to the original
            expect(listSlice.length).to.equal(list.length);
            compare(listSlice[Symbol.iterator](), fixture.slice(-fixture.length));
          });
          it('works with large -ve end', () => {
            const list = new LinkedList<number>(...fixture);
            const listSlice = list.slice(0, -list.length);
            expect(listSlice === list).to.be.false;   // not a reference to the original
            expect(listSlice.length).to.equal(0);
            compare(listSlice[Symbol.iterator](), fixture.slice(0, -fixture.length));
          });
          it('works with -ve start and -ve end', () => {
            const list = new LinkedList<number>(...fixture);
            const listSlice = list.slice(-3, -1);
            expect(listSlice === list).to.be.false;   // not a reference to the original
            expect(listSlice.length).to.equal(2);
            compare(listSlice[Symbol.iterator](), fixture.slice(-3, -1));
          });
          it('works with +ve start and -ve end', () => {
            const list = new LinkedList<number>(...fixture);
            const listSlice = list.slice(1, -1);
            expect(listSlice === list).to.be.false;   // not a reference to the original
            expect(listSlice.length).to.equal(2);
            compare(listSlice[Symbol.iterator](), fixture.slice(1, -1));
          });
          it('works with -ve start and +ve end', () => {
            const list = new LinkedList<number>(...fixture);
            const listSlice = list.slice(-3, 3);
            expect(listSlice === list).to.be.false;   // not a reference to the original
            expect(listSlice.length).to.equal(2);
            compare(listSlice[Symbol.iterator](), fixture.slice(-3, 3));
          });
          it('returns an empty result if end < start using -ve indexes', () => {
            const arr = new Array<number>(...fixture);

            const arrSlice = arr.slice(-2, -3);
            expect(arrSlice === fixture).to.be.false;     // not a reference to the original
            expect(arrSlice.length).to.equal(0);

            const list = new LinkedList<number>(...fixture);
            const listSlice = list.slice(-2, -3);
            expect(listSlice === list).to.be.false;   // not a reference to the original
            expect(listSlice.length).to.equal(0);
          });
        });
      });

      describe('shallow copy', () => {
        it('returns shallow copies of objects', () => {
          const fixture = [{a: 1, b: 2}, {c: 3, d: 4}, {e: 5, f: 6}];
          const arr = new Array<Object>(...fixture);

          const arrSlice = arr.slice(1, 2);
          expect(arrSlice === arr).to.be.false;           // not a reference to the original
          expect(arrSlice[0] === arr[1]).to.be.true;      // copies are references to the original

          const list = new LinkedList<Object>([...fixture]);
          const listSlice = list.slice(1, 2);
          expect(listSlice === list).to.be.false;                       // not a reference to the original
          expect(listSlice.at(0) === list.at(1)).to.be.true; // copies are references to the original
        });
      });
    });
    describe('splice', () => {
      const fixture: number[] = [1, 2, 3, 4];

      describe('delete', () => {
        it('works with an empty list', () => {
          const arr = [];
          expect(arr.length).to.equal(0);
          const arrResult = arr.splice(0);
          expect(arr.length).to.equal(0);
          expect(arrResult.length).to.equal(0);

          const list = new LinkedList<string>();
          expect(list.length).to.equal(0);
          const listResult = list.splice(0);
          expect(list.length).to.equal(0);
          expect(listResult.length).to.equal(0);
        });
        it('works with a big list', () => {
          const SIZE = 1000;
          const FROM = 2;
          const arr = Array(SIZE);
          expect(arr.length).to.equal(SIZE);
          const arrResult = arr.splice(FROM, SIZE + 1);
          expect(arr.length).to.equal(FROM);
          expect(arrResult.length).to.equal(SIZE - FROM);

          const list = new LinkedList<string | undefined>(SIZE);
          expect(list.length).to.equal(SIZE);
          const listResult = list.splice(FROM, SIZE + 1);
          expect(list.length).to.equal(FROM);
          expect(listResult.length).to.equal(SIZE - FROM);
        });

        it('deletes write to the end', () => {
          const arr = new Array(...fixture);
          expect(arr.length).to.equal(4);
          const arrResult = arr.splice(0, 1000);
          expect(arr.length).to.equal(0);
          expect(arrResult.length).to.equal(4);
          expect(arrResult[0]).to.equal(1);
          expect(arrResult[1]).to.equal(2);
          expect(arrResult[2]).to.equal(3);
          expect(arrResult[3]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(4);
          const listResult = list.splice(0, 1000);
          expect(list.length).to.equal(0);
          expect(listResult.length).to.equal(4);
          expect(listResult.at(0)).to.equal(1);
          expect(listResult.at(1)).to.equal(2);
          expect(listResult.at(2)).to.equal(3);
          expect(listResult.at(3)).to.equal(4);
        });

        it('deletes everything with missing deleteCount', () => {
          const arr = new Array(...fixture);
          expect(arr.length).to.equal(4);
          const arrResult = arr.splice(0);
          expect(arr.length).to.equal(0);
          expect(arrResult.length).to.equal(4);
          expect(arrResult[0]).to.equal(1);
          expect(arrResult[1]).to.equal(2);
          expect(arrResult[2]).to.equal(3);
          expect(arrResult[3]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(4);
          const listResult = list.splice(0);
          expect(list.length).to.equal(0);
          expect(listResult.length).to.equal(4);
          expect(listResult.at(0)).to.equal(1);
          expect(listResult.at(1)).to.equal(2);
          expect(listResult.at(2)).to.equal(3);
          expect(listResult.at(3)).to.equal(4);
        });
        it('does nothing if deleteCount === 0', () => {
          const arr = new Array(...fixture);
          expect(arr.length).to.equal(4);
          const arrResult = arr.splice(0, 0);
          expect(arrResult.length).to.equal(0);
          expect(arr[0]).to.equal(1);
          expect(arr[1]).to.equal(2);
          expect(arr[2]).to.equal(3);
          expect(arr[3]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(4);
          const listResult = list.splice(0, 0);
          expect(listResult.length).to.equal(0);
          expect(list.at(0)).to.equal(1);
          expect(list.at(1)).to.equal(2);
          expect(list.at(2)).to.equal(3);
          expect(list.at(3)).to.equal(4);
        });
        it('does nothing if deleteCount < 0', () => {
          const arr = new Array(...fixture);
          expect(arr.length).to.equal(4);
          const arrResult = arr.splice(0, -1);
          expect(arrResult.length).to.equal(0);
          expect(arr[0]).to.equal(1);
          expect(arr[1]).to.equal(2);
          expect(arr[2]).to.equal(3);
          expect(arr[3]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(4);
          const listResult = list.splice(0, -1);
          expect(listResult.length).to.equal(0);
          expect(list.at(0)).to.equal(1);
          expect(list.at(1)).to.equal(2);
          expect(list.at(2)).to.equal(3);
          expect(list.at(3)).to.equal(4);
        });
        it('deletes everything after start with default deleteCount', () => {
          const arr = new Array(...fixture);
          expect(arr.length).to.equal(4);
          const arrResult = arr.splice(2);
          expect(arr.length).to.equal(2);
          expect(arrResult.length).to.equal(2);
          expect(arr[0]).to.equal(1);
          expect(arr[1]).to.equal(2);
          expect(arrResult[0]).to.equal(3);
          expect(arrResult[1]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(4);
          const listResult = list.splice(2);
          expect(list.length).to.equal(2);
          expect(listResult.length).to.equal(2);
          expect(list.at(0)).to.equal(1);
          expect(list.at(1)).to.equal(2);
          expect(listResult.at(0)).to.equal(3);
          expect(listResult.at(1)).to.equal(4);
        });
        describe('start index', () => {
          //
          // note, despite the documentation for Array, start index is mandatory (probably an ECMA level)
          //
          it('accepts -ve start index', () => {
            const arr = new Array(...fixture);
            expect(arr.length).to.equal(4);
            const arrResult = arr.splice(-2);
            expect(arr.length).to.equal(2);
            expect(arrResult.length).to.equal(2);
            expect(arr[0]).to.equal(1);
            expect(arr[1]).to.equal(2);
            expect(arrResult[0]).to.equal(3);
            expect(arrResult[1]).to.equal(4);

            const list = new LinkedList<number>(...fixture);
            expect(list.length).to.equal(4);
            const listResult = list.splice(-2);
            expect(list.length).to.equal(2);
            expect(listResult.length).to.equal(2);
            expect(list.at(0)).to.equal(1);
            expect(list.at(1)).to.equal(2);
            expect(listResult.at(0)).to.equal(3);
            expect(listResult.at(1)).to.equal(4);
          });
          it('accepts large -ve start index as 0', () => {
            const arr = new Array(...fixture);
            expect(arr.length).to.equal(4);
            const arrResult = arr.splice(-fixture.length - 1);
            expect(arr.length).to.equal(0);
            expect(arrResult.length).to.equal(4);
            expect(arrResult[0]).to.equal(1);
            expect(arrResult[1]).to.equal(2);
            expect(arrResult[2]).to.equal(3);
            expect(arrResult[3]).to.equal(4);

            const list = new LinkedList<number>(...fixture);
            expect(list.length).to.equal(4);
            const listResult = list.splice(-fixture.length - 1);
            expect(list.length).to.equal(0);
            expect(listResult.length).to.equal(4);
            expect(listResult.at(0)).to.equal(1);
            expect(listResult.at(1)).to.equal(2);
            expect(listResult.at(2)).to.equal(3);
            expect(listResult.at(3)).to.equal(4);
          });
          it('does nothing if start >= end of list', () => {
            const arr = new Array(...fixture);
            expect(arr.length).to.equal(4);
            const arrResult = arr.splice(fixture.length + 1);
            expect(arr.length).to.equal(4);
            expect(arrResult.length).to.equal(0);
            expect(arr[0]).to.equal(1);
            expect(arr[1]).to.equal(2);
            expect(arr[2]).to.equal(3);
            expect(arr[3]).to.equal(4);

            const list = new LinkedList<number>(...fixture);
            expect(list.length).to.equal(4);
            const listResult = list.splice(fixture.length + 1);
            expect(list.length).to.equal(4);
            expect(listResult.length).to.equal(0);
            expect(list.at(0)).to.equal(1);
            expect(list.at(1)).to.equal(2);
            expect(list.at(2)).to.equal(3);
            expect(list.at(3)).to.equal(4);
          });
        });
      });
      describe('insert', () => {
        it('works with an empty list', () => {
          const arr = Array<string>();
          expect(arr.length).to.equal(0);
          const arrResult = arr.splice(0, 0, 'a', 'b');
          expect(arr.length).to.equal(2);
          expect(arrResult.length).to.equal(0);
          expect(arr[0]).to.equal('a');
          expect(arr[1]).to.equal('b');

          const list = new LinkedList<string>();
          expect(list.length).to.equal(0);
          const listResult = list.splice(0, 0, 'a', 'b');
          expect(list.length).to.equal(2);
          expect(listResult.length).to.equal(0);
          expect(list.at(0)).to.equal('a');
          expect(list.at(1)).to.equal('b');
        });
        it('appends to a non-empty list', () => {
          const fixture = [1, 2];

          const arr = Array(...fixture);
          expect(arr.length).to.equal(fixture.length);
          const arrResult = arr.splice(fixture.length, 0, 3, 4);
          expect(arr.length).to.equal(4);
          expect(arrResult.length).to.equal(0);
          expect(arr[0]).to.equal(1);
          expect(arr[1]).to.equal(2);
          expect(arr[2]).to.equal(3);
          expect(arr[3]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(fixture.length);
          const listResult = list.splice(fixture.length, 0, 3, 4);
          expect(list.length).to.equal(4);
          expect(listResult.length).to.equal(0);
          expect(list.at(0)).to.equal(1);
          expect(list.at(1)).to.equal(2);
          expect(list.at(2)).to.equal(3);
          expect(list.at(3)).to.equal(4);
        });
        it('inserts to a non-empty list', () => {
          const fixture = [3, 4];

          const arr = Array(...fixture);
          expect(arr.length).to.equal(fixture.length);
          const arrResult = arr.splice(0, 0, 1, 2);
          expect(arr.length).to.equal(4);
          expect(arrResult.length).to.equal(0);
          expect(arr[0]).to.equal(1);
          expect(arr[1]).to.equal(2);
          expect(arr[2]).to.equal(3);
          expect(arr[3]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(fixture.length);
          const listResult = list.splice(0, 0, 1, 2);
          expect(list.length).to.equal(4);
          expect(listResult.length).to.equal(0);
          expect(list.at(0)).to.equal(1);
          expect(list.at(1)).to.equal(2);
          expect(list.at(2)).to.equal(3);
          expect(list.at(3)).to.equal(4);
        });
        describe('start index', () => {
          it('inserts at the start index', () => {
            const fixture = [1, 2, 4];

            const arr = Array(...fixture);
            expect(arr.length).to.equal(fixture.length);
            const arrResult = arr.splice(2, 0, 3);
            expect(arr.length).to.equal(4);
            expect(arrResult.length).to.equal(0);
            expect(arr[0]).to.equal(1);
            expect(arr[1]).to.equal(2);
            expect(arr[2]).to.equal(3);
            expect(arr[3]).to.equal(4);

            const list = new LinkedList<number>(...fixture);
            expect(list.length).to.equal(fixture.length);
            const listResult = list.splice(2, 0, 3);
            expect(list.length).to.equal(4);
            expect(listResult.length).to.equal(0);
            expect(list.at(0)).to.equal(1);
            expect(list.at(1)).to.equal(2);
            expect(list.at(2)).to.equal(3);
            expect(list.at(3)).to.equal(4);
          });
          it('inserts at the -ve start index', () => {
            const fixture = [1, 2, 4];

            const arr = Array(...fixture);
            expect(arr.length).to.equal(fixture.length);
            const arrResult = arr.splice(-1, 0, 3);
            expect(arr.length).to.equal(4);
            expect(arrResult.length).to.equal(0);
            expect(arr[0]).to.equal(1);
            expect(arr[1]).to.equal(2);
            expect(arr[2]).to.equal(3);
            expect(arr[3]).to.equal(4);

            const list = new LinkedList<number>(...fixture);
            expect(list.length).to.equal(fixture.length);
            const listResult = list.splice(-1, 0, 3);
            expect(list.length).to.equal(4);
            expect(listResult.length).to.equal(0);
            expect(list.at(0)).to.equal(1);
            expect(list.at(1)).to.equal(2);
            expect(list.at(2)).to.equal(3);
            expect(list.at(3)).to.equal(4);
          });
          it('inserts at the large -ve start index', () => {
            const fixture = [3, 4];

            const arr = Array(...fixture);
            expect(arr.length).to.equal(fixture.length);
            const arrResult = arr.splice(-fixture.length - 1, 0, 1, 2);
            expect(arr.length).to.equal(4);
            expect(arrResult.length).to.equal(0);
            expect(arr[0]).to.equal(1);
            expect(arr[1]).to.equal(2);
            expect(arr[2]).to.equal(3);
            expect(arr[3]).to.equal(4);

            const list = new LinkedList<number>(...fixture);
            expect(list.length).to.equal(fixture.length);
            const listResult = list.splice(-fixture.length - 1, 0, 1, 2);
            expect(list.length).to.equal(4);
            expect(listResult.length).to.equal(0);
            expect(list.at(0)).to.equal(1);
            expect(list.at(1)).to.equal(2);
            expect(list.at(2)).to.equal(3);
            expect(list.at(3)).to.equal(4);
          });
        });
      });
      describe('insert & delete', () => {
        it('works with an empty list', () => {
          const arr = Array<string>();
          expect(arr.length).to.equal(0);
          const arrResult = arr.splice(0, 1, 'a', 'b');
          expect(arr.length).to.equal(2);
          expect(arrResult.length).to.equal(0);
          expect(arr[0]).to.equal('a');
          expect(arr[1]).to.equal('b');

          const list = new LinkedList<string>();
          expect(list.length).to.equal(0);
          const listResult = list.splice(0, 1, 'a', 'b');
          expect(list.length).to.equal(2);
          expect(listResult.length).to.equal(0);
          expect(list.at(0)).to.equal('a');
          expect(list.at(1)).to.equal('b');
        });
        it('works with a non-empty list', () => {
          const fixture = [1, 2, 2];

          const arr = Array(...fixture);
          expect(arr.length).to.equal(fixture.length);
          const arrResult = arr.splice(2, 1, 3, 4);
          expect(arr.length).to.equal(4);
          expect(arrResult.length).to.equal(1);
          expect(arrResult[0]).to.equal(2);
          expect(arr[0]).to.equal(1);
          expect(arr[1]).to.equal(2);
          expect(arr[2]).to.equal(3);
          expect(arr[3]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(fixture.length);
          const listResult = list.splice(2, 1, 3, 4);
          expect(list.length).to.equal(4);
          expect(listResult.length).to.equal(1);
          expect(listResult.at(0)).to.equal(2);
          expect(list.at(0)).to.equal(1);
          expect(list.at(1)).to.equal(2);
          expect(list.at(2)).to.equal(3);
          expect(list.at(3)).to.equal(4);
        });
        it('can replace a list', () => {
          const fixture = [1, 2, 2];

          const arr = Array(...fixture);
          expect(arr.length).to.equal(fixture.length);
          const arrResult = arr.splice(0, Infinity, 3, 4);
          expect(arr.length).to.equal(2);
          expect(arrResult.length).to.equal(3);
          expect(arrResult[0]).to.equal(1);
          expect(arrResult[1]).to.equal(2);
          expect(arrResult[2]).to.equal(2);
          expect(arr[0]).to.equal(3);
          expect(arr[1]).to.equal(4);

          const list = new LinkedList<number>(...fixture);
          expect(list.length).to.equal(fixture.length);
          const listResult = list.splice(0, Infinity, 3, 4);
          expect(list.length).to.equal(2);
          expect(listResult.length).to.equal(3);
          expect(listResult.at(0)).to.equal(1);
          expect(listResult.at(1)).to.equal(2);
          expect(listResult.at(2)).to.equal(2);
          expect(list.at(0)).to.equal(3);
          expect(list.at(1)).to.equal(4);
        });
      });
    });
    describe('truncate', () => {
      it('works with an empty list', () => {
        const list = new LinkedList<string>();
        expect(list.length).to.equal(0);
        list.truncate(0);
        expect(list.length).to.equal(0);
      });
      it('works with 1', () => {
        const list = new LinkedList<string>('a', 'b');
        expect(list.length).to.equal(2);
        list.truncate(1);
        expect(list.length).to.equal(1);
      });
      it('works with zero', () => {
        const list = new LinkedList<string>(...['a', 'b', 'c']);
        expect(list.length).to.equal(3);
        list.truncate(0);
        expect(list.length).to.equal(0);
      });
      it('works with -ve (means zero)', () => {
        const list = new LinkedList<string>(...['a', 'b', 'c']);
        expect(list.length).to.equal(3);
        list.truncate(-1);
        expect(list.length).to.equal(0);
      });
      it('ignores the same size', () => {
        const SIZE = 1000;
        const FIXTURE = 'x';

        const list = new LinkedList<string>();
        list.grow(SIZE, FIXTURE);
        expect(list.length).to.equal(SIZE);
        list.truncate(SIZE);
        expect(list.length).to.equal(SIZE);
        for (const value of list) {
          expect(value).to.equal(FIXTURE);
        }
      });
      it('ignores a larger size change', () => {
        const SIZE = 1000;
        const FIXTURE = 'x';

        const list = new LinkedList<string>();
        list.grow(SIZE, FIXTURE);
        expect(list.length).to.equal(SIZE);
        list.truncate(SIZE + 10);
        expect(list.length).to.equal(SIZE);
        for (const value of list) {
          expect(value).to.equal(FIXTURE);
        }
      });
      it('truncates a list as expected', () => {
        const FULL_SIZE = 1000;
        const INIT_FIXTURE1 = 'a';
        const INIT_FIXTURE2 = 'x';
        const HALF_SIZE = FULL_SIZE / 2;

        const list = new LinkedList<string>();
        list.grow(HALF_SIZE, INIT_FIXTURE1);
        list.grow(FULL_SIZE, INIT_FIXTURE2);
        let index = 0;
        for (const value of list) {
          if (index < HALF_SIZE) {
            expect(value).to.equal(INIT_FIXTURE1);
          } else {
            expect(value).to.equal(INIT_FIXTURE2);
          }
          index++;
        }

        list.truncate(HALF_SIZE);
        expect(list.length).to.equal(HALF_SIZE);
        for (const value of list) {
          expect(value).to.equal(INIT_FIXTURE1);
        }
      });
    });

    describe('linked list speed vs array speed', () => {
      describe('unshift (insert)', () => {
        //
        // Linked list is much faster for unshift than array on large lengths
        //
        it('inserts (unshifts) faster than arrays', function () {
          this.timeout(20_000);   // event loop is blocked, so this only affects the end
          const count = 300_000;
          const speedFactor = 200;      //  much faster than this, but affected by coverage

          const runList = (): number => {
            //
            // measure list insert
            //
            const start = hrtime.bigint();
            const list = unshiftList(count, returnCount);
            const end = hrtime.bigint();

            expect(list.length).to.equal(count);

            return toMilli(Number(end - start));  // return milliseconds
          };

          const runArray = (): number => {
            //
            // measure array insert
            //
            const start = hrtime.bigint();
            const arr = unshiftArray(count, returnCount);
            const end = hrtime.bigint();

            expect(arr.length).to.equal(count);

            return toMilli(Number(end - start));  // return milliseconds
          };

          const listTimeMs = runList();
          const arrayTimeMs = runArray();

          console.log(`Array is ${(arrayTimeMs / listTimeMs).toFixed(1)} times slower than LinkedList for unshift`);
          expect(arrayTimeMs / listTimeMs).to.be.greaterThan(speedFactor);
        });
      });

      describe('shift (removal)', () => {
        //
        // Linked list is much faster for shift retrieval than the equivalent array with large lengths
        //
        it('retrieves (shifts) much faster than arrays', function () {
          this.timeout(20_000);   // event loop is blocked, so this only affects the end
          const count = 200_000;
          const speedFactor = 200;   // much faster than this, but affected by coverage

          const runList = (): number => {
            const list = pushList(count, returnCount);     // build the list quickly

            //
            // measure shift retrieval
            //
            const start = hrtime.bigint();
            for (let ii = 0; ii < count; ii++) {
              list.shift();
            }
            const end = hrtime.bigint();
            expect(list.length).to.equal(0);

            return toMilli(Number(end - start));  // return milliseconds
          };

          const runArray = (): number => {
            const arr = pushArray(count, returnCount);     // build the array quickly

            //
            // measure shift retrieval
            //
            const start = hrtime.bigint();
            for (let ii = 0; ii < count; ii++) {
              arr.shift();
            }
            const end = hrtime.bigint();
            expect(arr.length).to.equal(0);

            return toMilli(Number(end - start));  // return milliseconds

          };

          const listTimeMs = runList();
          const arrayTimeMs = runArray();

          console.log(`Array is ${(arrayTimeMs / listTimeMs).toFixed(1)} times slower than LinkedList for shift retrieval`);
          expect(arrayTimeMs / listTimeMs).to.be.greaterThan(speedFactor);
        });
        //
        // requires --expose-gc on node options
        //
        xit('does not leak memory', () => {
          const count = 1_000_000;
          const returnObj: makeFn<Record<string, unknown>> = (count: number) => {
            return {
              theCount: count,
              asString: `${count}`,
              hello: 'world'
            };
          };

          let list = unshiftList(count, returnObj);
          const startMemoryUsed = process.memoryUsage().heapUsed;

          for (let ii = 0; ii < 3; ii++) {
            while (list.length > 0) {
              expect(list.shift()).to.exist;
            }
            list = unshiftList(count, returnObj);
          }
          while (list.length > 0) {
            expect(list.shift()).to.exist;
          }

          forceGC();

          const endMemoryUsed = process.memoryUsage().heapUsed;
          expect(endMemoryUsed).to.be.lessThan(startMemoryUsed * 1.1);
        });
      });
      describe('slice', () => {
        xit('is slower than array', function () {
          this.timeout(20_000);   // event loop is blocked, so this only affects the end
          const count = 60_000;
          const speedFactor = 100;
          const sliceSize = 1_000;

          const runList = (): number => {
            const list = pushList(count, returnCount);     // build the list quickly

            //
            // measure slice retrieval
            //
            const start = hrtime.bigint();
            for (let ii = 0; ii < count; ii++) {
              list.slice(ii, ii + sliceSize);
            }
            const end = hrtime.bigint();

            return toMilli(Number(end - start));  // return milliseconds
          };

          const runArray = (): number => {
            const arr = pushArray(count, returnCount);     // build the array quickly

            //
            // measure slice retrieval
            //
            const start = hrtime.bigint();
            for (let ii = 0; ii < count; ii++) {
              arr.slice(ii, ii + sliceSize);
            }
            const end = hrtime.bigint();

            return toMilli(Number(end - start));  // return milliseconds
          };

          const listTimeMs = runList();
          const arrayTimeMs = runArray();

          // console.log(`Array ${arrayTimeMs}ms`);
          // console.log(`List ${listTimeMs}ms`);
          console.log(`List is ${(listTimeMs / arrayTimeMs).toFixed(1)} times slower than Array for slice retrieval with a size of ${count}`);
          expect(listTimeMs / arrayTimeMs).to.be.greaterThan(speedFactor);
        });
      });

      describe('concat', () => {
        it('is similar to array', function () {
          this.timeout(30_000);   // event loop is blocked, so this only affects the end
          const startSize = 200_000;
          const appendSize = 1_000;
          const count = 500;
          // const speedFactor = 1.5;

          const runList = (): number => {
            const list = pushList(startSize, returnCount);            // build the list quickly
            const appendList = pushList(appendSize, returnCount);     // build the list quickly

            //
            // measure concat
            //
            const start = hrtime.bigint();
            for (let ii = 0; ii < count; ii++) {
              list.concat(appendList);
            }
            const end = hrtime.bigint();

            return toMilli(Number(end - start));  // return milliseconds
          };

          const runArray = (): number => {
            const arr = pushArray(startSize, returnCount);            // build the array quickly
            const appendArr = pushArray(appendSize, returnCount);     // build the list quickly

            //
            // measure concat
            //
            const start = hrtime.bigint();
            for (let ii = 0; ii < count; ii++) {
              arr.concat(appendArr);
            }
            const end = hrtime.bigint();

            return toMilli(Number(end - start));  // return milliseconds
          };

          const listTimeMs = runList();
          const arrayTimeMs = runArray();

          // console.log(`Array ${arrayTimeMs}ms`);
          // console.log(`List ${listTimeMs}ms`);
          console.log(`List is ${(listTimeMs / arrayTimeMs).toFixed(1)} times slower than Array for slice retrieval`);
          // expect(listTimeMs / arrayTimeMs).to.be.greaterThan(speedFactor);
        });
      });

      describe('push (append)', () => {
        //
        // Array is very fast for push, but slows down when the objects being pushed are large.
        // This test shows that LinkedList is comparable to array in time and memory use when the elements are
        // > 500 bytes in size and the array or list length is several hundred thousand.
        //
        // To run this test, you must start node with: --expose-gc
        // If you want to test with bigger numbers, you may also need: --max-old-space-size=20000
        //
        // This test is disabled because it's not reliable; the garbage collector (GC), the nyc coverage logic,
        // and IDE bring in confounding factors especially when run with previous tests.
        //
        // However, you can enable and play with it.
        //
        xit('is comparable to array for pushing large elements on long lists/arrays', function () {
          this.timeout(80_000);   // event loop is blocked, so this only affects the end

          //
          // These values provide the comparison; your results may vary depending on your computer's
          // capabilities.
          //
          const slownessFactor = 1.5;     // list will be less than this much slower than array
          const memoryFactor = 1.3;       // list will use less than this much more memory than array
          const sizeThreshold = 500;      // this is the size at which LinkedList becomes comparable to array
          const startCount = 50_000;      // start with a list/array of this size
          const measureCount = 400_000;   // and add this many more elements
          const repeats = 10;             // repeat this many times to average results

          const obj = {
            hello: 'world',
            mesg: 'My dog has fleas',
            num: 424242,
            x: 'x'.repeat(sizeThreshold)
          };

          const makeObject: makeFn<Object> = (count: number) => {
            return {...obj, n: count};
            // return {...obj, xs: 'x'.repeat(count % 200)};
          };

          const runList = (list: LinkedList<Object>): number => {
            const startLen = list.length;
            expect(startLen).to.equal(startCount);

            const start = hrtime.bigint();
            pushList(measureCount, makeObject, list);
            const end = hrtime.bigint();

            expect(list.length).to.equal(startLen + measureCount);

            return toMilli(Number(end - start));  // return milliseconds
          };

          const runArray = (arr: Object[]): number => {
            const startLen = arr.length;
            expect(startLen).to.equal(startCount);

            const start = hrtime.bigint();
            pushArray(measureCount, makeObject, arr);
            const end = hrtime.bigint();

            expect(arr.length).to.equal(startLen + measureCount);

            return toMilli(Number(end - start));  // return milliseconds
          };

          function testArray(): { timeMs: number, memoryMB: number, len: number } {
            const startMemoryUsed = process.memoryUsage().heapUsed;

            let arr = pushArray(startCount, makeObject);
            const timeMs = runArray(arr);
            const memoryMB = process.memoryUsage().heapUsed - startMemoryUsed;

            return {timeMs, memoryMB, len: arr.length};
          }

          let arrayTimeMs = 0;
          let arrayUsedMB = 0;

          for (let ii = 0; ii < repeats; ii++) {
            forceGC();
            const {timeMs, memoryMB} = testArray();
            arrayTimeMs += timeMs;
            arrayUsedMB += memoryMB;
          }
          //
          // compute average
          //
          arrayTimeMs /= repeats;
          arrayUsedMB /= repeats;
          console.log(`Array done ${arrayTimeMs}ms`);
          console.log(`Array uses approximately ${Math.round(toMega(arrayUsedMB) * 100) / 100} MB`);

          // forceGC();
          // let freeUsed = process.memoryUsage().heapUsed - startUsed;
          // console.log(`After freeing array: ${Math.round(toMega(freeUsed) * 100) / 100} MB`);

          function testList(): { timeMs: number, memoryMB: number, len: number } {
            const startMemoryUsed = process.memoryUsage().heapUsed;

            let list = pushList(startCount, makeObject);
            const timeMs = runList(list);
            const memoryMB = process.memoryUsage().heapUsed - startMemoryUsed;

            return {timeMs, memoryMB, len: list.length};
          }

          let listTimeMs = 0;
          let listUsedMB = 0;

          for (let ii = 0; ii < repeats; ii++) {
            forceGC();
            const {timeMs, memoryMB} = testList();
            listTimeMs += timeMs;
            listUsedMB += memoryMB;
          }
          //
          // compute average
          //
          listTimeMs /= repeats;
          listUsedMB /= repeats;
          console.log(`List done ${listTimeMs}ms`);
          console.log(`List uses approximately ${Math.round(toMega(listUsedMB) * 100) / 100} MB`);

          // forceGC();
          // freeUsed = process.memoryUsage().heapUsed - startUsed;
          // console.log(`After freeing list ${Math.round(toMega(freeUsed) * 100) / 100} MB`);

          // console.log(`Array is ${(listTimeMs / arrayTimeMs).toFixed(1)} times faster than LinkedList for push`);
          expect(listTimeMs).to.be.lessThan(arrayTimeMs * slownessFactor, 'List took longer than expected');
          expect(listUsedMB).to.be.lessThan(arrayUsedMB * memoryFactor, 'List using more memory than expected');
        });
      });
    });
  });
});

