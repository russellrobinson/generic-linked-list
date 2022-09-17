/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

import { expect } from 'chai';
import { hrtime } from 'process';
import { LinkedList } from '../src/linked-list';
import * as _ from 'lodash';

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
        this._list = new LinkedList<Obj>(this._arr);
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
    describe('isLinkedList', () => {
      it('detects LinkedList', () => {
        const list1 = new LinkedList<number>();

        expect(LinkedList.isLinkedList(list1)).to.be.true;
        expect(LinkedList.isLinkedList(4)).to.be.false;
        expect(LinkedList.isLinkedList([])).to.be.false;
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

    describe('at', () => {
      it('works like Array.at (except for -ve indexes)', () => {
        const fixture: number[] = [1, 2, 3, 4];
        const arr = new Array(...fixture);

        //
        // Earlier versions of node do not support the Array.at method.
        //
        if (typeof arr.at === 'function') {
          expect(arr.at(0)).to.equal(1);
          expect(arr.at(3)).to.equal(4);
          expect(arr.at(-1)).to.equal(4);
          expect(arr.at(4)).to.be.undefined;
        }

        const list = new LinkedList<number>(fixture);

        expect(list.at(0)).to.equal(1);
        expect(list.at(3)).to.equal(4);
        expect(list.at(4)).to.be.undefined;

        expect(() => list.at(-1)).to.throw();
      });
    });

    describe('indexOf', () => {
      it('finds a matching element just like Array', () => {
        const arr = [1, 2, 3, 4];
        expect(arr.indexOf(2)).to.equal(1);

        const list = new LinkedList<number>(arr);
        expect(list.indexOf(2)).to.equal(1);
      });
      it('accepts the fromIndex just like Array (except for  -ve indexes)', () => {
        const arr = [1, 2, 3, 4, 2, 2];
        expect(arr.indexOf(2, 3)).to.equal(4);

        const list = new LinkedList<number>(arr);
        expect(list.indexOf(2, 3)).to.equal(4);

        expect(() => list.indexOf(2, -1)).to.throw();
      });
      it('returns -1 with no matching element just like Array', () => {
        const arr = [1, 2, 3, 4];
        expect(arr.indexOf(5)).to.equal(-1);

        const list = new LinkedList<number>(arr);
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
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        expect(arr.indexOf({a: 2, b: 2})).to.equal(-1);

        const list = new LinkedList<Obj>(arr);
        expect(list.indexOf({a: 2, b: 2})).to.equal(-1);

        //
        // So, now we test with the actual object, and it works
        //
        expect(arr.indexOf(arr[1])).to.equal(1);
        expect(list.indexOf(arr[1])).to.equal(1);
      });
      it('finds first matching only just like Array', () => {
        const arr = [1, 2, 3, 4, 2];
        expect(arr.indexOf(2)).to.equal(1);

        const list = new LinkedList<number>(arr);
        expect(list.indexOf(2)).to.equal(1);
      });
    });
    describe('concat', () => {
      it('concatenates just like Array', () => {
        const arr = [1, 2, 3, 4];
        const arrResult = arr.concat(2);
        const arrExpected = [1, 2, 3, 4, 2];
        expect(arrResult).to.deep.equal(arrExpected);

        const list = new LinkedList<number>(arr);
        const listResult = list.concat(2);
        const listExpected = new LinkedList<number>(arrExpected);

        expectEqual(listResult, listExpected);
      });
      it('accepts no parameters just like Array', () => {
        const arr = [1, 2, 3, 4];
        const arrResult = arr.concat();
        const arrExpected = [1, 2, 3, 4];
        expect(arrResult).to.deep.equal(arrExpected);

        const list = new LinkedList<number>(arr);
        const listResult = list.concat();
        const listExpected = new LinkedList<number>(arrExpected);

        expectEqual(listResult, listExpected);
      });
      it('accepts multiple parameters just like Array', () => {
        const arr = [1, 2, 3, 4];
        const arrResult = arr.concat(5, 2, 1, NaN);
        const arrExpected = [1, 2, 3, 4, 5, 2, 1, NaN];
        expect(arrResult).to.deep.equal(arrExpected);

        const list = new LinkedList<number>(arr);
        const listResult = list.concat(5, 2, 1, NaN);
        const listExpected = new LinkedList<number>(arrExpected);

        expectEqual(listResult, listExpected);
      });
      it('accepts list parameters just like Array accepts arrays', () => {
        const arr = [1, 2, 3, 4];
        const arrResult = arr.concat(5, [2, 3], 1, [NaN, 0]);
        const arrExpected = [1, 2, 3, 4, 5, 2, 3, 1, NaN, 0];
        expect(arrResult).to.deep.equal(arrExpected);

        const list = new LinkedList<number>(arr);
        const listResult = list.concat(5, new LinkedList([2, 3]), 1, new LinkedList([NaN, 0]));
        const listExpected = new LinkedList<number>(arrExpected);

        expectEqual(listResult, listExpected);
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
        const list: LinkedList<LocalObj> = new LinkedList<LocalObj>(arr);
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
        const arr = [1, 2, 3, 4];
        expect(arr.includes(2)).to.be.true;

        const list = new LinkedList<number>(arr);
        expect(list.includes(2)).to.be.true;
      });
      it('accepts the fromIndex just like Array (except for  -ve indexes)', () => {
        const arr = [1, 2, 3, 4, 2, 2];
        expect(arr.includes(2, 3)).to.be.true;
        expect(arr.includes(3, 3)).to.be.false;

        const list = new LinkedList<number>(arr);
        expect(list.includes(2, 3)).to.be.true;
        expect(arr.includes(3, 3)).to.be.false;

        expect(() => list.includes(2, -1)).to.throw();
      });
      it('returns false with no matching element just like Array', () => {
        const arr = [1, 2, 3, 4];
        expect(arr.includes(5)).to.be.false;

        const list = new LinkedList<number>(arr);
        expect(list.includes(5)).to.be.false;
      });
      it('returns false with empty list just like Array', () => {
        // noinspection JSMismatchedCollectionQueryUpdate
        const arr: number[] = [];
        expect(arr.includes(1)).to.be.false;

        const list = new LinkedList<number>();
        expect(list.includes(1)).to.be.false;
      });
      it('uses strict equality just like Array', () => {
        //
        // strict equality doesn't work with objects - they must be the same object
        //
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        expect(arr.includes({a: 2, b: 2})).to.be.false;

        const list = new LinkedList<Obj>(arr);
        expect(list.includes({a: 2, b: 2})).to.be.false;

        //
        // So, now we test with the actual object, and it works
        //
        expect(arr.includes(arr[1])).to.be.true;
        expect(list.includes(arr[1])).to.be.true;
      });
      it('finds NaN just like Array', () => {
        const arr = [1, NaN, 3, 4, 2];
        expect(arr.includes(NaN)).to.be.true;

        const list = new LinkedList<number>(arr);
        expect(list.includes(NaN)).to.be.true;
      });
      it('finds no NaN just like Array', () => {
        const arr = [1, 3, 4, 2];
        expect(arr.includes(NaN)).to.be.false;

        const list = new LinkedList<number>(arr);
        expect(list.includes(NaN)).to.be.false;
      });
      it('finds undefined just like Array', () => {
        const arr = [1, undefined, 3, 4, 2];
        expect(arr.includes(undefined)).to.be.true;

        const list = new LinkedList<unknown>(arr);
        expect(list.includes(undefined)).to.be.true;
      });
      it('finds null just like Array', () => {
        const arr = [1, null, 3, 4, 2];
        expect(arr.includes(null)).to.be.true;

        const list = new LinkedList<unknown>(arr);
        expect(list.includes(null)).to.be.true;
      });
    });
    describe('find & findIndex', () => {
      it('finds a matching element just like Array', () => {
        const arr = [1, 2, 3, 4];
        const pred = value => value === 2;

        expect(arr.find(pred)).to.equal(2);
        expect(arr.findIndex(pred)).to.equal(1);

        const list = new LinkedList<number>(arr);

        expect(list.find(pred)).to.equal(2);
        expect(list.findIndex(pred)).to.equal(1);
      });
      it('returns undefined with no matching element just like Array', () => {
        const arr = [1, 2, 3, 4];
        const pred = value => value === 5;

        expect(arr.find(pred)).to.be.undefined;
        expect(arr.findIndex(pred)).to.equal(-1);

        const list = new LinkedList<number>(arr);

        expect(list.find(pred)).to.be.undefined;
        expect(list.findIndex(pred)).to.equal(-1);
      });
      it('finds first matching only just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = value => value.a === 2;

        expect(arr.find(pred)).to.deep.equal({a: 2, b: 2});
        expect(arr.findIndex(pred)).to.equal(1);

        const list = new LinkedList<Obj>(arr);

        expect(list.find(pred)).to.deep.equal({a: 2, b: 2});
        expect(list.findIndex(pred)).to.equal(1);
      });
      it('provides an index parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => value.a === 2 && index > 1;

        expect(arr.find(pred)).to.deep.equal({a: 2, b: 'x'});
        expect(arr.findIndex(pred)).to.equal(3);

        const list = new LinkedList<Obj>(arr);

        expect(list.find(pred)).to.deep.equal({a: 2, b: 'x'});
        expect(list.findIndex(pred)).to.equal(3);
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const arrPred = (value, index, theArray) => value.a === 2 && theArray[index].b === 'x';

        expect(arr.find(arrPred)).to.deep.equal({
          a: 2,
          b: 'x'
        });
        expect(arr.findIndex(arrPred)).to.equal(3);

        const list = new LinkedList<Obj>(arr);
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
    describe('filter', () => {
      it('filters to matching elements just like Array', () => {
        const arr = [1, 2, 3, 4, 2, 5, 2, 6, 2, 7];
        const pred = value => value === 2;

        expect(arr.filter(pred)).to.deep.equal([2, 2, 2, 2]);

        const list = new LinkedList<number>(arr);
        const result = list.filter(pred);

        expect(result.length).to.equal(4);
        for (const value of result) {
          expect(value).to.equal(2);
        }
      });
      it('returns empty list with no matching element just like Array', () => {
        const arr = [1, 2, 3, 4];
        const pred = value => value === 5;

        expect(arr.filter(pred).length).to.equal(0);

        const list = new LinkedList<number>(arr);

        expect(list.filter(pred).length).to.equal(0);
      });
      it('provides an index parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => value.a === 2 && index > 1;

        expect(arr.filter(pred)).to.deep.equal([{a: 2, b: 'x'}]);

        const list = new LinkedList<Obj>(arr);
        const result = list.filter(pred);
        const expected = new LinkedList<Obj>([{a: 2, b: 'x'}]);

        expectEqual(result, expected);
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];

        expect(arr.filter((value, index, theArray) => value.a === 2 && theArray[index].b === 'x')).to.deep.equal([{
          a: 2,
          b: 'x'
        }]);

        const list = new LinkedList<Obj>(arr);
        const expected = new LinkedList<Obj>([{a: 2, b: 'x'}]);
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

        const expected = new LinkedList<Obj>([{a: 2, b: 'x'}]);
        const result = myObj.list.filter(pred, myObj);

        expectEqual(result, expected);

        //
        // missing myObj results in an exception
        //
        expect(() => myObj.arr.find(pred)).to.throw();
        expect(() => myObj.list.find(pred)).to.throw();
      });
    });
    describe('every', () => {
      it('returns true if every element matches the predicate, just like Array', () => {
        const arr = [1, 2, 3, 4];
        const pred = value => value < 5;

        expect(arr.every(pred)).to.be.true;

        const list = new LinkedList<number>(arr);
        expect(list.every(pred)).to.be.true;
      });
      it('returns false if one element does not match the predicate, just like Array', () => {
        const arr = [1, 2, 3, 4];
        const pred = value => value === 1;

        expect(arr.every(pred)).to.be.false;

        const list = new LinkedList<number>(arr);
        expect(list.every(pred)).to.be.false;
      });
      it('returns true on empty list just like Array', () => {
        const arr = [];
        const pred = value => value === 5;

        expect(arr.every(pred)).to.be.true;

        const list = new LinkedList<number>(arr);
        expect(list.every(pred)).to.be.true;

      });
      it('provides an index parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => _.isNumber(value.b) || index === 3;

        expect(arr.every(pred)).to.be.true;

        const list = new LinkedList<Obj>(arr);
        expect(list.every(pred)).to.be.true;
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const arrPred = (value, index, theArray) => _.isNumber(theArray[index].b) || theArray[index].b === 'x';

        expect(arr.every(arrPred)).to.be.true;

        const list = new LinkedList<Obj>(arr);
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
        const arr = [1, 2, 3, 4];
        const pred = value => value == 3;

        expect(arr.some(pred)).to.be.true;

        const list = new LinkedList<number>(arr);
        expect(list.some(pred)).to.be.true;
      });
      it('returns false if no element matches the predicate, just like Array', () => {
        const arr = [1, 2, 3, 4];
        const pred = value => value === 5;

        expect(arr.some(pred)).to.be.false;

        const list = new LinkedList<number>(arr);
        expect(list.some(pred)).to.be.false;
      });
      it('returns false on empty list just like Array', () => {
        const arr = [];
        const pred = value => value === 5;

        expect(arr.some(pred)).to.be.false;

        const list = new LinkedList<number>(arr);
        expect(list.some(pred)).to.be.false;

      });
      it('provides an index parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const pred = (value, index) => index === 2;

        expect(arr.some(pred)).to.be.true;

        const list = new LinkedList<Obj>(arr);
        expect(list.some(pred)).to.be.true;
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        const arrPred = (value, index, theArray) => _.isNumber(theArray[index].b) || theArray[index].b === 'x';

        expect(arr.some(arrPred)).to.be.true;

        const list = new LinkedList<Obj>(arr);
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
        const arr = [1, 2, 3, 4];
        let result = 0;

        function sum(value) {
          result += value;
        }

        arr.forEach(sum);
        expect(result).to.equal(10);

        const list = new LinkedList<number>(arr);
        result = 0;
        list.forEach(sum);
        expect(result).to.equal(10);
      });
      it('does nothing on an empty list, just like Array', () => {
        const arr = [];
        let result = true;

        function cb() {
          result = false;
        }

        arr.forEach(cb);
        expect(result).to.be.true;

        const list = new LinkedList<number>(arr);

        list.forEach(cb);
        expect(result).to.be.true;
      });
      it('provides an index parameter to the callback, just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        let result = -1;

        arr.forEach((value, index) => result = index);
        expect(result).to.equal(3);

        const list = new LinkedList<Obj>(arr);

        result = -1;
        list.forEach((value, index) => result = index);
        expect(result).to.equal(3);
      });
      it('provides the list parameter to the predicate just like Array', () => {
        const arr: Obj[] = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 3, b: 3}, {a: 2, b: 'x'}];
        let result: number | string = -1;

        arr.forEach((value, index, theArray) => result = theArray[index].b);
        expect(result).to.equal('x');

        const list = new LinkedList<Obj>(arr);
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

    describe('speed', () => {
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
          const list = insertList(count);
          const end = hrtime.bigint();

          expect(list.length).to.equal(count);

          return Number(end - start) / 1_000_000;    // return milliseconds
        };

        const runArray = (): number => {
          //
          // measure array insert
          //
          const start = hrtime.bigint();
          const arr = insertArray(count);
          const end = hrtime.bigint();

          expect(arr.length).to.equal(count);

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
      it('retrieves (shifts) much faster than arrays', function () {
        this.timeout(20_000);   // event loop is blocked, so this only affects the end
        const count = 200_000;
        const speedFactor = 300;   // much faster than this, but affected by coverage

        const runList = (): number => {
          const list = appendList(count);     // build the list quickly

          //
          // measure shift retrieval
          //
          const start = hrtime.bigint();
          for (let ii = 0; ii < count; ii++) {
            list.shift();
          }
          const end = hrtime.bigint();
          expect(list.length).to.equal(0);

          return Number(end - start) / 1_000_000;    // return milliseconds
        };

        const runArray = (): number => {
          const arr = appendArray(count);     // build the array quickly

          //
          // measure shift retrieval
          //
          const start = hrtime.bigint();
          for (let ii = 0; ii < count; ii++) {
            arr.shift();
          }
          const end = hrtime.bigint();
          expect(arr.length).to.equal(0);

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

