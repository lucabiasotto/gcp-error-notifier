const fetch = require('node-fetch');

const webhookURL = 'https://chat.googleapis.com/v1/spaces/AAAAfXCMcXs/messages?key=###################';


/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.errorNotifier = (req, res) => {
  
  var namespace = "Unknown";
  var errore = "Unknown";
  
  try{
    const jsonData = req.body.message.data ? Buffer.from(req.body.message.data, 'base64').toString() : '';
    //console.log('req.body.message.data:' + jsonData);
    var reqData = JSON.parse(jsonData);

    //app custom logic, based on log structure
    var line, namespaceIndex;
    for(var i=0; i<= reqData.protoPayload.line.length; i++){
      line = reqData.protoPayload.line[i];
      namespaceIndex = line.logMessage.indexOf("namespace: ");
      if(namespaceIndex >0){
        namespace = line.logMessage.substr(namespaceIndex + "namespace: ".length).replace("\n","");
      }

      if(line.severity == "WARNING" || line.severity == "ERROR"){
        errore = line.logMessage;
        break;
      }
    }

  }catch(e){
    console.error('Parse data fail');
  }
 
  //Create the message
  var requestBody = {
                "cards": [
                    {
                        "header": {
                            "title": "<b>Errore GAE rilevato</b>",
                            "imageUrl": "https://icon-library.com/images/error-image-icon/error-image-icon-23.jpg",
                            "imageStyle": "AVATAR"
                        },
                        "sections": [
                            {
                                "widgets": [
                                    {
                                        "keyValue": {
                                            "topLabel": "Ambiente",
                                            "content": "Multicompany",
                                            "contentMultiline":"true",
                                            "iconUrl":"https://github.com/google/material-design-icons/blob/master/png/social/group/materialicons/24dp/1x/baseline_group_black_24dp.png?raw=true"
                                        }
                                    },
                                    {
                                        "keyValue": {
                                            "topLabel": "Namespace",
                                            "content": namespace,
                                            "contentMultiline":"true",
                                            "iconUrl":"https://github.com/google/material-design-icons/blob/master/png/action/code/materialicons/24dp/1x/baseline_code_black_24dp.png?raw=true"
                                        }
                                    },
                                    {
                                        "keyValue": {
                                            "topLabel": "Errore",
                                            "content": errore,
                                            "contentMultiline":"true",
                                            "iconUrl":"https://github.com/google/material-design-icons/blob/master/png/alert/error/materialicons/24dp/1x/baseline_error_black_24dp.png?raw=true"
                                        }
                                    },
                                    {
                                        "buttons":[
                                            {
                                              "textButton": {
                                                "text": "VAI AI LOG",
                                                "onClick": {
                                                  "openLink": {
                                                    "url": "https://console.cloud.google.com/logs/viewer?project=keepit-multitenancy&minLogLevel=0&expandAll=false&timestamp=2021-01-20T14:53:12.000000000Z&customFacets=&limitCustomFacetWidth=true&advancedFilter=resource.type%3D%22gae_app%22%0Aseverity%3D%22ERROR%22&dateRangeStart=2021-01-20T13:53:12.293Z&dateRangeEnd=2021-01-20T14:53:12.293Z&interval=PT1H"
                                                  }
                                                }
                                              }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

  const data = JSON.stringify(requestBody);

  fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: data,
  }).then((response) => {
    res.status(204); 
    res.send('OK');
  });

  res.status(204); 
  res.send('OK'); 

};
