import { memoryDb } from '~/server/memory-db';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { MQTTClient } = await import('~/server/mqtt');
    const mqtt = new MQTTClient();

    mqtt.subscribe('topic/detail');

    mqtt.onMessage((_, message) => {
      memoryDb.stations = message.toString();
    });
  }
}
