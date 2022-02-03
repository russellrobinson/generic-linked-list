/*
 * Copyright (c) 2021 Cooltrax Pty Limited
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

