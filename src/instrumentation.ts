import { memoryDb } from '~/server/memory-db';
import type { Station } from '~/interfaces/Station';
import { LockerStatus } from '~/interfaces/Locker';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { MQTTClient } = await import('~/server/mqtt');
    const mqtt = new MQTTClient();

    mqtt.subscribe('TEST/DETAIL');

    mqtt.onMessage((topic, message) => {
      try {
        switch (topic) {
          case 'TEST/DETAIL': {
            const station = JSON.parse(message.toString()) as {
              station_id: string;
              lockers: {
                nickname: string;
                state: string;
                is_open: boolean;
                is_empty: boolean;
                sizes: string;
              }[];
            };

            const parsedStation: Station = {
              stationId: station.station_id,
              lockers: station.lockers.map((locker) => {
                const sizes = locker.sizes.replace('[', '').replace(']', '').split('x');

                return {
                  nickname: locker.nickname,
                  state: (() => {
                    const parsedState = parseInt(locker.state) as 0 | 1 | 2 | 3 | 4 | 5;

                    switch (parsedState) {
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

            const alreadyAddedStationIdx = memoryDb.stations.findIndex(({ stationId }) => stationId === parsedStation.stationId);

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
        console.log(`There was an error on topic ${topic}`);
      }
    });
  }
}
