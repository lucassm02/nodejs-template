import EventEmitter from 'events';

class Event {
  private static instance: Event;
  private emitter!: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): Event {
    if (!Event.instance) {
      Event.instance = new Event();
    }

    return Event.instance;
  }

  public getEmitter() {
    return this.emitter;
  }
}

export function makeEvent() {
  return Event.getInstance().getEmitter();
}
