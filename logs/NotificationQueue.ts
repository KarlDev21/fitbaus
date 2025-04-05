export class NotificationQueue {
  queue: any[];
  waiting: null | ((data: any) => void);
  constructor() {
    this.queue = [];
    this.waiting = null;
  }

  push(data: any) {
    if (this.waiting) {
      this.waiting(data);
      this.waiting = null;
    } else {
      this.queue.push(data);
    }
  }

  async get() {
    if (this.queue.length > 0) {
      return this.queue.shift();
    }
    return new Promise(resolve => {
      this.waiting = resolve;
    });
  }
}

export class AsyncQueue<T> {
  private queue: T[] = [];
  private resolvers: ((value: T) => void)[] = [];

  push(item: T) {
    if (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift()!;
      resolve(item);
    } else {
      this.queue.push(item);
    }
  }

  async pop(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    return new Promise<T>(resolve => {
      this.resolvers.push(resolve);
    });
  }

  /**
   * Checks if the queue is empty.
   * @returns `true` if the queue is empty, otherwise `false`.
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Gets the current size of the queue.
   * @returns The number of items in the queue.
   */
  size(): number {
    return this.queue.length;
  }

  contains(item: T): boolean {
    return this.queue.includes(item);
  }

  print(): void {
    console.log('[AsyncQueue] Current queue contents:', this.queue);
  }
}

export class SyncQueue<T> {
  private queue: T[] = [];

  /**
   * Adds an item to the end of the queue.
   * @param item The item to add.
   */
  push(item: T): void {
    this.queue.push(item);
  }

  /**
   * Removes and returns the item at the front of the queue.
   * @returns The item at the front of the queue, or `undefined` if the queue is empty.
   */
  pop(): T | undefined {
    return this.queue.shift();
  }

  /**
   * Checks if the queue is empty.
   * @returns `true` if the queue is empty, otherwise `false`.
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Gets the current size of the queue.
   * @returns The number of items in the queue.
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Checks if the queue contains a specific item.
   * @param item The item to check for.
   * @returns `true` if the item exists in the queue, otherwise `false`.
   */
  contains(item: T): boolean {
    return this.queue.includes(item);
  }

  /**
   * Prints the current contents of the queue.
   */
  print(): void {
    console.log('[AsyncQueue] Current queue contents:', this.queue);
  }
}
