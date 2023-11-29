import { memoryDb } from '~/server/memory-db';
import type { Station } from '~/interfaces/Station';
import { LockerStatus } from '~/interfaces/Locker';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { MQTTClient } = await import('~/server/mqtt');
    const mqtt = new MQTTClient();

    mqtt.subscribe('status');

    mqtt.onMessage((topic, message) => {
      try {
        switch (topic) {
          case 'status': {
            const station = JSON.parse(message.toString()) as {
              station_name: string;
              address: string;
              lockers: {
                nickname: number | string;
                state: 0 | 1 | 2 | 3 | 4 | 5;
                is_open: boolean;
                is_empty: boolean;
                size: string;
              }[];
            };

            const parsedStation: Station = {
              stationName: station.station_name,
              address: station.address,
              lockers: station.lockers.map((locker) => {
                const sizes = locker.size.replace('[', '').replace(']', '').split('x');

                return {
                  nickname: typeof locker.nickname === 'string' ? parseInt(locker.nickname, 10) : locker.nickname,
                  state: (() => {
                    switch (locker.state) {
                      case 0:
                        return LockerStatus.AVAILABLE;

                      case 1:
                        return LockerStatus.RESERVED;

                      case 2:
                        return LockerStatus.CONFIRMED;

                      case 3:
                        return LockerStatus.LOADING;

                      case 4:
                        return LockerStatus.USED;

                      case 5:
                        return LockerStatus.UNLOADING;
                    }
                  })(),
                  isOpen: locker.is_open,
                  isEmpty: locker.is_empty,
                  sizes: {
                    height: parseFloat(sizes[0]!),
                    width: parseFloat(sizes[1]!),
                    depth: parseFloat(sizes[2]!),
                  },
                };
              }),
            };

            if (!memoryDb.stations) memoryDb.stations = [];

            const alreadyAddedStationIdx = memoryDb.stations.findIndex(({ stationName }) => stationName === parsedStation.stationName);

            if (alreadyAddedStationIdx >= 0) {
              memoryDb.stations[alreadyAddedStationIdx] = parsedStation;
              break;
            }

            memoryDb.stations.push(parsedStation);

            break;
          }

          case 'pds_public_broker/load':
            {
              const msg = JSON.parse(message.toString()) as {
                station_id: string;
                nickname: string;
              }[];

              console.log(msg);
            }

            break;
        }
      } catch (err) {
        console.log(err);
        console.log(`There was an error on topic ${topic}`);
      }
    });
  }
}
