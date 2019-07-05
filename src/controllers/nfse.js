//Resources
const cities = require('../../resources/json/cities');
const nfseKeywordModelDictionary = require('../../resources/json/nfse-keyword-model-dictionary');

// Global constants
const regexLT = new RegExp('&lt;', 'g');
const regexGT = new RegExp('&gt;', 'g');
const regexQuot = new RegExp('&quot;', 'g');

//Global variables
var object = {};
var city = {};
var model = {};

//Controllers
const abrasf100Controller = require('./xml-creator/abrasf-1.00');
const abrasf201Controller = require('./xml-creator/abrasf-2.01');
const abrasf202Controller = require('./xml-creator/abrasf-2.02');
const abrasf204Controller = require('./xml-creator/abrasf-2.04');
const saopaulo100Controller = require('./xml-creator/sao-paulo-1.00');
const sendNfselController = require('./send-nfse');

/**
 * A função nfse tem como parâmetro o objeto com os valores do xml que será montado e enviado para o webservice do município declarado também neste objeto
 * Os detalhes de montagem deste objeto estão em nos arquivos de teste na pasta resource/testing deste mesmo projeto
 * @param {Object} newObject 
 */
const nfse = (newObject) => {
    object = newObject;
    return new Promise((resolve, reject) => {
        findCityByCodeAsync(object.config.codigoMunicipio);
        findModelByKeywordAsync(city.nfseKeyword);
        setModelToSend(city, model)
            .then(res => {
                const result = {
                    request: res.request,
                    response: res.response
                }
                
                resolve(result);
            })
            .catch(rej => {
                console.error(rej);
                reject(rej);
            })
    })
}

/**
 * A função findCityByCode tem como parâmetro o código de município declarado no objeto recebido pela função nfse
 * Esta função tem por objetivo encontrar informações necessárias para criação e envio da nota para o webservice correto e montagem da DANFE no arquivo cities.json da pasta resources/json deste projeto
 * @param {String} cityCode 
 */
const findCityByCode = (cityCode) => {
    try {
        for (let i = 0; i < cities.length; i++) {
            const c = cities[i];
            if (c.cityCode && (c.cityCode == cityCode)) {
                city = c;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

/**
 * A função nfseKeyword tem como parâmetro a palavra chave (nfseKeyword) encontrada no município definido na função findCityByCode
 * Esta função tem por objetivo determinar que modelo ABRASF (ou São Paulo) que deve ser seguido para a montagem do XML de acordo com o arquivo nfse-keyword-model-dictionary.json da pasta resources/json deste projeto
 * @param {String} nfseKeyword 
 */
const findModelByKeyword = (nfseKeyword) => {
    try {
        for (let i = 0; i < nfseKeywordModelDictionary.length; i++) {
            const m = nfseKeywordModelDictionary[i];

            if (m.nfseKeyword) {
                for (let j = 0; j < m.nfseKeyword.length; j++) {
                    const keyword = m.nfseKeyword[j];

                    if (keyword.name === nfseKeyword) {
                        model = m;
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

/**
 * A função setModelToSend tem como parâmetros o objeto city, definido na função findCityByCode, e o objeto model, definido na função findModelByKeyword
 * Esta função tem por objetivo utilizar do modelo de XML definido na função findModelByKeyword de acordo com os arquivos presentes na pasta src/controllers/xml-creator consideradas as peculiariedades definidas no arquivo settings.js na pasta src/controllers e os modelos em src/models
 * @param {Object} city 
 * @param {Object} model 
 */
const setModelToSend = (city, model) => {
    return new Promise((resolve, reject) => {
        try {
            const modelToCheck = {...model};
            // Strange exceptions: start
            if (object.config.acao === 'cancelarNfse' && city.nfseKeyword === 'ginfes') {
                modelToCheck.model = 'abrasf2.01';
            }
            // Strange exceptions: end
            if (modelToCheck.model === 'abrasf1.00') {
                abrasf100Controller.setRequirements(object, city)
                    .then(res => {
                        if (res['stack']) {
                            const result = {
                                status: 200,
                                request: res,
                                response: res['message'].split('[error]')
                            };
                            
                            resolve(result);
                        } else {
                            const objectWithXml = res.message;
                            sendNfselController.webServiceRequest(objectWithXml, object)
                                .then(resSentXml => {
                                    try {
                                        const result = {
                                            request: res,
                                            response: resSentXml.body.replace(regexLT, '<').replace(regexGT, '>').replace(regexQuot, '"')
                                        };
                                        resolve(result);
                                    } catch (error) {
                                        const result = {
                                            request: res,
                                            response: error
                                        };

                                        reject(result);
                                    }
                                    
                                })
                                .catch(rejSentXml => {
                                    reject(rejSentXml);
                                })
                        }
                    })
                    .catch(rej => {
                        reject(rej);
                    })
            } else if (modelToCheck.model === 'abrasf2.01') {
                abrasf201Controller.setRequirements(object, city)
                    .then(res => {
                        if (res['stack']) {
                            const result = {
                                status: 200,
                                request: res,
                                response: res['message'].split('[error]')
                            };
                            
                            resolve(result);
                        } else {
                            const objectWithXml = res.message;
                            sendNfselController.webServiceRequest(objectWithXml, object)
                                .then(resSentXml => {
                                    const result = {
                                        request: res,
                                        response: resSentXml.body.replace(regexLT, '<').replace(regexGT, '>').replace(regexQuot, '"')
                                    };
                                    
                                    resolve(result);
                                })
                                .catch(rejSentXml => {
                                    reject(rejSentXml);
                                })
                        }
                    })
                    .catch(rej => {
                        reject(rej);
                        console.error(rej);
                    })
            } else if (modelToCheck.model === 'saopaulo1.00') {
                saopaulo100Controller.setRequirements(object, city)
                    .then(res => {
                        if (res['stack']) {
                            const result = {
                                status: 200,
                                request: res,
                                response: res['message'].split('[error]')
                            };
                            
                            resolve(result);
                        } else {
                            const objectWithXml = res.message;
                            
                            sendNfselController.webServiceRequest(objectWithXml, object)
                                .then(resSentXml => {
                                    const result = {
                                        request: res,
                                        response: resSentXml.body.replace(regexLT, '<').replace(regexGT, '>').replace(regexQuot, '"')
                                    };
                                    resolve(result);
                                })
                                .catch(rejSentXml => {
                                    console.error(rejSentXml);
                                    reject(rejSentXml);
                                })
                        }
                    })
                    .catch(rej => {
                        reject(rej);
                        console.error(rej);
                    })
            } else {
                resolve({
                    status: 200,
                    message: 'Nenhum modelo encontrado'
                })
            }
        } catch (error) {
            reject(error);
        }
    });
}


const findCityByCodeAsync = async (cityCode) => {
    await findCityByCode(cityCode);
}

const findModelByKeywordAsync = async (cityCode) => {
    await findModelByKeyword(cityCode);
}

module.exports = {
    nfse
}