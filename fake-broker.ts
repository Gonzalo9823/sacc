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
        topic: 'pds_public_broker/detail',
        payload: Buffer.from(
          JSON.stringify({
            station_id: 'G7',
            lockers: [
              {
                nickname: '0',
                state: 'RESERVADO',
                is_open: true,
                is_empty: false,
                sizes: '[20x20x20]',
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
