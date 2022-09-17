/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

/**
 * A node in a singly-linked list that is only readable.
 *
 * @typeParam T    the type of each value in the list
 */
export class ReadonlyLinkedListNode<T> {
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
 *
 * @typeParam T    the type of each value in the list
 */
export class LinkedListNode<T> extends ReadonlyLinkedListNode<T> {
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

/**
 * Implements an iterator for a Linked List that obeys the [Iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol).
 *
 * @typeParam T    the type of each value in the list
 */
export class ListIterator<T> {
  /**
   * The next item in the iteration.
   * @protected
   * @internal
   */
  protected _next: ReadonlyLinkedListNode<T> | undefined;

  constructor(root: ReadonlyLinkedListNode<T> | undefined) {
    this._next = root;
  }

  /**
   * Returns the next item in the iteration.
   */
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
   * Return the current iterator.
   * This seems illogical, but this is how Array IterableIterators work, so we need to be compatible.
   * Perhaps a better implementation would be to return a new iterator that begins from the current position.
   */
  [Symbol.iterator]() {
    return this;
  }
}

/**
 * The type for any predicate function we support.
 * Modelled after the predicates supported by Array.
 *
 * The predicate function is called with 3 parameters:
 * - `value` is the value of the element in the list
 * - `index` is the position of that value in the list, with 0 being the first index
 * - `list` is the linked list itself
 *
 * The predicate function returns `true` if the predicate is successful, or `false` otherwise.
 *
 * @typeParam T    the type of each value in the list
 */
export type LinkedListPredicate<T> = (value: T, index: number, list: LinkedList<T>) => boolean;

/**
 * The type for any callback function we support.
 * Modelled after the callback function defined for Array.forEach.
 *
 * The function is called with 3 parameters:
 * - `value` is the value of the element in the list
 * - `index` is the position of that value in the list, with 0 being the first index
 * - `list` is the linked list itself
 *
 * @typeParam T    the type of each value in the list
 */
export type LinkedListCallback<T> = (value: T, index: number, list: LinkedList<T>) => void

/**
 * Internal function type for processing a value in the list.
 *
 * @typeParam T    the type of each value in the list
 * @returns `true` if the iteration is to continue, or `false` to terminate the iteration
 * @internal
 */
type IterationFunction<T> = (value: T, index: number) => boolean;

/**
 * Get the type of `T` for a LinkedList.
 * See: https://stackoverflow.com/questions/18215899/get-type-of-generic-parameter
 * However, it only works if you can create an instance of T, and there's no way to achieve that.
 */
// type GetLinkedListT<C extends LinkedList<unknown>> = C extends LinkedList<infer T> ? T : unknown;

/**
 * LinkedList is an implementation of a singly-linked [Linked List](https://en.wikipedia.org/wiki/Linked_list)
 * using generics.
 *
 * It's designed as a mostly drop-in replacement for arrays where you perform the following operations:
 *  - insert at the beginning (unshift)
 *  - append to the end (push)
 *  - remove from the beginning (shift)
 *
 * These operations are O(1) for a linked list, but O(n) for array shift and unshift.
 * Array push is mostly O(1), but can be O(n) with large arrays due to reallocation of
 * the array's memory internally.
 *
 * Unit tests show 3 orders of magnitude speed increase over Array, which is significant for
 * large arrays.
 *
 * ## Comparison with Array
 * LinkedList is designed as a drop-in replacement for Array and implements most of the same methods as Array.
 * The unit tests specifically compare the operation of Array methods with LinkedList methods, to ensure
 * compatibility.
 *
 * However, a singly-linked list cannot easily or efficiently perform certain operations that you can with an Array, such as:
 *  - `at`, `indexOf`, `includes` - fully supported except with negative indexes
 *  - `lastIndexOf`, `sort` - cannot be efficiently implemented and are excluded
 *  - `keys` - has no meaning in a LinkedList and is not implemented
 *  - `reverse` - cannot be implemented with a singly-linked list (needs to be converted to an array first)
 *
 * ### Workaround
 * For missing methods or features, you can convert your LinkedList to an Array and perform the operation on that
 * Array.
 * For example:
 * ```typescript
 * const list = new LinkedList<number>();
 * list.push(1, 2, 3, 4, 5, 5, 5);
 * const arr = [...list];
 * console.log(arr.indexOf(5, -2));   // output is 5
 * ```
 *
 * ### Missing Methods
 * Depending on the version of the `generic-linked-list` package, some methods that can be implemented may not
 * _yet_ be implemented.  In this case, convert your list to an array and use array methods instead.
 * See the above **Workaround** section for an example of how to achieve this.
 *
 * ## Use cases
 *  1. To replace very large arrays (10's or 100's of thousands of elements).
 *  2. Implementing a FIFO queue (i.e. where you add elements at one end remove them from the other end).  This is slow for large arrays.
 *  3. Insert operations in the middle of the list (which is slow in large arrays).
 *
 * ## Examples
 *  ```typescript
 *  const myNumberList = new LinkedList<number>();    // an empty list of numbers
 *  myNumberList.push(1, 2, 3);                       // append to the list
 *  const firstValue = myNumberList.shift();          // remove the first element
 *  console.log(firstValue);                          // outputs: 1
 *  console.log(...myNumberList);                     // outputs: 2 3
 *
 *  // Build a list people.
 *  type Person = {name: string, age: number};
 *  const peopleList = new LinkedList<Person>();
 *  peopleList.push({name: 'John', age: 12}, {name: 'Kylie', age: 14});
 *  console.log(...peopleList);
 *
 *  // convert to an array
 *  const peopleArray = [...peopleList];
 *  console.log(peopleArray);
 *  ```
 *
 *  @typeParam T    the type of each value in the list
 */
export class LinkedList<T> implements Iterable<T> {
  /**
   * The node at the beginning of the list.
   * @protected.
   * @internal
   */
  private _root: LinkedListNode<T> | undefined;
  /**
   * The node at the end of the list.
   * @protected.
   * @internal
   */
  protected _end: LinkedListNode<T> | undefined;
  protected _length: number;

