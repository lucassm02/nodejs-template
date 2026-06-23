type InsertManyOptions = {
  ordered: boolean;
  writeConcern: { w: number };
};

type InsertManyModel<T extends object> = {
  insertMany(docs: T[], options: InsertManyOptions): Promise<unknown>;
};

type BulkInsertBufferOptions = {
  maxSize: number;
  flushIntervalMs: number;
  onError?: (error: unknown) => void;
};

const insertManyOptions: InsertManyOptions = {
  ordered: false,
  writeConcern: { w: 0 }
};

export class BulkInsertBuffer<T extends object> {
  private queue: T[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private flushing: Promise<void> | null = null;
  private readonly maxSize: number;
  private readonly flushIntervalMs: number;

  constructor(
    private readonly model: InsertManyModel<T>,
    private readonly options: BulkInsertBufferOptions
  ) {
    this.maxSize =
      Number.isFinite(options.maxSize) && options.maxSize > 0
        ? options.maxSize
        : 50;
    this.flushIntervalMs =
      Number.isFinite(options.flushIntervalMs) && options.flushIntervalMs > 0
        ? options.flushIntervalMs
        : 1000;
  }

  public enqueue(document: T): void {
    this.queue.push(document);

    if (this.queue.length >= this.maxSize) {
      this.flushInBackground();
      return;
    }

    this.scheduleFlush();
  }

  public async flush(): Promise<void> {
    if (this.flushing) {
      await this.flushing;
      if (this.queue.length) await this.flush();
      return;
    }

    this.clearTimer();

    const documents = this.queue.splice(0);
    if (!documents.length) return;

    this.flushing = this.model
      .insertMany(documents, insertManyOptions)
      .then(() => undefined)
      .catch((error) => {
        this.options.onError?.(error);
      })
      .finally(() => {
        this.flushing = null;
        if (this.queue.length >= this.maxSize) {
          this.flushInBackground();
          return;
        }
        this.scheduleFlush();
      });

    await this.flushing;
  }

  private scheduleFlush(): void {
    if (this.timer || !this.queue.length) return;

    this.timer = setTimeout(() => {
      this.flushInBackground();
    }, this.flushIntervalMs);

    this.timer.unref?.();
  }

  private flushInBackground(): void {
    this.flush().catch((error) => {
      this.options.onError?.(error);
    });
  }

  private clearTimer(): void {
    if (!this.timer) return;

    clearTimeout(this.timer);
    this.timer = null;
  }
}
