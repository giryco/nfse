// Vendors
const request = require('request');

function webServiceRequest(xmlEnveloped, url, soapAction = null, certificatePath, certificatePassword) {
    try {
        return new Promise((resolve, reject) => {
            try {
                var options = {
                    method: 'POST',
                    url: url,
                    agentOptions: {
                        pfx: fs.readFileSync(certificatePath),
                        passphrase: certificatePassword,
                    },
                    headers: {
                        "Accept": "text/xml",
                        "Content-Type": "text/xml;charset=UTF-8"
                    },
                    body: xmlEnveloped,
                    pool: {maxSockets: Infinity}
                };
    
                if (soapAction) {
                    options.headers = {
                        "Accept": "text/xml",
                        "Content-Type": "text/xml;charset=UTF-8",
                        "SOAPAction": soapAction,
                    }
                }
                request(options, function (error, response, body) {
                    if (error) {
                        const result = {
                            message: 'Verifique se o webservice está online',
                            error: error 
                        };
                        
                        if (result.error.code === 'ECONNRESET') {
                            setTimeout(() => {
                                webServiceRequest(xmlEnveloped, url, soapAction, certificatePath, certificatePassword);
                            }, 20000)
                        } else {
                            reject(result);
                        }
                    }
                    resolve(response);
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })        
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    webServiceRequest   
}