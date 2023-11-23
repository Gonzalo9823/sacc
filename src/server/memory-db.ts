export const memoryDb = globalThis as unknown as {
  stations?: {
    stationId: string;
    lockers: {
      nickname: string;
      state: string;
      isOpen: boolean;
      isEmpty: boolean;
      sizes: {
        height: number;
        width: number;
        depth: number;
      };
    }[];
  }[];
};
