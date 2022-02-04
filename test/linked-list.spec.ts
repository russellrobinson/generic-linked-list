/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

import { expect } from 'chai';
import { hrtime } from 'process';
import { LinkedList } from '../src/linked-list';

describe('linked-list', () => {
  describe('LinkedList', () => {
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

    it('instantiates', () => {
      const list = new LinkedList<number>();

      expect(list.length).to.equal(0);
      expect(list.shift()).to.be.undefined;
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
      it('works with nested iterators', () => {
        const count = 100;
        const list = insertList(count);
        let index = 0;

        for (const value1 of list) {

          expect(value1).to.equal(index++);
          let position = index;
          for (const value2 of list) {
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

    describe('speed', () => {
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