  /**
   * Construct the linked list, and optionally load its contents using the given iterator.
   * @param it    any iterable of T's with which you want to load the list
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
   * @internal
   */
  protected _createNode(value: T): LinkedListNode<T> {
    return new LinkedListNode<T>(value);
  }

  /**
   * Append to the end of a list.
   * @param valueList a set of values to append to the list
   * @returns the new length of the list
   *
   * #### Complexity: O(n) where n is the number of values being appended - typically O(1)
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
   *
   * #### Complexity: O(n) where n is the number of values being inserted - typically O(1)
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
   * @returns the element removed from the front of the list, or `undefined` if the list is empty
   *
   * #### Complexity: O(1)
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
   * The length is maintained internally, so there is no cost to this request.
   * @returns the length of the list
   *
   * #### Complexity: O(0)
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
   * Test if the given value is a LinkedList.
   *
   * Note that the `T` generic type's parameter cannot be checked in Typescript
   * and you must use other Typescript techniques to confirm matching types for the elements.
   *
   * @param maybeList   the value to test
   * @returns `true` if the value is a LinkedList
   */
  public static isLinkedList<T>(maybeList: unknown): maybeList is LinkedList<T> {
    return maybeList instanceof LinkedList;
  }

  /**
   * The values of the list (as an iterator).
   * @returns an iterator for the list
   */
  public values(): ListIterator<T> {
    return new ListIterator<T>(this._root);
  }

