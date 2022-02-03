/*
 * Copyright (c) 2022 Cooltrax Pty Limited
 */

/**
 * A node in a singly-linked list.
 */
class LinkedListNode<T> {
  private _value: T;
  private _next: LinkedListNode<T> | undefined;

  constructor(value: T) {
    this._value = value;
    this._next = undefined;
  }

  get value(): T {
    return this._value;
  }

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
 * Implementation of a simple generic singly-linked Linked List.
 * Ideal to replace large arrays where you:
 *  - insert at the beginning (unshift)
 *  - append to the end (push)
 *  - remove from the beginning (shift)
 * as these operations are O(1) for a linked list, but O(n) for array shift and unshift.
 * Note that a fast "pop" requires a doubly-linked list.
 */
export class LinkedList<T, N extends LinkedListNode<T> = LinkedListNode<T>> {
  protected _root: LinkedListNode<T> | undefined;
  protected _end: LinkedListNode<T> | undefined;
  protected _length: number;

  constructor() {
    this._root = this._end = undefined;
    this._length = 0;
  }

  protected _createNode(value: T): LinkedListNode<T> {
    return new LinkedListNode<T>(value);
  }

  /**
   * Append to the end of a list
   * @param value
   * @returns the new length of the list
   */
  public push(value: T): number {
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
    return this._length;
  }

  /**
   * Insert at the beginning of a list
   * @param value
   * @returns the new length of the list
   */
  public unshift(value: T): number {
    const node = this._createNode(value);
    if (this._root === undefined) {
      this.push(value);
    } else {
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
}
