/*
 * Copyright (c) 2022 Russell Robinson <russellr@openconcepts.com.au>
 */

/**
 * A node in a singly-linked list, whose link and value can be changed.
 *
 * @typeParam T    the type of each value in the list
 */
export class LinkedListNode<T> {
  private _value: T;
  protected _next: LinkedListNode<T> | undefined;

  constructor(value: T) {
    this._value = value;
    this._next = undefined;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }

  get next(): LinkedListNode<T> | undefined {
    return this._next;
  }

  set next(next: LinkedListNode<T> | undefined) {
    this._next = next;
  }
}

/**
 * A node in a singly-linked list that is only readable.
 *
 * @typeParam T    the type of each value in the list
 */
export type ReadonlyLinkedListNode<T> = Readonly<LinkedListNode<T>>;

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
 * Implements an iterator for a Linked List including the element index,
 * that obeys the
 * [Iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol).
 *
 * @typeParam T    the type of each value in the list
 */
export class ListIteratorWithIndex<T> {
  /**
   * The next item in the iteration.
   * @protected
   * @internal
   */
  protected _next: ReadonlyLinkedListNode<T> | undefined;
  protected _index: number;

  constructor(root: ReadonlyLinkedListNode<T> | undefined) {
    this._next = root;
    this._index = 0;
  }

