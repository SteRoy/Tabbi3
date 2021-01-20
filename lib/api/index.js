const axios = require("axios");

module.exports = {
    //
    //  requestAPI
    //  endpoint: string - api path for serverside
    //  requestType: string - ["POST", "GET"]
    //  successCB: (response) => {}
    //  failureCB: (errorMessage) => {}
    //  data?:  obj
    //
    requestAPI: (endpoint, requestType, successCB, failureCB, data) => {
        axios[requestType.toLowerCase()](`/api${endpoint}`, data).then(response => {
            if (response.data) {
                successCB(response.data);
            } else {
                failureCB(`The response was empty.`);
            }
        }).catch(error => {
            if (error.response.data.error) {
                failureCB(error.response.data.error);
            } else {
                failureCB(error.response.data || error.response.statusText);
            }
        })
    }
}