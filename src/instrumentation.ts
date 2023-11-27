import { stat } from 'fs';
import { memoryDb } from '~/server/memory-db';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { MQTTClient } = await import('~/server/mqtt');
    const mqtt = new MQTTClient();

    mqtt.subscribe('pds_public_broker/detail');


    mqtt.onMessage((topic, message) => {
      try {
        switch (topic) {
          case 'pds_public_broker/detail': {
            console.log('Received message on topic pds_public_broker/detail');
            // console.log(message.toString());
            const station = JSON.parse(message.toString()) as 
              {
                station_id: string;
                lockers: {
                  nickname: string;
                  state: string;
                  is_open: boolean;
                  is_empty: boolean;
                  sizes: string;
                }[];
              }
            ;

            if (!memoryDb.stations) {
              memoryDb.stations = [];
            }
            else{
              console.log('memoryDb.stations', memoryDb.stations);
            }


            if (memoryDb.stations.find((station2) => station2.stationId === station.station_id)) {
              console.log('Station already exists, updating info');

              
              let station2 = memoryDb.stations.find((station2) => station2.stationId === station.station_id)

              station.lockers.forEach((locker) => {
                station2!.lockers.find((locker2) => locker2.nickname === locker.nickname)!.state = locker.state;
                station2!.lockers.find((locker2) => locker2.nickname === locker.nickname)!.isOpen = locker.is_open;
                station2!.lockers.find((locker2) => locker2.nickname === locker.nickname)!.isEmpty = locker.is_empty;
              });





            }
            

            else
            {memoryDb.stations.push({
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
            });}
            
            console.log('memoryDb.stations', memoryDb.stations);
            memoryDb.stations.forEach((station) => {
              console.log('station', station);
              station.lockers.forEach((locker) => {
                console.log('locker', locker);
              });
            });
            // memoryDb.stations = stations.map((station) => ({
            //   stationId: station.station_id,
            //   lockers: station.lockers.map((locker) => {
            //     const sizes = locker.sizes.replace('[', '').replace(']', '').split('x');
            //     console.log(sizes);

            //     return {
            //       nickname: locker.nickname,
            //       state: locker.state,
            //       isOpen: locker.is_open,
            //       isEmpty: locker.is_empty,
            //       sizes: {
            //         height: parseFloat(sizes[0]!),
            //         width: parseFloat(sizes[1]!),
            //         depth: parseFloat(sizes[2]!),
            //       },
            //     };
            //   }),
            // }));

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
