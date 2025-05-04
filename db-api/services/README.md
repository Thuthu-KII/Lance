This document highlights how to make use of each function:

The point of this branch is to modularise the db-api functions.

#jobservice.js:
    #getJobs()
        takes in no parameters, returns array of json in the form:
         {
        "jobID": 1,
        "clientName": "Jordan",
        "jobTitle": "Mechanic",
        "description": "Looking for an experienced, low-cost mechanic, who can service my car. I drive a GLE63.",
        "Status": 0,
        "createdAt": "2025-04-22T07:16:51.096Z",
        "updatedAt": "2025-04-22T07:16:51.096Z"
    } by way of example
    
    #createJob()
        takes in a json object called jobdata as an argument, in the form:
            {
    "name" : "Jordan",
    "jobTitle" : "Senior chief dev",
    "description" : "I am looking for a junior dev who is looking to work for minimum wage",
    "status" : 0
    }

#lancerService.js:
    #addLancer:
        takes in a json object in the form:
            {
    "id" : "iosaa;kl",
    "contact": "15416512",
    "occ" : "Builder"
}, where id would be the google id that is gotten from Oauth
Used to create new freelancer profiles

#clientService.js
    #addClient:
        takes in json called info, in the form:
            {
    "id" : "2453146",
    "contact" : "0665188893"
}
, where id would be the google id that is gotten from Oauth

