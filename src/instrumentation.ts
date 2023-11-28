import { memoryDb } from '~/server/memory-db';
import type { Station } from '~/interfaces/Station';

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
                  state: locker.state,
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
