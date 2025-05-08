import NodeCache from 'node-cache';

class NodeCacheSingleton {
  private static instance: NodeCache;
  private static readonly DEFAULT_TTL_IN_MINUTES = 60;
  private static readonly DEFAULT_TTL_IN_SECONDS =
    NodeCacheSingleton.DEFAULT_TTL_IN_MINUTES * 60;
  private static readonly DEFAULT_TIME_TO_CHECK_IN_SECONDS = 120;

  private constructor() {}

  public static getInstance(): NodeCache {
    if (!NodeCacheSingleton.instance) {
      NodeCacheSingleton.instance = new NodeCache({
        stdTTL: NodeCacheSingleton.DEFAULT_TTL_IN_SECONDS,
        checkperiod: NodeCacheSingleton.DEFAULT_TIME_TO_CHECK_IN_SECONDS,
        useClones: false
      });
    }
    return NodeCacheSingleton.instance;
  }
}

export const makeNodeCache = () => NodeCacheSingleton.getInstance();
