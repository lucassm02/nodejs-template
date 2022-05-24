export interface MqServer {
  consume(queue: string, callback: (message: object) => void): void;
}
