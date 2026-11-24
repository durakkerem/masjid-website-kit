import * as migration_20261124_110532_initial from './20261124_110532_initial';

export const migrations = [
  {
    up: migration_20261124_110532_initial.up,
    down: migration_20261124_110532_initial.down,
    name: '20261124_110532_initial'
  },
];