  /**
   * Perform the given action on each value of the list provided the predicate function returns `true`.
   * @param action      the action to perform if the predicate is `true`; a return value of `false` terminates the iteration
   * @param predicate   a function whose return value determines whether to perform the action
   * @param thisArg     optional "this" value to bind to the predicate
   * @param falseAction the action to perform if the predicate is `false`; a return value of `false` terminates the iteration
   * @protected
   * @internal
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
   * Find the first element in the list where the predicate function returns `true`.
   * @param predicate a function to test each element in the list
   * @param thisArg   a "this" value to bind to the predicate function
   * @returns the found element or undefined if not found
   *
   * #### Complexity: O(n) where n is the size of the linked list
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
   * Find the first element in the list where the predicate function returns `true` and return the index of the element.
   * @param predicate a function to test each element in the list
   * @param thisArg   a "this" value to bind to the predicate function
   * @returns the position in the list of the found element or -1 if not found
   *
   * #### Complexity: O(n) where n is the size of the linked list
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
   * @param testValue   the value to find in the list
   * @param fromIndex   the index from which to start the search; -ve numbers are not supported and throw an exception
   * @returns the index of the first list element that is === to testValue, or -1 if no such list element is found
   *
   * #### Complexity: O(n) where n is the size of the linked list
   */
  public indexOf(testValue: T, fromIndex = 0): number {
    let result: number = -1;

    if (fromIndex < 0) {
      throw Error('LinkedList.indexOf does not support a negative fromIndex');
    }
    this._iteratePredicate((value, index) => {
      if (index >= fromIndex) {
        result = index;   // this is the return value
        return false;     // and stop the loop
      } else {
        return true;      // continue the loop
      }
    }, listValue => listValue === testValue);

    return result;
  }

  /**
   * Implements the sameValueZero algorithm described here:
   *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#abstract_equality_strict_equality_and_same_value_in_the_specification
   *  - https://262.ecma-international.org/5.1/#sec-9.12
   * @param lhs   the left hand side of the equality test
   * @param rhs   the left hand side of the equality test
   * @returns `true` if lhs and rhs have the same value as defined by the sameValueZero algorithm
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
   * Test if the list contains the given value, using the sameValueZero algorithm for comparison.
   * @param testValue   the value to look for in the list
   * @param fromIndex   the index from which to start the search; -ve numbers are not supported and throw an exception
   * @returns `true` if the list includes the given value
   *
   * #### Complexity: O(n) where n is the size of the linked list
   */
  public includes(testValue: T, fromIndex = 0): boolean {
    let result = false;

    if (fromIndex < 0) {
      throw Error('LinkedList.includes does not support a negative fromIndex');
    }
    this._iteratePredicate((value, index) => {
      if (index >= fromIndex) {
        result = true;    // this is the return value
        return false;     // and stop the loop
      } else {
        return true;      // continue the loop
      }
    }, listValue => LinkedList.sameValueZero(listValue, testValue));

    return result;
  }

  /**
   * Filter the list and return a new list with the elements for which the predicate function returns `true`.
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns a new linked list with just the elements that satisfied the predicate
   *
   * #### Complexity: O(n) where n is the size of the linked list
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
   *
   * Unlike Array, negative indexes are not supported and throw an exception.
   *
   * In general, this method is much slower than an array, but is still useful if you need to work with
   * positions within the list.
   *
   * However, if this is a major part of your use case and your list is large, then you should probably
   * consider a different data structure.
   *
   * Getting the first element in the queue is instant.
   *
   * @returns the element at the given index or `undefined`
   *
   * #### Complexity: O(n) where n is the index you've requested.
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
   * @param callback    a function to call for each element in the list
   * @param thisArg     a "this" value to bind to the callback function
   * @returns the linked list itself
   *
   * #### Complexity: O(n) where n is the size of the linked list
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
   * Test if each element of the list returns `true` for the given predicate function .
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns `true` if all elements obey the predicate, otherwise `false`
   *
   * #### Complexity: O(n) where n is the size of the linked list
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
   * Test if at least one element of the list returns `true` for the given predicate function .
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns `true` if at least one element obeys the predicate, otherwise false
   *
   * #### Complexity: O(n) where n is the size of the linked list
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
   * @param values options values to concatenate; each value can be a `T` or a `LinkedList<T>`
   * @returns a new list
   *
   * #### Complexity: O(n) where n is the number of values being appended - typically O(1)
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

  /**
   * Return a string representation of the list and its elements
   */
  public toString(): string {
    const valueList: string[] = [];

    this.forEach(value => {
      valueList.push(JSON.stringify(value));
    });

    return valueList.join(',');
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
