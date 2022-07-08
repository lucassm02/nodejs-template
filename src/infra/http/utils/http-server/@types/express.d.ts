declare module Express {
  export interface Request {
    [key: string | symbol]: any;
  }
}
