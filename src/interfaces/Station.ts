import type { Locker } from '~/interfaces/Locker';

export interface Station {
  stationName: string;
  address: string;
  lockers: Locker[];
}
