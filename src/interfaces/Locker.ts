export interface Locker {
  nickname: string;
  state: string;
  isOpen: boolean;
  isEmpty: boolean;
  sizes: {
    height: number;
    width: number;
    depth: number;
  };
}
