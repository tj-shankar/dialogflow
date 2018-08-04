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
  function licenseFetchCall(license_flag) {
      console.log("Testing for licenses "+license_flag);
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+license', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
          console.log("RESPONSE:"+response);
          var jsonResp = JSON.parse(response);
          var message = "Default_license_message";

  
          //response parsing based on license flag
          if(license_flag == 'license_count'){
            message = jsonResp._data[0]; 

          } else if(license_flag == 'license_enabled'){
            message = "yes license is enabled my frnd";

          } else if(license_flag == 'license_valid'){
            message = "yes license is valid bro";

          } else {
            //license_flag is eq license_ap_support
            message = "some APs are supported !!";
          }


          return Promise.resolve(message);
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
  * Function: license_enabled
  * ---------------------------
  * service Dialogflow intent  
  * for checking if licenses are enabled/valid
  */
  function license_enabled(agent) {
     return licenseFetchCall('license_enabled')
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
  * Function: license_valid
  * ---------------------------
  * service Dialogflow intent  
  * for checking when licenses expire
  */
  function license_valid(agent) {
     return licenseFetchCall('license_valid')
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
  * Function: license_ap_support
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs 
  * supported by licenses
  */
  function license_ap_support(agent) {
     return licenseFetchCall('license_ap_support')
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
  * Function: version_current
  * ------------------------------
  * service Dialogflow intent  
  * for getting current version
  */
  function version_current(agent) {
     return versionFetchCall('version_current')
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
  * Function: version_uptime
  * ------------------------------
  * service Dialogflow intent  
  * for getting uptime of the device
  */
  function version_uptime(agent) {
     return versionFetchCall('version_uptime')
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
  * Function: version_last_reboot
  * ------------------------------
  * service Dialogflow intent  
  * for getting timestamp of 
  * last reboot of the device
  */
  function version_last_reboot(agent) {
     return versionFetchCall('version_last_reboot')
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
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+ap+database', {method: 'GET'})
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
  * Function: ap_database_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs
  * obtianed from Show ap databses CLI
  */
  function ap_database_count(agent) {
     return apDatabaseFetchCall('ap_database_count')
    .then( function( message ){
      agent.add(`Total Number of APs in Show ap databse: `+ message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }

 /* INTENT HANDLER
  * Function: ap_database_up_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs
  * whose status is 'Up'
  */
  function ap_database_up_count(agent) {
     return apDatabaseFetchCall('ap_database_up_count')
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
  * Function: ap_database_down_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of APs
  * whose status is 'Down'
  */
  function ap_database_down_count(agent) {
     return apDatabaseFetchCall('ap_database_down_count')
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
  * Function: ap_database_md_associated
  * ------------------------------
  * service Dialogflow intent  
  * for getting MD of a user
  * provided AP
  */
  function ap_database_md_associated(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apDatabaseFetchCall(['ap_database_md_associated','AP-DATA'])
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
  * Function: ap_database_model
  * ------------------------------
  * service Dialogflow intent  
  * for getting model of a user
  * provided AP
  */
  function ap_database_model(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apDatabaseFetchCall(['ap_database_model','AP-DATA'])
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
  * Function: ap_essid_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of essids
  */
  function ap_essid_count(agent) {
     return apEssidFetchCall('ap_essid_count')
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
  * Function: ap_essid_ap_association
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of essids of a user
  * provided AP
  */
  function ap_essid_ap_association(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apEssidFetchCall(['ap_essid_ap_association','AP-DATA'])
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
  * Function: ap_essid_client_count
  * ------------------------------
  * service Dialogflow intent  
  * for getting count of essids of a user
  * provided AP
  */
  function ap_essid_client_count(agent) {
    //get AP details from request object
    //parse and send it to the fetch function

    //NOTE : an array is getting passed to the fetch async function
     return apEssidFetchCall(['ap_essid_client_count','AP-DATA'])
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
  //JSON Placeholder Intent Map
  intentMap.set('jsonholder', jsonholderHandler);
  
  //Show licence intent Map
  intentMap.set('license_count', license_count);
  intentMap.set('license_valid', license_valid);
  intentMap.set('license_enabled', license_enabled);
  intentMap.set('license_ap_support', license_ap_support);

  //Show version intent Map
  intentMap.set('version_current', version_current);
  intentMap.set('version_uptime', version_uptime);
  intentMap.set('version_last_reboot', version_last_reboot);

  //Show ap databases Intent Map
  intentMap.set('ap_database_count', ap_database_count);
  intentMap.set('ap_database_up_count', ap_database_up_count);
  intentMap.set('ap_database_down_count', ap_database_down_count);
  intentMap.set('ap_database_md_associated', ap_database_md_associated);
  intentMap.set('ap_database_model', ap_database_model);

  //Show ap essid Intent Map
  intentMap.set('ap_essid_count', ap_essid_count);
  intentMap.set('ap_essid_client_count', ap_essid_client_count);
  intentMap.set('ap_essid_ap_association', ap_essid_ap_association);

  //------------------------------ To Be Removed ---------------------------//
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
