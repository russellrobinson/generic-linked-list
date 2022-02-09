/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

/**
 * A node in a singly-linked list that is only readable.
 */
class ReadonlyLinkedListNode<T> {
  protected _value: Readonly<T>;
  protected _next: ReadonlyLinkedListNode<T> | undefined;

  constructor(value: T) {
    this._value = value;
    this._next = undefined;
  }

  get value(): Readonly<T> {
    return this._value;
  }

  get next(): ReadonlyLinkedListNode<T> | undefined {
    return this._next;
  }
}

/**
 * A node in a singly-linked list, whose link can be changed.
 */
class LinkedListNode<T> extends ReadonlyLinkedListNode<T> {
  /**
   * Need to re-define because it won't get inherited.
   */
  get next(): LinkedListNode<T> | undefined {
    return this._next;
  }

  set next(next: LinkedListNode<T> | undefined) {
    this._next = next;
  }
}

/**
 * A node in a doubly-linked list.
 class DoubleLinkedListNode<T> extends LinkedListNode<T> {
  private _prev: DoubleLinkedListNode<T> | undefined;

  constructor(value: T) {
    super(value);
    this._prev = undefined;
  }

  get prev(): DoubleLinkedListNode<T> | undefined {
    return this._prev;
  }

  set prev(prev: DoubleLinkedListNode<T> | undefined) {
    this._prev = prev;
  }
}
 */


class ListIterator<T> {
  protected _next: ReadonlyLinkedListNode<T> | undefined;

  constructor(root: ReadonlyLinkedListNode<T> | undefined) {
    this._next = root;
  }

  next(): IteratorResult<T> {
    let result;

    if (this._next !== undefined) {
      result = {value: this._next.value};
      this._next = this._next.next;
    } else {
      result = {done: true};
    }
    return result;
  }

  /**
   * Return ourself.  Illogical, but this is how Array works.
   * A better implementation would be to return a new iterator that begins from the current position.
   */
  [Symbol.iterator]() {
    return this;
  }
}

/**
 * The type for any predicate function we support.
 * Modelled after the predicates supported by Array.
 */
export type LinkedListPredicate<T> = (value: T, index: number, list: LinkedList<T>) => boolean;

/**
 * The type for any callback function we support.
 * Modelled after the callback function defined for Array.forEach.
 */
export type LinkedListCallback<T> = (value: T, index: number, list: LinkedList<T>) => void

/**
 * Internal function type for processing a value in the list.
 * @returns true if the iteration is to continue, or false to terminate the iteration
 */
type IterationFunction<T> = (value: T, index: number) => boolean;

/**
 * Get the type of T for a LinkedList.
 * See: https://stackoverflow.com/questions/18215899/get-type-of-generic-parameter
 * However, it only works if you can create an instance of T, and there's no way to achieve that.
 */
// type GetLinkedListT<C extends LinkedList<unknown>> = C extends LinkedList<infer T> ? T : unknown;

/**
 * Implementation of a generic singly-linked Linked List.
 * Ideal to replace large arrays where you:
 *  - insert at the beginning (unshift)
 *  - append to the end (push)
 *  - remove from the beginning (shift)
 * as these operations are O(1) for a linked list, but O(n) for array shift and unshift.
 * Unit tests show 3 orders of magnitude speed increase over Array, which is significant for
 * arrays with tens-of-thousands of elements or more.
 * Note that a fast "pop" requires a doubly-linked list.
 */
export class LinkedList<T, N extends LinkedListNode<T> = LinkedListNode<T>> implements Iterable<T> {
  private _root: LinkedListNode<T> | undefined;
  protected _end: LinkedListNode<T> | undefined;
  protected _length: number;

  /**
   * Construct the linked list, and optional initialise it via the given iterator.
   * @param it    any iterable of T's with which you want to initialise the list
   */
  constructor(it?: Iterable<T>) {
    this._root = this._end = undefined;
    this._length = 0;
    if (it !== undefined) {
      for (const t of it) {
        this.push(t);
      }
    }
  }

  /**
   * Create a node or element in the linked list
   * @param value   the value at the element
   * @protected
   */
  protected _createNode(value: T): LinkedListNode<T> {
    return new LinkedListNode<T>(value);
  }

