import * as migration_20260709_194304_add_share_links_collection from './20260709_194304_add_share_links_collection';

export const migrations = [
  {
    up: migration_20260709_194304_add_share_links_collection.up,
    down: migration_20260709_194304_add_share_links_collection.down,
    name: '20260709_194304_add_share_links_collection'
  },
];
