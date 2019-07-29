// Vendors
const request = require('request');
const fs = require('fs');

function webServiceRequest(xmlData, object) {
    try {
        return new Promise((resolve, reject) => {
            try {
                const xmlEnveloped = xmlData.soapEnvelop;
                const url = xmlData.url;
                const soapAction = xmlData.soapAction;
                const certificatePath = object.config.diretorioDoCertificado;
                const certificatePassword = object.config.senhaDoCertificado;
                const webserviceRetry = object.config.insistirNoWebservice;
                
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
                    if (response && response.statusCode === 404)  {
                        const result = {
                            message: 'Webservice não foi encontrado',
                            error: response.statusCode + " - " + response.statusMessage
                        };

                        reject(result);
                    }
                    if (error) {
                        const result = {
                            message: 'Verifique se o webservice está online: ' + url,
                            error: error['message']
                        };
                        
                        if (result.error.code === 'ECONNRESET') {
                            setTimeout(() => {
                                if (webserviceRetry) {
                                    webServiceRequest(xmlEnveloped, url, soapAction, certificatePath, certificatePassword);
                                } else {
                                    resolve(result);
                                }
                            }, 20000)
                        } else {
                            reject(result);
                        }
                    }
                    resolve(response);
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        })        
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    webServiceRequest   
}