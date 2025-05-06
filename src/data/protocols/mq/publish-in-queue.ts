export interface PublishInQueueService {
  publishInQueue(
    queue: string,
    message: object,
    headers?: object
  ): Promise<boolean>;
}
