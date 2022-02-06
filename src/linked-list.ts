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
 * A node in a singly-linked list.
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
 * Internal function type for processing each value in the list.
 * @returns true if the iteration is to continue, or false to terminate the iteration
 */
type IterationFunction<T> = (value: T) => boolean;

/**
 * Implementation of a simple generic singly-linked Linked List.
 * Ideal to replace large arrays where you:
 *  - insert at the beginning (unshift)
 *  - append to the end (push)
 *  - remove from the beginning (shift)
 * as these operations are O(1) for a linked list, but O(n) for array shift and unshift.
 * Note that a fast "pop" requires a doubly-linked list.
 */
export class LinkedList<T, N extends LinkedListNode<T> = LinkedListNode<T>> implements Iterable<T> {
  private _root: LinkedListNode<T> | undefined;
  protected _end: LinkedListNode<T> | undefined;
  protected _length: number;

  /**
   * Construct the linked list, and optional initialise it via the given iterator.
   * @param it
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

  protected _createNode(value: T): LinkedListNode<T> {
    return new LinkedListNode<T>(value);
  }

  /**
   * Append to the end of a list
   * @param valueList
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
   * @returns the new length of the list
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
   * The values of the list (just an iterator).
   */
  public values(): ListIterator<T> {
    return new ListIterator<T>(this._root);
  }

  /**
   * Perform the given action on each value of the list provided the predicate function returns true.
   * @param action      the action to perform; a return value of false terminates the iteration
   * @param predicate   a function whose return value determines whether to perform the action
   * @param thisArg     optional "this" value to bind to the predicate
   * @protected
   */
  protected _iteratePredicate(action: IterationFunction<T>, predicate: LinkedListPredicate<T>, thisArg?: any): void {
    const callPredicate = predicate.bind(thisArg);
    let index = 0;

    for (const value of this) {
      if (callPredicate(value, index, this)) {
        if (!action(value)) {
          break;
        }
      }
      index++;
    }
  }

  /**
   * Find the first element in the list where the predicate function returns true.
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param predicate
   * @param thisArg
   */
  public find(predicate: LinkedListPredicate<T>, thisArg?: any): T | undefined {
    const callPredicate = predicate.bind(thisArg);
    let result: T | undefined = undefined;
    let index = 0;

    for (const value of this) {
      if (callPredicate(value, index, this)) {
        result = value;
        break;
      }
      index++;
    }
    return result;
  }

  /**
   * Filter the list and return a new list with the elements for which the predicate function returns true.
   * Could be implemented by converting to an array first, and then calling the Array's method.
   * This is faster.
   * @param predicate
   * @param thisArg
   */
  public filter(predicate: LinkedListPredicate<T>, thisArg?: any): LinkedList<T> {
    const callPredicate = predicate.bind(thisArg);
    const result = new LinkedList<T>();
    let index = 0;

    for (const value of this) {
      if (callPredicate(value, index, this)) {
        result.push(value);
      }
      index++;
    }
    return result;
  }

  /* TODO
   indexOf
   lastIndexOf
   some
   map
   join
   forEach
   includes
   every
   concat
   flat
   flatMap
   at
   from
   reduce
   reduceRight
   slice
   toString
   */
}
