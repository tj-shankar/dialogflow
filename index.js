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
  
  function parseLicenseInfo(obj, license_flag) {
        var licenseArray = obj["License Table"];
        var enabled = 0;
        var apNum = 0;
        var numLicenses = (obj._data[0]).split(": ")[1];
        var minDate = new Date(8640000000000000);
        console.log("Date is " + minDate);
        var message = "Default Message";
        for (var entry in licenseArray) {
            
            var licStatus = licenseArray[entry]["Expires(Grace period expiry)"];
            
            var string = licenseArray[entry]["Service Type"];
            if (string.includes("Access") && !licStatus.includes("Expired")) {
                        
                        apNum = string.replace( /^\D+/g, '');
                
            }

            if(!licStatus.includes("Expired") && 
                licenseArray[entry].Flags=="E") {
                      enabled++;
                
            }
        
            if (!licStatus.includes("Expired") && !licStatus.includes("Never")) {
                        var d2 = new Date(licStatus);
                        if (d2 < minDate) {
                            minDate = d2;
                        }
            }
        }
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        
      if(license_flag == 'license_count'){
        message = "Number of licenses:"+numLicenses;
      } else if(license_flag == 'license_enabled'){
        message = "Number of licenses enabled:"+enabled;
      } else if(license_flag == 'license_valid'){
        message = "Earliest expiring license is " + minDate.toLocaleDateString("en-US", options);
      } else {
        message = apNum + " APs are supported";
      }
      return message;
  }
  
  function licenseFetchCall(license_flag) {
      console.log("Testing for licenses "+license_flag);
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+license', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
          console.log("RESPONSE:"+response);
          var jsonResp = JSON.parse(response);
          var message = parseLicenseInfo(jsonResp, license_flag);

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
      agent.add(message);
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
      agent.add(message);
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
      agent.add(message);
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
      agent.add(message);
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
      console.log("Testing for the show version command");
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+version', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
            console.log("RESPONSE:"+response);
            var message = "Default Show version output";
            var jsonResp = JSON.parse(response);
            var version_text = jsonResp._data[0];
            //initialise variables
            var version = "not found";
            var uptime = "not found";
            var reboot_reason = "not found";
            
            //spliting response over newline 
            var cont = version_text.split("\n");
            //Parsing version text
            for (var i in cont){

                if(cont[i].includes("ArubaOS")){

                version = cont[i];
                } else if(cont[i].includes("Switch uptime")){
      
                  uptime = cont[i];
                } else if(cont[i].includes("Reboot Cause")){
     
                  reboot_reason = cont[i];
                } else {
                  continue;
                }
            }

            //updating response message of Promise
            if (version_flag == "version_current"){
                message = version;
            } else if (version_flag == "version_uptime"){
                message = uptime;
            } else {
                message = reboot_reason;
            }
            
            return Promise.resolve(message);
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
      agent.add(message);
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
      agent.add(message);
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
  function apDatabaseFetchCall(database_arr) {
      console.log("Testing for Show AP databases");
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+ap+database', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
            console.log("RESPONSE:"+response);
        
            let obj_ap = JSON.parse(response);
            var apArray = obj_ap["AP Database"];
            var message = "Default AP Database Message";
                
            if(database_arr[0] == "ap_database_count"){
              var ap_count = apArray.length;
              message = "Total Number of APs is " + ap_count;
            } else if ( database_arr[0] == "ap_database_up_count") {
                var apNumUp = 0;
                for (var entry in apArray){
                  var ApStatus = apArray[entry]["Status"];
                  if(ApStatus.includes("Up")){
                    apNumUp++;
                  }
                }
                message = "Total Number of APs that are Up is " + apNumUp; 
            } else if ( database_arr[0] == "ap_database_down_count") {
                var apNumDown = 0;
                for (entry in apArray) {
                  ApStatus = apArray[entry]["Status"];
                  if(!ApStatus.includes("Up"))
                  {
                    apNumDown++;
                  }
                }
                message = "Total Number of APs that are Down is " + apNumDown;
            } else if ( database_arr[0] == "ap_database_md_associated") {
                var ApName = database_arr[1];
                message = "Cannot find MD associated with AP " + ApName; 
                for (entry in apArray) {
                  var name = apArray[entry]["Name"];
                  if(name == ApName) {
                    message = "AP " + ApName + " terminates on MD with IP " + apArray[entry]["Switch IP"];
                    break;
                  }
                }
                
            } else {
                // check for ap_database_model
                ApName = database_arr[1];
                message = "Cannot find model of AP " + ApName; 
                for (entry in apArray) {
                  name = apArray[entry]["Name"];
                  if(name == ApName) {
                    message = "AP " + ApName + " model number is AP-" + apArray[entry]["AP Type"];
                    break;
                  }
                }
            }

            return Promise.resolve(message);
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
     return apDatabaseFetchCall(['ap_database_count'])
    .then( function( message ){
      agent.add(message);
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
      console.log('ap_database_up_count');
     return apDatabaseFetchCall(['ap_database_up_count'])
    .then( function( message ){
      agent.add(message);
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
     return apDatabaseFetchCall(['ap_database_down_count'])
    .then( function( message ){
      agent.add(message);
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
     var apName = request.body.queryResult.parameters.any;
     return apDatabaseFetchCall(['ap_database_md_associated', apName])
    .then( function( message ){
      agent.add(message);
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
     var apName = request.body.queryResult.parameters.any;
     return apDatabaseFetchCall(['ap_database_model', apName])
    .then( function( message ){
      agent.add(message);
      return Promise.resolve();
    })
    .catch( function( err ){
      agent.add(`Uh oh, something happened.`);
      return Promise.resolve();  // Don't reject again, or it might not send the reply
    });
  }



    /*How many essids do I have?*/
   
  function numberOfESSIDs(essArray)
  {
    var essNum = 0;
    var message;
    var entry;
    for (entry in essArray) {
      essNum++;
    }
    if (essNum === 0) {
      message = "There are no SSIDs in the network";
    } else {
      message = "There are " + essNum + " SSIDs in the network";
    }
    return message;
  }
   
  /*How many essids is associated with AP <name>*/
   
  function numClientonSSID(essArray, essName)
  {
    var message = "Error Occurred";
    var entry;
    var clientCount = 0;
    console.log("Calculating number of clients..");
    for (entry in essArray) {
      var name = essArray[entry].ESSID;
      if(name == essName) {
        clientCount = essArray[entry].Clients;
      }
    }
    message = "SSID " + essName + " has " + clientCount + " clients";
    return message;
  }

  function parseApEssidInfo(obj, essid_flag_table) {
      var essArray = obj["ESSID Summary"];
      var message; 
      console.log(essid_flag_table);
      if(essid_flag_table[0] == 'ap_essid_count'){
        message = numberOfESSIDs(essArray);
      } else if(essid_flag_table[0] == 'ap_essid_client_count'){
        message = numClientonSSID(essArray, essid_flag_table[1]);
      } else {
        message = "ERROR!";
      }
      return message;
  }
 /* FETCH GET CALL
  * Function: apEssidFetchCall
  * ---------------------------
  * perform fetch get call to 
  * to obtain 'Show ap essid' cli data
  */
  function apEssidFetchCall(essid_flag_table) {
      console.log("Testing for Essid:"+essid_flag_table[0]+":"+essid_flag_table[1]);
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+ap+essid', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
            console.log("RESPONSE:"+response);
            var jsonResp = JSON.parse(response);
            var message = parseApEssidInfo(jsonResp, essid_flag_table);
            return Promise.resolve(message);
        }).catch( function(error){
            console.log('ERROR: ' + error);
            return Promise.reject(error);
        });
  }

  /* FETCH GET CALL
  * Function: apBssTableFetchCall
  * ---------------------------
  * perform fetch get call to 
  * to obtain 'Show ap essid' cli data
  */
  function apBssTableFetchCall(apName) {
      console.log("Testing for BSSID");
      return fetch('http://35.233.202.126:5000/exec?ip=35.162.71.116&type=show&cmd=show+ap+bss-table', {method: 'GET'})
        .then(response => response.text())
        .then(response => { 
            console.log("RESPONSE:"+response);
            var jsonResp = JSON.parse(response);
            var bssArray = jsonResp["Aruba AP BSS Table"];
            var entry;
            /*How many essids is associated with AP <name>*/
            var bsscount = 0;
            for (entry in bssArray) {
              var name = bssArray[entry]["ap name"];
              if(name == apName) {
                if(bssArray[entry].ess !== 0) {
                  bsscount++;
                }
              }
            }
 
            var message = "AP " + apName + " has " + bsscount + " SSIDs";
            return Promise.resolve(message);
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
     return apEssidFetchCall(['ap_essid_count', 'NA'])
    .then( function( message ){
      agent.add(message);
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
    var apName = request.body.queryResult.parameters.any;
     return apBssTableFetchCall(apName)
    .then( function( message ){
      agent.add(message);
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
    var essName = request.body.queryResult.parameters.any;
    console.log("Got essName as:"+ essName);
     return apEssidFetchCall(['ap_essid_client_count',essName])
    .then( function( message ){
      agent.add(message);
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
  intentMap.set('ap_essid_clients_count', ap_essid_client_count);
  intentMap.set('ap_essid_ap_association', ap_essid_ap_association);

  //------------------------------ To Be Removed ---------------------------//
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
