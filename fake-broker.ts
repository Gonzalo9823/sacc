import 'dotenv/config';

import Aedes from 'aedes';
import { createServer } from 'net';
import { env } from '~/env.mjs';

const aedes = new Aedes();
const server = createServer(aedes.handle);

server.listen(env.MQTT_PORT, function () {
  console.log(`Broker server started and listening on port ${env.MQTT_PORT}`);

  setInterval(() => {
    aedes.publish(
      {
        topic: 'pds_public_broker/status',
        payload: Buffer.from(
          JSON.stringify({
            station_name: 'G7',
            address: 'Some Address',
            lockers: [
              {
                nickname: 0,
                state: 0,
                is_open: false,
                is_empty: true,
                size: '20x20x20',
              },
              {
                nickname: 1,
                state: 0,
                is_open: false,
                is_empty: true,
                size: '10x10x10',
              },
            ],
          })
        ),
        retain: false,
        cmd: 'publish',
        qos: 0,
        dup: false,
      },
      (err) => {
        if (err) {
          console.log(`There was an error publishing topic/detail: ${err.message}`);
        }
      }
    );
  }, 5000);
});
