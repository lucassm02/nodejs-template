import EventEmitter from 'events';

class EventHandler {
  private static instance: EventHandler;
  private emitter!: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): EventHandler {
    if (!EventHandler.instance) {
      EventHandler.instance = new EventHandler();
    }

    return EventHandler.instance;
  }

  public getEmitter() {
    return this.emitter;
  }
}

export function eventHandler() {
  return EventHandler.getInstance().getEmitter();
}
