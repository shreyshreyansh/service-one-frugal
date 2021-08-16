var amqp = require("amqplib/callback_api");
const mqtt = require("mqtt");
var client = mqtt.connect("mqtt://test.mosquitto.org");

function generateUuid() {
  return (
    Math.random().toString() +
    Math.random().toString() +
    Math.random().toString()
  );
}

var channel = null;
var conn = null;

//connecting to the rabbitmq
amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  conn = connection;
  connection.createChannel(function (error1, ch) {
    if (error1) {
      throw error1;
    }
    channel = ch;
  });
});

//subscribing to the sensorTopic on mosquitto
client.on("connect", function (err) {
  client.subscribe("sensorTopic");
});

//sending sensor data to rabbitmq
client.on("message", function (topic, message) {
  var queue = "device_queue";
  var correlationId = generateUuid();

  channel.assertQueue(queue, {
    durable: false,
  });
  var msg1 = JSON.parse(message.toString());
  msg1["route"] = "sensorupload";

  channel.assertQueue(
    "",
    {
      exclusive: true,
    },
    function (error2, q) {
      if (error2) {
        throw error2;
      }
      channel.consume(
        q.queue,
        function (msg) {
          console.log(msg);
        },
        {
          noAck: true,
        }
      );

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg1)), {
        correlationId: correlationId,
        replyTo: q.queue,
      });
    }
  );
});

var gracefulExit = function () {
  conn.close();
  console.log("Connection Closed!");
};

process.on("SIGINT", gracefulExit).on("SIGTERM", gracefulExit);
