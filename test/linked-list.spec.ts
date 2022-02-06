/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

import { expect } from 'chai';
import { hrtime } from 'process';
import { LinkedList } from '../src/linked-list';

describe('linked-list', () => {
  describe('LinkedList', () => {
    function insertArray(count: number): number[] {
      const list: number[] = [];
      for (let ii = 0; ii < count; ii++) {
        list.unshift(ii);
      }
      return list;
    }

    function appendArray(count: number): number[] {
      const list: number[] = [];
      for (let ii = 0; ii < count; ii++) {
        list.push(ii);
      }
      return list;
    }

    function appendList(count: number): LinkedList<number> {
      const list = new LinkedList<number>();
      for (let ii = 0; ii < count; ii++) {
        list.push(ii);
      }
      return list;
    }

    function insertList(count: number): LinkedList<number> {
      const list = new LinkedList<number>();
      for (let ii = count; --ii >= 0;) {
        list.unshift(ii);
      }
      return list;
    }

    function expectEqual<T>(a: LinkedList<T>, b: LinkedList<T>): boolean {
      let result = false;

      if (a.length === b.length) {
        const aIter = a[Symbol.iterator]();
        const bIter = b[Symbol.iterator]();
        let aNext, bNext;

        do {
          aNext = aIter.next();
          bNext = bIter.next();

          expect(aNext).to.equal(bNext);
        } while (aNext !== undefined && bNext !== undefined);
      }
      return result;
    }

    describe('instantiation', () => {
      it('instantiates with no parameters', () => {
        const list = new LinkedList<number>();

        expect(list.length).to.equal(0);
        expect(list.shift()).to.be.undefined;
      });
      it('instantiates with iterator', () => {
        const list = new LinkedList<number>([1, 2, 3]);

        expect(list.length).to.equal(3);
        expect(list.shift()).to.equal(1);
        expect(list.shift()).to.equal(2);
        expect(list.shift()).to.equal(3);
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
        const list = appendList(count);

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
    });
    describe('unshift', () => {
      it('returns the new length', () => {
        const list = new LinkedList<number>();

        expect(list.unshift(42)).to.equal(1);
        expect(list.unshift(42)).to.equal(2);
      });

      it('inserts and retrieves', () => {
        const count = 10_000;
        const list = insertList(count);

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

        const x = new Array<Object>();

        x.find(() => true);
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
        const list = insertList(count);
        let index = 0;

        for (let value of list) {
          expect(value).to.equal(index++);
        }
        expect(index).to.equal(count);
      });
      it('obeys the iterator protocol', () => {
        const count = 10_000;
        const list = insertList(count);
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
        const arr = appendArray(count);
        const list = appendList(count);

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
        const arr = appendArray(count);
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
        const list = insertList(count);
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
        const list = insertList(count);
        const arr = [...list];

        expect(arr.length).to.equal(count);
        let index = 0;
        for (const value of list) {
          expect(value).to.equal(arr[index++]);
        }
        expect(index).to.equal(count);
      });
      it('instantiates with an existing list', () => {
        const count = 10_000;
        const origList = appendList(count);
        const dupList = new LinkedList<number>(origList);

        expect(dupList.length).to.equal(origList.length);

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
        }

        compare(arr.values());

        const list = new LinkedList<number>(arr);
        compare(list.values());
      });
    });
    describe('find', () => {
      it('finds a matching element just like Array', () => {
        const arr = [1, 2, 3, 4];

        expect(arr.find(value => value === 2)).to.equal(2);

        const list = new LinkedList<number>(arr);

        expect(list.find(value => value === 2)).to.equal(2);
      });
      it('returns undefined with no matching element just like Array', () => {
        const arr = [1, 2, 3, 4];

        expect(arr.find(value => value === 5)).to.be.undefined;

        const list = new LinkedList<number>(arr);

        expect(list.find(value => value === 5)).to.be.undefined;
      });
      it('finds first matching only just like Array', () => {
        type Obj = { a: number, b: number | string };
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];

        expect(arr.find(value => value.a === 2)).to.deep.equal({a: 2, b: 2});

        const list = new LinkedList<Obj>(arr);

        expect(list.find(value => value.a === 2)).to.deep.equal({a: 2, b: 2});
      });
      it('provides a position parameter to the predicate just like Array', () => {
        type Obj = { a: number, b: number | string };
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];

        expect(arr.find((value, position) => value.a === 2 && position > 1)).to.deep.equal({a: 2, b: 'x'});

        const list = new LinkedList<Obj>(arr);

        expect(list.find((value, position) => value.a === 2 && position > 1)).to.deep.equal({a: 2, b: 'x'});
      });
      it('provides the list parameter to the predicate just like Array', () => {
        type Obj = { a: number, b: number | string };
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];

        expect(arr.find((value, position, theArray) => value.a === 2 && theArray[position].b === 'x')).to.deep.equal({
          a: 2,
          b: 'x'
        });

        const list = new LinkedList<Obj>(arr);

        expect(list.find((value, position, theList) => {
          let result = false;

          if (value.a === 2) {
            //
            // iterate the list to the given position and check the value of b
            //
            let currPos = 0;
            for (const testValue of theList) {
              if (currPos === position) {
                if (testValue.b === 'x') {
                  result = true;
                  break;
                }
              }
              currPos++;
            }
          }
          return result;
        })).to.deep.equal({a: 2, b: 'x'});
      });
      it('assigns thisArg just like Array', () => {
        type Obj = { a: number, b: number | string };

        class TestClass {
          private readonly _arr: Obj[];
          private readonly _list: LinkedList<Obj>;

          constructor() {
            this._arr = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
            this._list = new LinkedList<Obj>(this._arr);
          }

          match(value: Obj, position: number): boolean {
            return value.a === 2 && position > 1;
          }

          get arr(): Obj[] {
            return this._arr;
          }

          get list(): LinkedList<Obj> {
            return this._list;
          }
        }

        const myObj = new TestClass();

        function pred(this: TestClass, value, position) {
          return this.match(value, position);
        }

        expect(myObj.arr.find(pred, myObj)).to.deep.equal({a: 2, b: 'x'});
        expect(myObj.list.find(pred, myObj)).to.deep.equal({a: 2, b: 'x'});

        //
        // missing myObj results in an exception
        //
        expect(() => myObj.arr.find(pred)).to.throw();
        expect(() => myObj.list.find(pred)).to.throw();
      });
    });
    describe('filter', () => {
      it('filters to matching elements just like Array', () => {
        const arr = [1, 2, 3, 4, 2, 5, 2, 6, 2, 7];

        expect(arr.filter(value => value === 2)).to.deep.equal([2, 2, 2, 2]);

        const list = new LinkedList<number>(arr);
        const result = list.filter(value => value === 2);

        expect(result.length).to.equal(4);
        for (const value of result) {
          expect(value).to.equal(2);
        }
      });
      it('returns empty list with no matching element just like Array', () => {
        const arr = [1, 2, 3, 4];

        expect(arr.filter(value => value === 5).length).to.equal(0);

        const list = new LinkedList<number>(arr);

        expect(list.filter(value => value === 5).length).to.equal(0);
      });
      it('provides a position parameter to the predicate just like Array', () => {
        type Obj = { a: number, b: number | string };
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];

        expect(arr.filter((value, position) => value.a === 2 && position > 1)).to.deep.equal([{a: 2, b: 'x'}]);

        const list = new LinkedList<Obj>(arr);
        const result = list.filter((value, position) => value.a === 2 && position > 1);

        expectEqual(list, result);
      });
      xit('provides the list parameter to the predicate just like Array', () => {
        type Obj = { a: number, b: number | string };
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];

        expect(arr.find((value, position, theArray) => value.a === 2 && theArray[position].b === 'x')).to.deep.equal([{
          a: 2,
          b: 'x'
        }]);

        const list = new LinkedList<Obj>(arr);

        expect(list.find((value, position, theList) => {
          let result = false;

          if (value.a === 2) {
            //
            // iterate the list to the given position and check the value of b
            //
            let currPos = 0;
            for (const testValue of theList) {
              if (currPos === position) {
                if (testValue.b === 'x') {
                  result = true;
                  break;
                }
              }
              currPos++;
            }
          }
          return result;
        })).to.deep.equal({a: 2, b: 'x'});
      });
      xit('assigns thisArg just like Array', () => {
        type Obj = { a: number, b: number | string };

        class TestClass {
          private readonly _arr: Obj[];
          private readonly _list: LinkedList<Obj>;

          constructor() {
            this._arr = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
            this._list = new LinkedList<Obj>(this._arr);
          }

          match(value: Obj, position: number): boolean {
            return value.a === 2 && position > 1;
          }

          get arr(): Obj[] {
            return this._arr;
          }

          get list(): LinkedList<Obj> {
            return this._list;
          }
        }

        const myObj = new TestClass();

        function pred(this: TestClass, value, position) {
          return this.match(value, position);
        }

        expect(myObj.arr.find(pred, myObj)).to.deep.equal({a: 2, b: 'x'});
        expect(myObj.list.find(pred, myObj)).to.deep.equal({a: 2, b: 'x'});

        //
        // missing myObj results in an exception
        //
        expect(() => myObj.arr.find(pred)).to.throw();
        expect(() => myObj.list.find(pred)).to.throw();
      });
    });

    describe('speed', () => {
      //
      // Linked list is much faster for unshift than array on large lengths
      //
      it('inserts (unshifts) faster than arrays', function () {
        this.timeout(20_000);   // event loop is blocked, so this only affects the end
        const count = 300_000;
        const speedFactor = 200;      //  much faster than this, but affected by coverage

        const runList = (): number => {
          const start = hrtime.bigint();
          const list = appendList(count);
          const end = hrtime.bigint();
          expect(list.length).to.equal(count);

          return Number(end - start) / 1_000_000;    // return milliseconds
        };

        const runArray = (): number => {
          const start = hrtime.bigint();
          const list = insertArray(count);
          const end = hrtime.bigint();
          expect(list.length).to.equal(count);

          return Number(end - start) / 1_000_000;    // return milliseconds
        };

        const listTimeMs = runList();
        const arrayTimeMs = runArray();

        console.log(`Array is ${(arrayTimeMs / listTimeMs).toFixed(1)} times slower than LinkedList for unshift`);
        expect(arrayTimeMs / listTimeMs).to.be.greaterThan(speedFactor);
      });

      //
      // Linked list is much faster for shift retrieval than the equivalent array with large lengths
      //
      it('retrieves much faster than arrays', function () {
        this.timeout(20_000);   // event loop is blocked, so this only affects the end
        const count = 200_000;
        const speedFactor = 300;   // much faster than this, but affected by coverage

        const runList = (): number => {
          const list = appendList(count);

          const start = hrtime.bigint();
          for (let ii = 0; ii < count; ii++) {
            list.shift();
          }
          const end = hrtime.bigint();
          expect(list.length).to.equal(0);

          return Number(end - start) / 1_000_000;    // return milliseconds
        };

        const runArray = (): number => {
          const list = appendArray(count);

          const start = hrtime.bigint();
          for (let ii = 0; ii < count; ii++) {
            list.shift();
          }
          const end = hrtime.bigint();
          expect(list.length).to.equal(0);

          return Number(end - start) / 1_000_000;    // return milliseconds
        };

        const listTimeMs = runList();
        const arrayTimeMs = runArray();

        console.log(`Array is ${(arrayTimeMs / listTimeMs).toFixed(1)} times slower than LinkedList for shift retrieval`);
        expect(arrayTimeMs / listTimeMs).to.be.greaterThan(speedFactor);
      });
    });
  });
});

