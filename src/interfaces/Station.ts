import type { Locker } from '~/interfaces/Locker';

export interface Station {
  stationId: string;
  lockers: Locker[];
}
