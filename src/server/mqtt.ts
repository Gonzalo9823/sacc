import mqtt, { type MqttClient as MqttClientType } from 'mqtt';
import { env } from '~/env.mjs';

export class MQTTClient {
  private static instance: MQTTClient;
  private client!: MqttClientType;

  constructor() {
    if (!MQTTClient.instance) {
      this.client = mqtt.connect(env.MQTT_BROKER_URL);
      this.setupEventHandlers();
      MQTTClient.instance = this;
    }

    return MQTTClient.instance;
  }

  setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('MQTT client connected');
    });

    this.client.on('error', (error) => {
      console.error('MQTT client error:', error);
    });
  }

  publish(topic: string, message: string) {
    this.client.publish(topic, message, {}, (error) => {
      if (error) {
        console.error('Publish error:', error);
      }
    });
  }

  subscribe(topic: string) {
    this.client.subscribe(topic, {}, (error) => {
      if (error) {
        console.error('Subscribe error:', error);
      }
    });
  }
}
