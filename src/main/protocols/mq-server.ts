export interface MqServer {
  consume(
    queue: string,
    callback: (message: Record<string, unknown>) => void
  ): void;
}
