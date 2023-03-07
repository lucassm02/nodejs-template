export const defaultIndexTemplate = {
  index_patterns: ['application-log-*'],
  settings: {
    number_of_shards: 3,
    number_of_replicas: 0,
    index: {
      refresh_interval: '5s',
    },
  },
  mappings: {
    _source: { enabled: true },
  },
};