  /**
   * Append to the end of a list
   * @param valueList a set of values to append to the list
   * @returns the new length of the list
   */
  public push(...valueList: T[]): number {
    for (const value of valueList) {
      const node = this._createNode(value);
      if (this._root === undefined) {
        if (this._length !== 0) {
          throw Error('LinkedList.push logic failure (length > 0)!');
        }

        this._root = node;
        this._end = this._root;
      } else {
        if (this._end === undefined) {
          throw Error('LinkedList.push logic failure (end is undefined)!');
        }

        this._end.next = node;
        this._end = node;
      }
      this._length++;
    }
    return this._length;
  }

  /**
   * Insert at the beginning of a list
   * @param valueList
   * @returns the new length of the list
   */
  public unshift(...valueList: T[]): number {
    //
    // Array.unshift inserts as a block, so we simulate this by accessing the valueList in reverse order
    //
    for (let ii = valueList.length; --ii >= 0;) {
      const value = valueList[ii];
      const node = this._createNode(value);
      node.next = this._root;
      this._root = node;
      this._length++;
    }
    return this._length;
  }

  /**
   * Remove the first element from the list.
   * @returns the element removed from the front of the list, or undefined if the list is empty
   */
  public shift(): T | undefined {
    let result: T | undefined = undefined;

    if (this._length !== 0) {
      if (this._root === undefined) {
        throw Error('LinkedList.shift logic failure (root is undefined)!');
      }

      result = this._root.value;
      this._root = this._root.next;

      if (this._root === undefined) {
        //
        // List is now empty
        //
        this._end = undefined;
        if (this._length !== 1) {
          throw Error('LinkedList.shift logic failure (length is wrong)!');
        }
      }
      this._length--;
    }
    return result;
  }

  /**
   * Get the length of the list.
   * @returns the length of the list
   */
  get length(): number {
    return this._length;
  }

  /**
   * Return an iterator for the list
   */
  [Symbol.iterator]() {
    return new ListIterator<T>(this._root);
  }

  /**
   * Test if the given value is a LinkedList<T>.  Note that the <T> cannot be checked in Typescript
   * and you must rely on other Typescript techniques to confirm matching types for the elements.
   * @param maybeList   the value to test
   * @returns true if the value is a LinkedList
   */
  public static isLinkedList<T>(maybeList: unknown): maybeList is LinkedList<T> {
    return maybeList instanceof LinkedList;
  }

  /**
   * The values of the list (just an iterator).
   * @returns an iterator for the list
   */
  public values(): ListIterator<T> {
    return new ListIterator<T>(this._root);
  }

  /**
   * Perform the given action on each value of the list provided the predicate function returns true.
   * @param action      the action to perform if the predicate is true; a return value of false terminates the iteration
   * @param predicate   a function whose return value determines whether to perform the action
   * @param thisArg     optional "this" value to bind to the predicate
   * @param falseAction the action to perform if the predicate is false; a return value of false terminates the iteration
   * @protected
   */
  protected _iteratePredicate(action: IterationFunction<T>, predicate: LinkedListPredicate<T>, thisArg?: any, falseAction?: IterationFunction<T>): void {
    const callPredicate = predicate.bind(thisArg);
    let index = 0;

    for (const value of this) {
      let callAction: IterationFunction<T> = () => true;

      if (callPredicate(value, index, this)) {
        callAction = action;
      } else if (falseAction !== undefined) {
        callAction = falseAction;
      }
      if (!callAction(value, index)) {
        break;
      }
      index++;
    }
  }

  /**
   * Find the first element in the list where the predicate function returns true.
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param predicate a function to test each element in the list
   * @param thisArg   a "this" value to bind to the predicate function
   */
  public find(predicate: LinkedListPredicate<T>, thisArg?: any): T | undefined {
    let result: T | undefined = undefined;

    this._iteratePredicate(value => {
      result = value;   // this is the return value
      return false;     // and stop the loop
    }, predicate, thisArg);

    return result;
  }

  /**
   * Find the first element in the list where the predicate function returns true and return the index of the element.
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param predicate a function to test each element in the list
   * @param thisArg   a "this" value to bind to the predicate function
   */
  public findIndex(predicate: LinkedListPredicate<T>, thisArg?: any): number {
    let result: number = -1;

    this._iteratePredicate((value, index) => {
      result = index;   // this is the return value
      return false;     // and stop the loop
    }, predicate, thisArg);

    return result;
  }

  /**
   * Find the first element in the list where the given value === the list value, and return the index.
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param testValue   the value to find in the list
   * @returns the index of the first list element that is === to testValue, or -1 if no such list element is found
   */
  public indexOf(testValue: T): number {
    let result: number = -1;

    this._iteratePredicate((value, index) => {
      result = index;   // this is the return value
      return false;     // and stop the loop
    }, listValue => listValue === testValue);

    return result;
  }

