export interface Locker {
  nickname: string;
  state: LockerStatus;
  isOpen: boolean;
  isEmpty: boolean;
  sizes: {
    height: number;
    width: number;
    depth: number;
  };
}

export enum LockerStatus {
  AVAILABLE = 'Disponible',
  RESERVED = 'Reservado',
  CONFIRMED = 'Confirmado',
  LOADING = 'Cargando',
  USED = 'Usado',
  UNLOADING = 'Descargando',
}
