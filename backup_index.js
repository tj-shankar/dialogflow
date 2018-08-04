// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const fetch = require('node-fetch'); 
//const admin = require('firebase-admin');
const functions = require('firebase-functions');

//admin.initializeApp();

//var db = admin.firestore();

const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function someAsyncCall(searchId) {
      console.log("Testing with searchID="+searchId);
      return fetch('https://jsonplaceholder.typicode.com/users?id='+searchId, {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
            console.log("RESPONSE:"+response);
            return Promise.resolve(response);
        }).catch( function(error){
            console.log('ERROR: ' + error);
            return Promise.reject(error);
        });
   }
  
  function jsonholderHandler(agent) {  

    var searchId = request.body.queryResult.parameters.number;
    return someAsyncCall(searchId)
    .then( function( message ){
      agent.add(`You should hear this message `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 function license_count_db(agent) {
    console.log("Hello");
    db.collection('device').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
        agent.add(`License count is `+ doc.data());
      });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
 }
 
 function licenseCall() {
      console.log("Testing for licenses");
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+license', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
            console.log("RESPONSE:"+response);
            var jsonResp = JSON.parse(response);
            var licenseCount = jsonResp._data[0];
            return Promise.resolve(licenseCount);
        }).catch( function(error){
            console.log('ERROR: ' + error);
            return Promise.reject(error);
        });
  }
 
 function license_count(agent) {
     return licenseCall()
    .then( function( message ){
      agent.add(`Number of `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
 }
  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('jsonholder', jsonholderHandler);
  intentMap.set('license_count', license_count);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