  /**
   * Implements the sameValueZero algorithm described here:
   *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#abstract_equality_strict_equality_and_same_value_in_the_specification
   *  - https://262.ecma-international.org/5.1/#sec-9.12
   * @param lhs   the left hand side of the equality test
   * @param rhs   the left hand side of the equality test
   * @returns true if lhs and rhs have the same value as defined by the sameValueZero algorithm
   */
  public static sameValueZero(lhs: unknown, rhs: unknown): boolean {
    let result = lhs === rhs;

    if (!result) {
      if (Number.isNaN(lhs) && Number.isNaN(rhs)) {
        result = true;
      }
    }
    return result;
  }

  /**
   * Test if the list contains the given value, ujsing the sameValueZero algorithm for comparison.
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param testValue the value to look for in the list
   * @returns true if the list includes the given value
   */
  public includes(testValue: T): boolean {
    let result = false;

    this._iteratePredicate(() => {
      result = true;   // this is the return value
      return false;     // and stop the loop
    }, listValue => LinkedList.sameValueZero(listValue, testValue));

    return result;
  }

  /**
   * Filter the list and return a new list with the elements for which the predicate function returns true.
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns a new linked list with the just the elements that satisfied the predicate
   */
  public filter(predicate: LinkedListPredicate<T>, thisArg?: any): LinkedList<T> {
    const result = new LinkedList<T>();

    this._iteratePredicate(value => {
      result.push(value); // add this matched value to the result
      return true;        // continue loop to end
    }, predicate, thisArg);

    return result;
  }

  /**
   * Return the value at the given index in the list.
   * Unlike Array, negative indexes are not supported and throw an exception.
   * This is much slower than an array, but is still useful.
   * @returns the element at the given index or undefined
   */
  public at(index: number): T | undefined {
    if (index < 0) {
      throw Error('LinkedList.at method does not support negative numbers');
    }
    let result: T | undefined = undefined;

    this._iteratePredicate(value => {
      result = value;   // this is the value at the index
      return false;     // terminate the loop
    }, (value, loopIndex) => loopIndex === index);
    return result;
  }

  /**
   * Iterate over the elements calling the given function on each value.
   * Unfortunately, lodash has a function for this, but it isn't generic enough to accept any iterator.
   * @param callback    a function to call for each element in the list
   * @param thisArg     a "this" value to bind to the callback function
   * @returns the linked list itself
   */
  public forEach(callback: LinkedListCallback<T>, thisArg?: any): LinkedList<T> {
    const callCallback = callback.bind(thisArg);
    let index = 0;

    for (const value of this) {
      callCallback(value, index, this);
      index++;
    }
    return this;
  }

  /**
   * Test if each element of the list returns true for the given predicate function .
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns true if all elements obey the predicate, otherwise false
   */
  public every(predicate: LinkedListPredicate<T>, thisArg?: any): boolean {
    let result: boolean = true;       // return true on an empty list

    this._iteratePredicate(() => {
        result = true;      // predicate is true, so we keep being true
        return true;        // continue loop to end
      },
      predicate,
      thisArg,
      () => {
        result = false; // predicate is fails, so we fail with false
        return false;   // stop looping, since we have the result
      });

    return result;
  }

  /**
   * Test if at least one element of the list returns true for the given predicate function .
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns true if at least one element obeys the predicate, otherwise false
   */
  public some(predicate: LinkedListPredicate<T>, thisArg?: any): boolean {
    let result: boolean = false;       // return false on an empty list

    this._iteratePredicate(() => {
        result = true;      // predicate is true, so the resut is true
        return false;        // stop looping, since we have the result
      },
      predicate,
      thisArg);

    return result;
  }

  /**
   * Concatenate values onto the end of the list.
   * Unfortunately, lodash has a function for this, but it isn't generic enough to accept any iterator.
   * @param values options values to concatenate; each value can be a T or a LinkedList<T>
   * @returns a new list
   */
  public concat(...values: (T | LinkedList<T>)[]): LinkedList<T> {
    let result: LinkedList<T> = new LinkedList<T>(this);

    values.forEach(value => {
      if (LinkedList.isLinkedList<T>(value)) {
        for (const elem of value) {
          result.push(elem as T);
        }
      } else {
        result.push(value as T);
      }
    });
    return result;
  }

  /* TODO
   lastIndexOf - probably only for DoublyLinkedList
   map
   join
   flat
   flatMap
   from
   reduce
   reduceRight
   slice
   toString
   */
}
