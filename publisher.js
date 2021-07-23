var mqtt = require("mqtt");
var client = mqtt.connect("mqtt://test.mosquitto.org");

client.on("connect", function () {
  client.subscribe("sensorTopic", function (err) {
    const data = {
      deviceID: "HM1432",
      Type1: "ksi",
      Value1: "def",
      Type2: "ghi",
      Value2: "jkl",
      Type3: "mno",
      Value3: "pqr",
      Type4: "stu",
      Value4: "wxy",
    };
    if (!err) {
      client.publish("sensorTopic", JSON.stringify(data));
    }
  });
});
