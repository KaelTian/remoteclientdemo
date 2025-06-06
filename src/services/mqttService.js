import mqtt from 'mqtt';
const MQTT_SERVICE = {
    client: null,
    connect(brokerUrl, options) {
        this.client = mqtt.connect(brokerUrl, options);
        this.client.on('connect', () => {
            console.log('MQTT connected');
        })
        this.client.on('error', (error) => {
            console.log('MQTT error', error);
        })

        return this.client;
    },
    subscribe(topic, callback) {
        if (this.client) {
            this.client.subscribe(topic, (error) => {
                if (!error) {
                    console.log(`Subscribe to ${topic}`);
                    this.client.on('message', (receivedTopic, message) => {
                        if (receivedTopic !== topic) return;
                        callback(message.toString());
                    });
                } else {
                    console.log('MQTT subscribe error', error);
                }
            })
        }
    },
    publish(topic, message) {
        if (this.client) {
            this.client.publish(topic, message);
        }
    },
    disconnect() {
        if (this.client) {
            this.client.end();
        }
    }
}

export default MQTT_SERVICE;