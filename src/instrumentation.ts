import { memoryDb } from '~/server/memory-db';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { MQTTClient } = await import('~/server/mqtt');
    const mqtt = new MQTTClient();

    mqtt.subscribe('topic/detail');

    mqtt.onMessage((topic, message) => {
      try {
        switch (topic) {
          case 'topic/detail': {
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

            memoryDb.station = {
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

            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.log(`There was an error on topic ${topic}`);
      }
    });
  }
}