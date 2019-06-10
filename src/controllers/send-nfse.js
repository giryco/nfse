// Vendors
const request = require('request');
const fs = require('fs');

function webServiceRequest(xmlData, object) {
    const xmlEnveloped = xmlData.soapEnvelop;
    const url = xmlData.url;
    const soapAction = xmlData.soapAction;
    const certificatePath = object.config.diretorioDoCertificado;
    const certificatePassword = object.config.senhaDoCertificado;

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
                    } console.log(options, 51);
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