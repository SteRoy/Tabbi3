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
        if (requestType === "POST") {
            axios.post(`/api/${endpoint}`, data).then(response => {
                if (response.data) {
                    successCB(response.data);
                } else {
                    failureCB(`The response was empty.`);
                }
            }).catch(errorResponse => {
                if (errorResponse.data.error) {
                    failureCB(errorResponse.data.error);
                } else {
                    failureCB(`An unknown error occurred.`);
                }
            })
        }
    }
}