const express = require("express");
const router = express.Router();
const { WebhookClient } = require("dialogflow-fulfillment");

const userCollection = require("../models/user");
const user = new userCollection();

router.post("/", (req, res, next) => {
  //Create an instance
  const agent = new WebhookClient({
    request: req,
    response: res
  });

  console.log("Body: ", req.body);
  // console.log("agentVersion: " + agent.agentVersion);
  // console.log("intent: " + agent.intent);
  // console.log("locale: " + agent.locale);
  // console.log("query: ", agent.query);
  // console.log("session: ", agent.session);

  // test webhook call
  function webhookTest(agent) {
    let data = req.body.originalDetectIntentRequest;
    agent.add("Webhook is fine ✅ Thanks for asking 🤗 ");
    if (data.source == undefined) {
      agent.add("Cannot get user LINE UID.");
    } else {
      agent.add("User using bot from: " + data.source);
      agent.add("User ID: " + data.payload.data.source.userId);
    }
  }

  // submit function for plant report
  function submit(agent) {
    // define a variable to keep a data before submit
    let UID = req.body.originalDetectIntentRequest.payload.data.source.userId;
    let farm = agent.parameters["farm"];
    let water = agent.parameters["water"];
    let height = agent.parameters["height"];
    let leaf = agent.parameters["leaf"];

    userCollection
      .findOne({
        uid: req.body.originalDetectIntentRequest.payload.data.source.userId
      })
      .exec()
      .then(docs => {
        user.save({
          report: [
            {
              farm: agent.parameters["farm"],
              water: agent.parameters["water"],
              height: agent.parameters["height"],
              leaf: agent.parameters["leaf"]
            }
          ]
        });
        console.log("บันทึกข้อมูลสำเร็จ!");
      })
      .catch(err => {
        console.log("บันทึกข้อมูลล้มเหลว!");
      });

    agent.add("บันทึกผลไปยังฐานข้อมูลเรียบร้อยค่ะ ✅");
    agent.add(
      'หากต้องการรายงานผลเพิ่มเติม 📋 \nกดที่เมนู "รายงานผลการเพาะปลูก" หรือพิมพ์ "รายงานผล" ได้เลยค่ะ ✨'
    );
  }

  // function will run when dialogflow intent match
  let intentMap = new Map();
  intentMap.set("Webhook", webhookTest);
  intentMap.set("GOSFWHLY", submit);
  agent.handleRequest(intentMap);
});

module.exports = router;
