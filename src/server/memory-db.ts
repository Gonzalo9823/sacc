import type { Station } from '~/interfaces/Station';

export const memoryDb = globalThis as unknown as {
  stations?: (Station & { lastConnection: Date })[];
};