  /**
   * Returns the next item in the iteration.
   */
  next(): IteratorResult<[number, T]> {
    let result;

    if (this._next !== undefined) {
      result = {value: [this._index, this._next.value]};
      this._next = this._next.next;
      this._index++;
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
 * The type for a callback function used in the `map` method.
 * Modelled after the callback function defined for `Array.map`.
 *
 * The function is called with 3 parameters:
 * - `value` is the value of the element in the list
 * - `index` is the position of that value in the list, with 0 being the first index
 * - `list` the LinkedList the `map()` was called on
 *
 * @typeParam T    the type of each value in the original list
 * @typeParam U    the type returned by the callback
 * @see LinkedList.map
 */
export type MapCallback<T, U> = (value: T, index: number, list: LinkedList<T>) => U;

/**
 * The type for a callback function used in the `reduce` method.
 * Modelled after the callback function defined for `Array.reduce`.
 *
 * The function is called with 3 parameters:
 * - `accumulator` is the value resulting from the previous call to the function
 * - `currentValue` the value of the current element in the list
 * - `currentIndex` the index position of `currentValue` in the list
 * - `list` the list upon which `reduce` was called
 *
 * @typeParam T    the type of each value in the original list
 * @typeParam U    the type returned by the callback
 * @see LinkedList.reduce
 */
export type ReduceCallback<T> = (accumulator: T, currentValue: T, currentIndex: number, list: LinkedList<T>) => T;

/**
 * Internal function type for processing a value in the list.
 *
 * @typeParam T    the type of each value in the list
 * @returns `true` if the iteration is to continue, or `false` to terminate the iteration
 * @internal
 */
type IterationFunction<T> = (value: T, index: number) => boolean;

/**
 * The maximum integer allowed to provide the linked list length in a constructor.
 * This mirrors the Array documentation here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array
 */
const MAX_CONSTRUCTOR_LENGTH = (2 ** 32) - 1;

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
 * It's designed as a mostly drop-in replacement for arrays where you want to perform the following operations
 * on large lists:
 *  - insert at the beginning (unshift)
 *  - append to the end (push)
 *  - remove from the beginning (shift)
 *
 * These operations are O(1) for a linked list, but O(n) for array shift and unshift.
 *
 * Array push is extremely fast, and a linked list cannot generally compare because of the additional logic overhead.
 * However, there is an element size and an array/list size threshold where linked list push is comparable to array push.
 *
 * ## Use cases
 *  1. To replace very large arrays (10's or 100's of thousands of elements).
 *  2. Implementing a FIFO queue (i.e. where you add elements at one end remove them from the other end).  This is slow for large arrays.
 *  3. Insert operations in the middle of the list (which is slow in large arrays).
 *
 * ## Feature comparison with Array
 * LinkedList implements most of the same methods as Array.
 * The unit tests specifically compare the operation of Array methods with LinkedList methods, to ensure
 * compatibility.
 *
 * However, a singly-linked list cannot easily or efficiently perform certain operations that you can with an Array, such as:
 *  - `sort`, `reverse`, `reduceRight` - cannot be efficiently implemented and are excluded
 *  - `copyWithin` - not yet implemented
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
 * ### Missing methods
 * Depending on the version of the `generic-linked-list` package, some methods that can be implemented may not
 * _yet_ be implemented.  In this case, convert your list to an array and use array methods instead.
 * See the above **Workaround** section for an example of how to achieve this.
 *
 * For those methods that cannot be implemented without a large performance issue, you should consider
 * a different data structure (such as Array or Map).
 *
 * ## Unit tests
 * This package includes unit tests that demonstrate operational and speed test results clearly.  The push test, however,
 * requires you to start node with `--expose-gc`, therefore, it is disabled.
 *
 * The tests show 3 orders of magnitude speed increase over Array for shift and unshift, which is significant for large arrays.
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
  protected _root: LinkedListNode<T> | undefined;
  /**
   * The node at the end of the list.
   * @protected
   * @internal
   */
  protected _end: LinkedListNode<T> | undefined;
  /**
   * The length of the list.
   * @protected
   * @internal
   */
  protected _length: number;

  /**
   * Construct the linked list, and load its contents as follows:
   *  - if given an integer length, make a list of that length initialised with `undefined` values
   *  - a list of arguments of type T
   *  - any iterable of T
   *  - another LinkedList; this performs a shallow copy of the other list's values
   *
   * If no parameters are provided, an empty list is constructed.
   *
   * In the case of specifying a length, you should declare the list like this: `LinkedList<TYPE | undefined>`
   * where TYPE is the non-undefined type for your linked list elements.
   * Unlike Array, we don't currently support the concept of "empty slots" in linked lists.
   *
   */
  constructor(...args: unknown[]);
  constructor(length: number);
  constructor(...items: T[]);
  constructor(it?: Iterable<T>);
  constructor(list?: LinkedList<T>);
  constructor(...args: unknown[]) {
    this._root = this._end = undefined;
    this._length = 0;
    //
    // now implement the overloads
    //
    let complete = false;

    //
    // check and implement length overload
    //
    if (args.length === 1 && Number.isSafeInteger(args[0])) {
      const maybeLength = args[0] as number;
      if (0 <= maybeLength && maybeLength <= MAX_CONSTRUCTOR_LENGTH) {
        this.grow(maybeLength, undefined as unknown as T);
        complete = true;
      }
    }

    //
    // check and implement list copy
    //
    if (!complete) {
      if (args.length === 1 && LinkedList.isObject(args[0]) && '_root' in (args[0] as any)) {
        const list = args[0] as LinkedList<T>;
        for (const t of list) {
          this.push(t);
        }
        complete = true;
      }
    }

    //
    // check and implement iterator overload
    //
    if (!complete) {
      if (args.length === 1 && LinkedList.isIterable(args[0])) {
        const it = args[0] as Iterable<T>;
        for (const t of it) {
          this.push(t);
        }
        complete = true;
      }
    }

    //
    // otherwise implement items overload
    //
    if (!complete) {
      const items = args as T[];
      for (const t of items) {
        this.push(t);
      }
    }
  }

  /**
   * Return the value at the given index in the list.
   *
   * From version 2.0.0, negative indexes are supported.
   *
   * In general, this method is much slower than an array, but is still useful if you need to work with
   * positions within the list.
   *
   * However, if this is a major part of your use case and your list is large, then you should probably
   * consider a different data structure.
   *
   * Getting the first element in the queue is instant.
   *
   * @returns the element at the given index or `undefined` if the index is beyond the end of the list. `at(0)` will
   * return `undefined` if the list is empty
   *
   * #### Complexity: O(n) where n is the index you've requested.
   */
  public at(index: number): T | undefined {
    let result: T | undefined = undefined;
    const atIndex = index < 0 ? this.length + index : index;

    if (0 <= atIndex && atIndex < this.length) {
      this._iteratePredicate(value => {
        result = value;   // this is the value at the index
        return false;     // terminate the loop
      }, (value, loopIndex) => loopIndex === atIndex);
    }
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
        result.push((value as LinkedList<T>).values());
      } else {
        result.push(value as T);
      }
    });
    return result;
  }

  /**
   * Return the last element in the list.
   * @returns the last element in the list or undefined if the list is empty
   *
   * #### Complexity: O(1)
   */
  public end(): T | undefined {
    return this._end === undefined ? undefined : this._end.value;
  }

  /**
   * Return a new LinkedList interator object that contains the index/value pairs for each in the list.
   * @returns a new LinkedList iterator object
   */
  public entries(): IterableIterator<[number, T]> {
    return new ListIteratorWithIndex<T>(this._root);
  }


  /**
   * Test if each element of the list returns `true` for the given predicate function.
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns `true` if all elements obey the predicate, otherwise `false`
   *
   * #### Complexity: O(n) where n is the length of the linked list
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
   * Fill elements in the list with the given value.
   * This method mutates the list.
   *
   * @param value the value to assign to each element in the list
   * @param start the index of the first element to fill
   * @param end the index of the element to be excluded from filling
   * @returns the modified linked list
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public fill(value: T, start?: number, end?: number): LinkedList<T> {
    const fromIndex = this._computeStartIndex(start);
    const toIndex = this._computeEndIndex(end);

    if (fromIndex < this.length && fromIndex < toIndex) {
      let index = 0;
      let node = this._root;

      while (index < fromIndex) {
        // istanbul ignore next
        if (node === undefined) {
          throw Error('LinkedList.fill logic failure (node is undefined looking for start)!');
        }
        node = node.next;
        index++;
      }
      while (index < toIndex) {
        // istanbul ignore next
        if (node === undefined) {
          throw Error('LinkedList.fill logic failure (node is undefined during fill)!');
        }
        node.value = value;
        node = node.next;
        index++;
      }
    }
    return this;
  }

  /**
   * Filter the list and return a new list with the elements for which the predicate function returns `true`.
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns a new linked list with just the elements that satisfied the predicate
   *
   * #### Complexity: O(n) where n is the length of the linked list
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
   * Find the first element in the list where the predicate function returns `true`.
   *
   * As recommended for `Array.find`, do not mutate the list in your predicate function.
   * Unlike Array, LinkedList does not make any guarantees as to behaviour if you do this.
   *
   * @param predicate a function to test each element in the list
   * @param thisArg   a "this" value to bind to the predicate function
   * @returns the found element or `undefined` if not found

   * #### Complexity: O(n) where n is the length of the linked list
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
   * Find the first element in the list where the predicate function returns `true` and return the index of that element.
   * @param predicate a function to test each element in the list
   * @param thisArg   a "this" value to bind to the predicate function
   * @returns the position in the list of the found element or -1 if not found
   *
   * #### Complexity: O(n) where n is the length of the linked list
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
   * Create a new list with any sub-list elements interpolated into it, recursively up to the specified depth.
   * Sub-lists are expanded and replace the sub-list element in the list.
   *
   * For example,
   * ```
   *   1 -> 2 -> L -> 5 -> 6
   *             |
   *             3 -> 4
   * ```
   * becomes:
   * ```
   *   1 -> 2 -> 3 -> 4 -> 5 -> 6
   * ```
   * @param depth the depth at which to flatten; zero means nothing changes
   * @returns a new linked list with sub-list elements interpolated into it
   *
   * #### Complexity: O(n * d) where n is the length of the linked list, and d is the depth of the recursion
   */
  public flat(depth = 1): RecursiveLinkedList<T> {
    const result: RecursiveLinkedList<T> = new LinkedList<T | RecursiveLinkedList<T>>();
    let node = this._root;

    while (node !== undefined) {
      const value = node.value;
      if (LinkedList.isLinkedList(value) && depth > 0) {
        const subList: RecursiveLinkedList<T> = value.flat(depth - 1) as RecursiveLinkedList<T>;//RecursiveLinkedList.isRecursiveLinkedList<T>(value) ? value.flat(depth - 1) : value;

        for (const value of subList) {
          result.push(value);
        }
      } else {
        result.push(value);
      }
      node = node.next;
    }
    return result;
  }

  /**
   * Create a new LinkedList populated with the results of calling the provided function
   * on every element in the LinkedList and then flattening the list by a depth of 1.
   *
   * It is identical to a map() followed by a `flat` of depth 1 (list.map(...args).flat()),
   * but slightly more efficient than calling those two methods separately.
   *
   * @param callbackFn   the function to call to map each element
   * @param thisArg      a "this" value to bind to the callback function
   * @returns a new linked list with each element being the result of the callback function
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public flatMap(callbackFn: MapCallback<T, T | RecursiveLinkedList<T>>, thisArg?: any): RecursiveLinkedList<T> {
    const callFunc = callbackFn.bind(thisArg);
    const result: RecursiveLinkedList<T> = new LinkedList<T | RecursiveLinkedList<T>>();
    let index = 0;

    for (const value of this) {
      const maybeList = callFunc(value, index, this);

      if (LinkedList.isLinkedList(maybeList)) {
        const subList: RecursiveLinkedList<T> = maybeList as RecursiveLinkedList<T>;

        for (const newValue of subList) {
          result.push(newValue );
        }
      } else {
        result.push(maybeList);
      }
      index++;
    }
    return result;
  }

  /**
   * Iterate over the elements calling the given function on each value.
   * @param callback    a function to call for each element in the list
   * @param thisArg     a "this" value to bind to the callback function
   * @returns the linked list itself
   *
   * #### Complexity: O(n) where n is the length of the linked list
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
   * Create a new LinkedList from a string.
   * The string is split into single characters and each character becomes an element in the list.
   *
   * This behaviour mirrors `Array.from(string)`.
   *
   * @param str
   */
  public static from(str: string): LinkedList<string>;
  /**
   * Create a new LinkedList from a string but map each character to a different value.
   *
   * The string is split into single characters and each character is mapped to another value and the result becomes
   * an element in the list.
   *
   * This behaviour mirrors `Array.from(string)`.
   *
   * @param str
   * @param mapFn   if provided, every character to be added to the list is first passed through this function and the
   *                `mapFn`'s return value is added to the list instead
   * @param thisArg value to use as `this` when executing `mapFn`
   */
  public static from<U = string>(str: string, mapFn: (v: string, k: number) => U, thisArg?: any): LinkedList<U>;
  /**
   * Create a new LinkedList from an array of values.
   *
   * @param arr
   */
  public static from<T>(arr: ArrayLike<T>): LinkedList<T>;
  /**
   * Create a new LinkedList from an array of values, mapping each value to a different value.
   *
   * @param arr
   * @param mapFn   if provided, every value to be added to the list is first passed through this function and the
   *                `mapFn`'s return value is added to the list instead
   * @param thisArg value to use as `this` when executing `mapFn`
   */
  public static from<T, U = T>(arr: ArrayLike<T>, mapFn: (v: T, k: number) => U, thisArg?: any): LinkedList<U>;
  /**
   * Create a new LinkedList from an iterator over some values.
   *
   * @param it
   */
  public static from<T>(it: Iterable<T>): LinkedList<T>;
  /**
   * Create a new LinkedList from an iterator over some values, mapping each value to a different value.
   *
   * @param it
   * @param mapFn   if provided, every value to be added to the list is first passed through this function and the
   *                `mapFn`'s return value is added to the list instead
   * @param thisArg value to use as `this` when executing `mapFn`
   */
  public static from<T, U = T>(it: Iterable<T>, mapFn: (v: T, k: number) => U, thisArg?: any): LinkedList<U>;
  public static from<T, U = T>(source: Iterable<T> | string | ArrayLike<T>, mapFn?: (v: T, k: number) => U, thisArg?: any): LinkedList<U> {
    let theList: LinkedList<U> = new LinkedList<U>();
    let it: Iterable<T>;

    if (Array.isArray(source)) {
      it = source[Symbol.iterator]();
    } else if (typeof source === 'string') {
      const arr = Array.from(source);
      it = (arr as unknown as T[])[Symbol.iterator]();
    } else if (source[Symbol.iterator] !== undefined) {
      it = source[Symbol.iterator]();
    } else if ('length' in (source as object)) {
      it = Array.from(source)[Symbol.iterator]();
    } else {
      // istanbul ignore next
      throw Error(`LinkedList.from does not support the type passed in`);
    }

    let index = 0;
    const callMapFn = mapFn === undefined ? undefined : mapFn.bind(thisArg);

    for (const t of it) {
      if (callMapFn === undefined) {
        theList.push(t as unknown as U);
      } else {
        theList.push(callMapFn(t, index));
      }
      index++;
    }
    return theList;
  }

  /**
   * Grow the linked list to the given length and set the new elements to the given value.
   *
   * Use case for `grow`:
   *  - you want to create a list of a given size all filled with the same value; for an Array you would construct
   *    using `Array(length)` then call `Array.fill`.  For LinkedList, use `LinkedList.grow` instead.
   *
   * From version 2 of LinkedList, you can also use the same approach as Array, however, in that case
   * you'll need to declare the list as `LinkedList<T | undefined>` because `new LinkedList(length)`
   * fills the list with `undefined` - which may not be what you want.
   * `grow` allows you to have a declaration of just `LinkedList<T>`.
   *
   * @param newLength the new length; if this is <= the current length, no operation is performed
   * @param value     the value to use for the new elements
   *
   * @return the modified list
   *
   * #### Complexity: O(n) where n is the additional length of the linked list
   */
  public grow(newLength: number, value: T): LinkedList<T> {
    while (this._length < newLength) {
      this.push(value);
    }

    return this;
  }

  /**
   * Test if the list contains the given value, using the algorithm for comparison.
   * @param testValue   the value to look for in the list
   * @param fromIndex   the index from which to start the search; from version 2.0.0, -ve numbers are supported
   * @returns `true` if the list includes the given value
   *
   * #### Complexity: O(n) where n is the length of the linked list
   * @see LinkedList.sameValueZero
   */
  public includes(testValue: T, fromIndex = 0): boolean {
    let result = false;
    const startIndex = this._computeStartIndex(fromIndex);

    if (startIndex < this.length) {
      this._iteratePredicate((value, index) => {
        if (index >= startIndex) {
          result = true;    // this is the return value
          return false;     // and stop the loop
        } else {
          return true;      // continue the loop
        }
      }, listValue => LinkedList.sameValueZero(listValue, testValue));
    }
    return result;
  }

  /**
   * Find the first element in the list where the given value === the list value, and return the index.
   * @param testValue   the value to find in the list
   * @param fromIndex   the index from which to start the search; from version 2.0.0, -ve numbers are supported, just like Array
   * @returns the index of the first list element that is === to testValue, or -1 if no such list element is found
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public indexOf(testValue: T, fromIndex = 0): number {
    let result: number = -1;
    const startIndex = fromIndex < 0 ? (fromIndex < -this.length ? 0 : this.length + fromIndex) : fromIndex;

    this._iteratePredicate((value, index) => {
      if (index >= startIndex) {
        result = index;   // this is the return value
        return false;     // and stop the loop
      } else {
        return true;      // continue the loop
      }
    }, listValue => listValue === testValue);

    return result;
  }

  /**
   * Test if the given value is a LinkedList.
   *
   * Note that the `T` generic type parameter cannot be verified using plain Typescript
   * and you must use other Typescript techniques to confirm matching types for the elements.
   *
   * @param maybeList   the value to test
   * @returns `true` if the value is a LinkedList
   */
  public static isLinkedList<T>(maybeList: unknown): maybeList is LinkedList<T> {
    return maybeList instanceof LinkedList;
  }

  /**
   * Join the elements of the linked list with the given string as a separator.
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public join(sep = ','): string {
    const valueList: string[] = [];

    this.forEach(value => {
      valueList.push(value === null || value === undefined ? '' : `${value}`);
    });

    return valueList.join(sep);
  }

  /**
   * Return the list of indexes in the linked list as an iterator.
   * If you want this list as a LinkedList, use `keysAsList`.
   *
   * #### Complexity: O(?) - uses `Array.keys` so, same complexity as that method - possibly O(n) or O(1)
   */
  public keys(): IterableIterator<number> {
    return Array(this.length).keys();
  }

  /**
   * Return the list of indexes in the linked list as a LinkedList.
   * If you want this as an iterator, use `keys`.
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public keysAsList(): LinkedList<number> {
    return new LinkedList<number>(this.keys());
  }

  /**
   * Find the last element in the list where the given value === the list value, and return the index.
   * @param testValue   the value to find in the list
   * @param fromIndex   the index from which to start the search
   * @returns the index of the last list element that is === to testValue, or -1 if no such list element is found
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public lastIndexOf(testValue: T, fromIndex?: number): number {
    let result: number = -1;

    //
    // These conditions are defined in the documentation for Array here:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
    //
    if (fromIndex === undefined || fromIndex >= -this.length) {
      let endIndex;

      if (fromIndex === undefined || fromIndex >= this.length) {
        endIndex = this.length - 1;
      } else {
        endIndex = fromIndex < 0 ? this.length + fromIndex : fromIndex;
      }

      this._iteratePredicate((listValue, index) => {
        if (listValue === testValue) {
          result = index;   // this is the potential return value
        }
        return true;        // always continue the loop until the end
      }, (value, index) => index <= endIndex);
    }
    return result;
  }

  /**
   * Create a new LinkedList populated with the results of calling the provided function
   * on every element in the LinkedList.
   * @param callbackFn   the function to call to map each element
   * @param thisArg      a "this" value to bind to the callback function
   * @returns a new linked list with each element being the result of the callback function
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public map<U>(callbackFn: MapCallback<T, U>, thisArg?: any): LinkedList<U> {
    const callFunc = callbackFn.bind(thisArg);
    const result = new LinkedList<U>();
    let index = 0;

    for (const value of this) {
      result.push(callFunc(value, index, this));
      index++;
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
   * Create a new LinkedList from the given variable number of arguments
   * @param items
   *
   * #### Complexity: O(n) where n is the number of items
   */
  public static of<T>(...items: T[]): LinkedList<T> {
    return new LinkedList<T>(...items);
  }

  /**
   * Remove the last element from the end of the list.
   *
   * `pop` requires complete traversal of the list, so you shouldn't use a singly-linked list
   * if you need to use `pop` on large lists.
   *
   * @returns the removed element or undefined if the list is empty
   *
   * #### Complexity: O(n) where n is the length of the list.
   */
  public pop(): T | undefined {
    let result: T | undefined = undefined;

    if (this._length > 0) {
      if (this._length === 1) {
        //
        // pop on a single element list is the same as shift
        //
        result = this.shift();
      } else {
        // istanbul ignore if
        if (this._root === undefined) {
          throw Error('LinkedList.pop logic failure (_root is undefined)!');
        }

        //
        // invariant: list contains at least 2 elements
        //
        let skipCount = this._length - 1;
        let node: LinkedListNode<T> | undefined = this._root;
        while (--skipCount > 0) {
          // istanbul ignore next
          node = node?.next;
        }
        // istanbul ignore if
        // istanbul ignore next
        if (node?.next === undefined) {
          throw Error('LinkedList.pop logic failure (node.next is undefined)!');
        }
        //
        // node points to the element *before* the one we want to pop:
        //  - return that node's value
        //  - and remove it from the list
        //
        result = node.next.value;
        //
        // we're popping the last element, so it must be the last element!
        //
        // istanbul ignore if
        if (node.next.next !== undefined) {
          throw Error('LinkedList.pop logic failure (did not skip to the end)!');
        }
        node.next = node.next.next;
        this._length--;
      }
    }
    return result;
  }

  /**
   * Append to the end of the list, all the items in the given iterator.
   *
   * `push` is very fast on both Array and LinkedList.  Even for very large LinkedList's,
   * `push` remains typically O(1) complexity.
   *
   * Note that Array does not have an overload that accepts an iterator, but for large appends
   * an iterator uses much less stack space than spread syntax.
   *
   * @param it    an iterator over a set of values
   * @returns the new length of the list
   *
   * #### Complexity: O(n) where n is the number of values being appended - typically O(1)
   */
  public push(it: Iterable<T>): number;
  /**
   * Append to the end of the list.
   *
   * `push` is very fast on both Array and LinkedList.  Even for very large LinkedList's,
   * `push` remains typically O(1) complexity.
   *
   * @param valueList a set of values to append to the list
   * @returns the new length of the list
   *
   * #### Complexity: O(n) where n is the number of values being appended - typically O(1)
   */
  public push(...valueList: T[]): number;
  public push(...args: unknown[]): number {
    let it: Iterable<T>;

    //
    // check the different overloads
    //
    if (args.length === 1 && LinkedList.isIterable(args[0])) {
      it = args[0] as Iterable<T>;
    } else {
      it = (args as T[])[Symbol.iterator]();
    }
    for (const value of it) {
      const node = this._createNode(value);
      if (this._root === undefined) {
        // istanbul ignore if
        if (this._length !== 0) {
          throw Error('LinkedList.push logic failure (length > 0)!');
        }

        this._root = node;
        this._end = this._root;
      } else {
        // istanbul ignore if
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
   * The `reduce` method executes a user-supplied callback function (`reducerCallbackFn`) on each element of the list,
   * in left-to-right (first-to-last) order, passing in the return value from the calculation on the preceding element.
   * The final result of running the `reducerCallbackFn` across all elements of the list is a single value.
   *
   * The first time that the callback is run there is no "return value of the previous calculation".
   * Therefore, either the optional `initialValue` parameter is used or, if that is not supplied,
   * the list element at index 0 is used as the initial value and iteration starts from
   * the next element (index 1 instead of index 0).
   *
   * Regarding the optional `initialValue` parameter:  if `initialValue` is supplied, that also causes `currentValue`
   * to be initialized to the first value in the list. If `initialValue` is not supplied, `accumulator` is initialized
   * to the first value in the list, and `currentValue` is initialized to the second value in the list.
   *
   * Regarding the `reducerCallbackFn` callback function...
   *
   * Its return value becomes the value of the `accumulator` parameter on the next invocation of `reducerCallbackFn`.
   * For the last invocation, the return value becomes the return value of `reduce`.
   *
   * `reducerCallbackFn` is called with the following arguments:
   *
   *  * `accumulator`
   *    The value resulting from the previous call to `reducerCallbackFn`. On first call, `initialValue` if supplied,
   *    otherwise the value of `list.at(0)`.
   *
   *  * `currentValue`
   *    The value of the current element. On first call, the value of `list.at(0)` if `initialValue` was supplied,
   *    otherwise the value of `list.at(1)`.
   *
   *  * `currentIndex`
   *    The index position of `currentValue` in list. On first call, 0 if `initialValue` was supplied, otherwise 1.
   *
   *  * `list`
   *    The list `reduce` was called upon.
   *
   * @typeParam U the return type of the `reducerCallbackFn` callback function, and the return type of `reduce` itself
   * @param reducerCallbackFn the `reducerCallbackFn` callback function
   * @param initialValue      an optional value to which `accumulator` is initialized the first time the callback is called.
   */
  public reduce(reducerCallbackFn: ReduceCallback<T>, initialValue?: T): T {
    let result: T;
    let index;
    let it = this[Symbol.iterator]();

    let itResult = it.next();

    if (initialValue === undefined) {
      if (this.length === 0) {
        throw TypeError(`Reduce of empty list with no initial value`);
      }
      result = itResult.value;
      itResult = it.next();
      index = 1;
    } else {
      result = initialValue;
      index = 0;
    }
    while (!itResult.done) {
      result = reducerCallbackFn(result, itResult.value, index, this);
      itResult = it.next();
      index++;
    }
    return result;
  }

  /**
   * Implements the `sameValueZero` algorithm described here:
   *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#abstract_equality_strict_equality_and_same_value_in_the_specification
   *  - https://262.ecma-international.org/5.1/#sec-9.12
   * @param lhs   the left hand side of the equality test
   * @param rhs   the left hand side of the equality test
   * @returns `true` if lhs and rhs have the same value as defined by the `sameValueZero` algorithm
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
   * Remove the first element from the list.
   *
   * `shift` is very fast on LinkedList and very slow on Array.
   *
   * @returns the element removed from the front of the list, or `undefined` if the list is empty
   *
   * #### Complexity: O(1)
   */
  public shift(): T | undefined {
    let result: T | undefined = undefined;

    if (this._length !== 0) {
      // istanbul ignore if
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
        // istanbul ignore if
        if (this._length !== 1) {
          throw Error('LinkedList.shift logic failure (length is wrong)!');
        }
      }
      this._length--;
    }
    return result;
  }

  /**
   * Return a shallow copy of a part of the linked list, based on indexes of the elements in the list.
   * @param start optional zero-based starting index, at which to start copying the list
   * @param end   optional; the index of the first element to exclude from the returned list
   *
   * `start` and `end` can be negative from version 2.0.0
   *
   * @returns a new list containing the specified elements from the original list
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public slice(start?: number, end?: number): LinkedList<T> {
    const newList = new LinkedList<T>();

    const fromIndex = this._computeStartIndex(start);
    const toIndex = this._computeEndIndex(end);

    let currIndex = 0;

    for (const value of this) {
      if (currIndex === toIndex) {
        break;
      }
      if (currIndex++ >= fromIndex) {
        newList.push(value);
      }
    }
    return newList;
  }

  /**
   * Test if at least one element of the list returns `true` for the given predicate function.
   * @param predicate   a function to test each element in the list
   * @param thisArg     a "this" value to bind to the predicate function
   * @returns `true` if at least one element obeys the predicate, otherwise false
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public some(predicate: LinkedListPredicate<T>, thisArg?: any): boolean {
    let result: boolean = false;       // return false on an empty list

    this._iteratePredicate(() => {
        result = true;      // predicate is true, so the result is true
        return false;        // stop looping, since we have the result
      },
      predicate,
      thisArg);

    return result;
  }

  /**
   * Change the linked list by removing or replacing existing elements and/or adding
   * new elements.
   * @param start       zero-based starting index, at which to start changing the list; a negative value
   *                    counts back from the end of the list
   * @param deleteCount the number of elements to remove beginning at the start index
   * @param items       items to be inserted after the start index; if you don't provide any items then
   *                    `splice` only removes elements from the list
   * @returns a list containing the deleted elements
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public splice(start: number, deleteCount: number | undefined = this.length, ...items: T[]): LinkedList<T> {
    const deletedList = new LinkedList<T>();
    const fromIndex = this._computeStartIndex(start);
    let currIndex = 0;
    let numberToDelete = Number(deleteCount);    // allow conversion of undefined & null to zero

    if (fromIndex === 0) {
      //
      // delete elements
      //
      while (numberToDelete-- > 0 && this.length > 0) {
        const value = this.shift() as T;

        deletedList.push(value);
      }
      //
      // insert new items
      //
      this.unshift(...items);
    } else {
      let node = this._root;

      //
      // loop to the node just before the start
      //
      while (++currIndex < fromIndex) {
        // istanbul ignore next
        node = node?.next;
      }
      // istanbul ignore next
      if (node === undefined) {
        throw Error('LinkedList.splice logic failure (node is undefined looking for start)!');
      }
      //
      // delete elements
      //
      while (numberToDelete-- > 0 && node.next !== undefined) {
        const value = node.next.value;

        deletedList.push(value);
        node.next = node.next.next;
        this._length--;
        if (node.next === undefined) {
          this._end = node;
        }
      }
      //
      // insert new elements
      //
      if (node.next === undefined) {
        //
        // we must be appending
        //
        this.push(...items);
      } else {
        //
        // insert new items at this point
        //
        for (const value of items) {
          const next = node.next;
          node.next = this._createNode(value);
          node.next.next = next;
          this._length++;
        }
      }
    }
    return deletedList;
  }

  /**
   * Return a string representation of the list and its elements.
   *
   * #### Complexity: O(n) where n is the length of the linked list
   */
  public toString(): string {
    const valueList: string[] = [];

    this.forEach(value => {
      valueList.push(JSON.stringify(value));
    });

    return valueList.join(',');
  }


  /**
   * Truncate the linked list to the given length. The removed elements are discarded.
   *
   * @param newLength    if < 0, then it is set to zero.  If >= the current length, no operation is performed
   * @param value
   *
   * @return the modified list
   *
   * #### Complexity: O(n) where n is the new length of the linked list
   */
  public truncate(newLength: number, value?: T): LinkedList<T> {
    if (newLength < 0) {
      newLength = 0;
    }
    if (newLength < this._length) {
      this._shrink(newLength);
    }
    return this;
  }

  /**
   * Insert at the beginning of a list
   *
   * `unshift` is very fast on LinkedList and very slow on Array.
   *
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
   * The values of the list (as an iterator).
   * @returns an iterator for the list
   *
   * #### Complexity: O(1)
   */
  public values(): ListIterator<T> {
    return new ListIterator<T>(this._root as ReadonlyLinkedListNode<T>);
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
   * Return an iterator for the list.
   */
  [Symbol.iterator]() {
    return new ListIterator<T>(this._root);
  }

  /**
   * Compute a starting index in the list given an index that may be +ve or -ve or undefined.
   * @param index   an optional index indicating the start point in the list
   * @returns a positive index to start from
   * @protected
   * @internal
   */
  protected _computeStartIndex(index: number | undefined): number {
    let result;

    if (index === undefined) {
      result = 0;
    } else if (index < 0) {
      result = index < -this.length ? 0 : this.length + index;
    } else {
      result = index > this.length ? this.length : index;
    }
    return result;
  }

  /**
   * Compute an ending index in the list given an index that may be +ve or -ve or undefined.
   * @param index   an optional index indicating the end point in the list
   * @returns a positive index to end at
   * @protected
   * @internal
   */
  protected _computeEndIndex(index: number | undefined): number {
    let result;

    if (index === undefined) {
      result = this.length;
    } else if (index < 0) {
      result = index < -this.length ? 0 : this.length + index;
    } else {
      result = index > this.length ? this.length : index;
    }
    return result;
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
   * Shrink the list to the given length (or keep its current length).
   * @param newLength   must be a value <= the current length; -ve numbers are set to zero
   * @protected
   * @internal
   */
  protected _shrink(newLength: number) {
    // istanbul ignore if
    if (newLength < 0) {
      newLength = 0;
    }
    // istanbul ignore if
    if (newLength > this._length) {
      throw Error('LinkedList._shrink logic invariant failed!');
    }
    // istanbul ignore if
    if (newLength === this._length) {
      // no-op
    } else if (newLength === 0) {
      //
      // truncate the list
      //
      this._length = 0;
      this._root = undefined;
      this._end = undefined;
    } else {
      // istanbul ignore if
      if (this._root === undefined) {
        throw Error('LinkedList._shrink logic invariant failed (root undefined)!');
      }
      if (newLength === 1) {
        //
        // keep just the first element
        //
        this._length = 1;
        this._root.next = undefined;
        this._end = this._root;
      } else {
        //
        // invariant: list contains at least 2 elements
        //
        let skipCount = newLength - 1;
        let node: LinkedListNode<T> | undefined = this._root;
        while (--skipCount > 0) {
          // istanbul ignore next
          node = node?.next;
        }
        // istanbul ignore if
        // istanbul ignore next
        if (node?.next === undefined) {
          throw Error('LinkedList._shrink logic failure (node.next is undefined)!');
        }
        node.next = undefined;
        this._end = node;
        this._length = newLength;
      }
    }
  }

  /**
   * Test if the given argument is a true object.
   *
   * @param arg
   */
  public static isObject(arg: unknown): boolean {
    return arg !== null && typeof arg === 'object';
  }

  /**
   * Test if the given argument is an Iterable.
   *
   * @param arg
   */
  public static isIterable(arg: unknown): boolean {
    return LinkedList.isObject(arg) && 'next' in (arg as any) && typeof (arg as any)['next'] === 'function';
  }
}

/**
 * The shape of a recursive or nested LinkedList.
 */
export type RecursiveLinkedList<T> = LinkedList<T | RecursiveLinkedList<T>>;
