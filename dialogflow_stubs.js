// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const fetch = require('node-fetch'); 
//const admin = require('firebase-admin');
const functions = require('firebase-functions');

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

/* --------------------------------------------------------
 * Firestore DB Not Required 
 */

 // function license_count_db(agent) {
 //    console.log("Hello");
 //    db.collection('device').get()
 //    .then((snapshot) => {
 //      snapshot.forEach((doc) => {
 //        console.log(doc.id, '=>', doc.data());
 //        agent.add(`License count is `+ doc.data());
 //      });
 //    })
 //    .catch((err) => {
 //      console.log('Error getting documents', err);
 //    });
 // }
 //-------------------------------------------------------

 /* FETCH GET CALL
  * Function: someAsyncCall
  * ---------------------------
  * perform fetch get call to 
  * to obtain JSON placeholder web data
  */
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
 
 /* INTENT HANDLER
  * Function: jsonholderHandler
  * ---------------------------
  * service Dialogflow intent  
  * for JSON placeholder 
  */
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

 /* FETCH GET CALL
  * Function: licenseFetchCall
  * ---------------------------
  * perform fetch get call to 
  * to obtain 'Show License' cli data
  */
  function licenseFetchCall(licenses_flag) {
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


 /* INTENT HANDLER
  * Function: license_count
  * ---------------------------
  * service Dialogflow intent  
  * for License Count 
  */
  function license_count(agent) {
     return licenseFetchCall('license_count')
    .then( function( message ){
      agent.add(`Number of `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: islicense_enabled
  * ---------------------------
  * service Dialogflow intent  
  * for checking if licenses are enabled/valid
  */
  function islicense_enabled(agent) {
     return licenseFetchCall('islicense_enabled')
    .then( function( message ){
      agent.add(`License Enabled: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: whenlicenses_expire
  * ---------------------------
  * service Dialogflow intent  
  * for checking when licenses expire
  */
  function whenlicenses_expire(agent) {
     return licenseFetchCall('whenlicenses_expire')
    .then( function( message ){
      agent.add(`License Expiration Info: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: apCount_licenses
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs 
  * supported by licenses
  */
  function apCount_licenses(agent) {
     return licenseFetchCall('apCount_licenses')
    .then( function( message ){
      agent.add(`Total APs supported by licenses `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* FETCH GET CALL
  * Function: versionFetchCall
  * ---------------------------
  * perform fetch get call to 
  * to obtain 'Show version' cli data
  */
  function versionFetchCall(version_flag) {
      console.log("Testing for licenses");
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+version', {method: 'GET'})
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

 /* INTENT HANDLER
  * Function: current_version
  * ------------------------------
  * service Dialogflow intent  
  * for getting current version
  */
  function current_version(agent) {
     return versionFetchCall('current_version')
    .then( function( message ){
      agent.add(`Current Version: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }
 
 /* INTENT HANDLER
  * Function: device_uptime
  * ------------------------------
  * service Dialogflow intent  
  * for getting uptime of the device
  */
  function device_uptime(agent) {
     return versionFetchCall('device_uptime')
    .then( function( message ){
      agent.add(`Uptime of device: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }
 
 /* INTENT HANDLER
  * Function: last_reboot
  * ------------------------------
  * service Dialogflow intent  
  * for getting timestamp of 
  * last reboot of the device
  */
  function last_reboot(agent) {
     return versionFetchCall('last_reboot')
    .then( function( message ){
      agent.add(`Last Reboot was on: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* FETCH GET CALL
  * Function: apDatabaseFetchCall
  * ---------------------------
  * perform fetch get call to 
  * to obtain 'Show ap database' cli data
  */
  function apDatabaseFetchCall(database_flag) {
      console.log("Testing for licenses");
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+apdatabase', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
            console.log("RESPONSE:"+response);
            //decision flag
            var jsonResp = JSON.parse(response);
            var licenseCount = jsonResp._data[0];
            return Promise.resolve(licenseCount);
        }).catch( function(error){
            console.log('ERROR: ' + error);
            return Promise.reject(error);
        });
  }

 /* INTENT HANDLER
  * Function: apCount_database
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs
  * obtianed from Show ap databses CLI
  */
  function apCount_database(agent) {
     return apDatabaseFetchCall('apCount_database')
    .then( function( message ){
      agent.add(`Total Number of APs: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: upAps_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs
  * whose status is 'Up'
  */
  function upAps_count(agent) {
     return apDatabaseFetchCall('upAps_count')
    .then( function( message ){
      agent.add(`Total Number of APs that are Up: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: upAps_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs
  * whose status is 'Down'
  */
  function downAps_count(agent) {
     return apDatabaseFetchCall('downAps_count')
    .then( function( message ){
      agent.add(`Total Number of APs that are Down: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: md_of_ap
  * ------------------------------
  * service Dialogflow intent  
  * for getting MD of a user
  * provided AP
  */
  function md_of_ap(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apDatabaseFetchCall(['md_of_ap','AP-DATA'])
    .then( function( message ){
      agent.add(`MD of AP: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: model_of_ap
  * ------------------------------
  * service Dialogflow intent  
  * for getting model of a user
  * provided AP
  */
  function model_of_ap(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apDatabaseFetchCall(['model_of_ap','AP-DATA'])
    .then( function( message ){
      agent.add(`Model of AP: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* FETCH GET CALL
  * Function: apEssidFetchCall
  * ---------------------------
  * perform fetch get call to 
  * to obtain 'Show ap essid' cli data
  */
  function apEssidFetchCall(essid_flag) {
      console.log("Testing for licenses");
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+apessid', {method: 'GET'})
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
 
 /* INTENT HANDLER
  * Function: essid_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of essids
  */
  function essid_count(agent) {
     return apEssidFetchCall('essid_count')
    .then( function( message ){
      agent.add(`Total Number ESSIDs: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: essids_count_of_ap
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of essids of a user
  * provided AP
  */
  function essids_count_of_ap(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apEssidFetchCall(['essids_count_of_ap','AP-DATA'])
    .then( function( message ){
      agent.add(`Total number of ESSIDs for AP: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: client_count_of_ap
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of essids of a user
  * provided AP
  */
  function client_count_of_ap(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apEssidFetchCall(['client_count_of_ap','AP-DATA'])
    .then( function( message ){
      agent.add(`Total number of clients for AP: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }


  /*----------------------------------- README -----------------------------------*/
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

  /*---------------------------------------- INTENT MAP -------------------------------------------*/
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
