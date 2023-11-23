export const memoryDb = globalThis as unknown as {
  station?: {
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
  };
};
