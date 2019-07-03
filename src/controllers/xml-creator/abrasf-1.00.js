// Vendors
const fs = require('fs');
const pem = require('pem');
const validator = require('xsd-schema-validator');

// Libs
const XmlSignatureController = require('../../../lib/xml-signature');
const xmlSignatureController = new XmlSignatureController();

// Controllers
const settingsController = require('../settings');

const setRequirements = (object, city) => {
    const d = new Date();
    const timestamp = Date.now();
    const numeroLote = timestamp.toString().substring(4, 13) + (d.getYear() - 100);

    return new Promise((resolve, reject) => {
        try {
            const particularitiesObject = settingsControllerAsync(object, city);

            createXml(object, particularitiesObject, numeroLote)
                .then(res => {
                    const result = {
                        status: 200,
                        message: res
                    };

                    resolve(result);
                })
                .catch(rej => {
                    const result = {
                        status: 500,
                        message: rej
                    };
                    reject(result);
                })
        } catch (error) {
            const result = {
                status: 500,
                message: error
            };
            reject(result);
        }
    })
}

const createXml = async (object, particularitiesObject, numeroLote) => {
    return new Promise((resolve, reject) => {
        try {
            const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

            switch (object.config.acao) {
                case 'enviarLoteRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            let uniqueValue = numeroLote;
                            let regexUnique = new RegExp('_uniqueValue', 'g');

                            let xml = `<${particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] ? particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] : particularitiesObject['tags']['enviarLoteRpsEnvio']}>`;
                            xml += `<${particularitiesObject['tags']['loteRpsAlterada'] ? particularitiesObject['tags']['loteRpsAlterada'] : particularitiesObject['tags']['loteRps']}>`;
                            if (numeroLote) {
                                xml += `<${particularitiesObject['tags']['numeroLoteAlterada'] ? particularitiesObject['tags']['numeroLoteAlterada'] : particularitiesObject['tags']['numeroLote']}>` + numeroLote + `</${particularitiesObject['tags']['numeroLote']}>`;
                            }
                            if (object.emissor.cpfCnpj) {
                                xml += `<${particularitiesObject['tags']['cnpjAlterada'] ? particularitiesObject['tags']['cnpjAlterada'] : particularitiesObject['tags']['cnpj']}>` + object.emissor.cpfCnpj.replace(/[^\d]+/g, '') + `</${particularitiesObject['tags']['cnpj']}>`;
                            }
                            if (object.emissor.inscricaoMunicipal && object.emissor.inscricaoMunicipal != '') {
                                xml += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>` + object.emissor.inscricaoMunicipal + `</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                            }
                            xml += `<${particularitiesObject['tags']['quantidadeRpsAlterada'] ? particularitiesObject['tags']['quantidadeRpsAlterada'] : particularitiesObject['tags']['quantidadeRps']}>` + object.rps.length + `</${particularitiesObject['tags']['quantidadeRps']}>`;
                            xml += `<${particularitiesObject['tags']['listaRpsAlterada'] ? particularitiesObject['tags']['listaRpsAlterada'] : particularitiesObject['tags']['listaRps']}>`;

                            xml = xml.replace(regexUnique, uniqueValue);

                            addSignedXml(object, cert, particularitiesObject, numeroLote)
                                .then(signedXmlRes => {
                                    signedXmlRes.forEach(element => {
                                        xml += element;
                                    });
                                    xml += `</${particularitiesObject['tags']['listaRps']}>`;
                                    xml += `</${particularitiesObject['tags']['loteRps']}>`;
                                    xml += `</${particularitiesObject['tags']['enviarLoteRpsEnvio']}>`;

                                    let isEmptyUri = null;
                                    if (particularitiesObject['isSigned']['isEmptyUri']) {
                                        isEmptyUri = particularitiesObject['isSigned']['isEmptyUri'];
                                    }

                                    let signatureId = null;
                                    if (particularitiesObject['isSigned']['signatureId']) {
                                        signatureId = particularitiesObject['isSigned']['signatureId'];
                                    }


                                    let isDifferentSignature = false;
                                    if (particularitiesObject['isSigned']['isDifferentSignature']) {
                                        isDifferentSignature = particularitiesObject['isSigned']['isDifferentSignature'];
                                    }

                                    createSignature(xml, cert, 'LoteRps', signatureId, isEmptyUri, isDifferentSignature)
                                        .then(xmlSignature => {
                                            if (particularitiesObject['xsds']['enviarLoteRps']) {
                                                validator.validateXML(xmlSignature, __dirname + particularitiesObject['xsds']['enviarLoteRps'], function (err, validatorResult) {
                                                    if (err) {
                                                        console.error(err);
                                                        return resolve(err);
                                                    }

                                                    if (!validatorResult.valid) {
                                                        console.error(validatorResult);
                                                        return resolve(validatorResult);
                                                    }
                                                })
                                            }
                                            try {
                                                let xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);

                                                const result = {
                                                    url: particularitiesObject['webserviceUrl'],
                                                    soapEnvelop: xml
                                                }
                                                if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['enviarLoteRps']) {
                                                    result['soapAction'] = particularitiesObject['soapActions']['enviarLoteRps'];
                                                }

                                                resolve(result);
                                            } catch (error) {
                                                console.error(error);
                                            }
                                        }).catch(err => {
                                            console.error(err);
                                        });
                                })
                                .catch(signedXmlRej => {
                                    console.error(signedXmlRej);
                                    reject(signedXmlRej);
                                })
                        });
                    } catch (error) {
                        reject(error);
                    }
                    break;

                case 'cancelarNfse':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            let uniqueValue = numeroLote;
                            let regexUnique = new RegExp('_uniqueValue', 'g');


                            let xmlNotSigned = `<${particularitiesObject['tags']['pedidoAlterada'] ? particularitiesObject['tags']['pedidoAlterada'] : particularitiesObject['tags']['pedido']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['infPedidoCancelamentoAlterada'] ? particularitiesObject['tags']['infPedidoCancelamentoAlterada'] : particularitiesObject['tags']['infPedidoCancelamento']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['identificacaoNfseAlterada'] ? particularitiesObject['tags']['identificacaoNfseAlterada'] : particularitiesObject['tags']['identificacaoNfse']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['numeroAlterada'] ? particularitiesObject['tags']['numeroAlterada'] : particularitiesObject['tags']['numero']}>${object.numeroNfse}</${particularitiesObject['tags']['numero']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['cnpjAlterada'] ? particularitiesObject['tags']['cnpjAlterada'] : particularitiesObject['tags']['cnpj']}>${object.prestador.cpfCnpj}</${particularitiesObject['tags']['cnpj']}>`;
                            if (object.prestador.inscricaoMunicipal && object.prestador.inscricaoMunicipal != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>${object.prestador.inscricaoMunicipal}</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                            }
                            if (object.config.codigoMunicipio && object.config.codigoMunicipio != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['codigoMunicipioAlterada'] ? particularitiesObject['tags']['codigoMunicipioAlterada'] : particularitiesObject['tags']['codigoMunicipio']}>${object.config.codigoMunicipio}</${particularitiesObject['tags']['codigoMunicipio']}>`;
                            }
                            xmlNotSigned += `</${particularitiesObject['tags']['identificacaoNfse']}>`;
                            if (object.codigoCancelamento && object.codigoCancelamento != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['codigoCancelamentoAlterada'] ? particularitiesObject['tags']['codigoCancelamentoAlterada'] : particularitiesObject['tags']['codigoCancelamento']}>${object.codigoCancelamento}</${particularitiesObject['tags']['codigoCancelamento']}>`;
                            }
                            xmlNotSigned += `</${particularitiesObject['tags']['infPedidoCancelamento']}>`;
                            xmlNotSigned += `</${particularitiesObject['tags']['pedido']}>`;

                            xmlNotSigned = xmlNotSigned.replace(regexUnique, uniqueValue);
                            createSignature(xmlNotSigned, cert, 'InfPedidoCancelamento', particularitiesObject['isSigned']['signatureId'], null)
                                .then(xmlSignature => {
                                    // if (particularitiesObject['xsds']['cancelarNfse']) {
                                    //     validator.validateXML(xmlSignature, __dirname + particularitiesObject['xsds']['cancelarNfse'], function (err, validatorResult) {
                                    //         if (err) {
                                    //             console.error(err);
                                    //             resolve(err);
                                    //         }

                                    //         if (!validatorResult.valid) {
                                    //             console.error(validatorResult);
                                    //             resolve(validatorResult);
                                    //         }
                                    //     })
                                    // }

                                    // This tag is here so the xml can be correctly signed
                                    let xml = `<${particularitiesObject['tags']['cancelarNfseEnvioAlterada'] ? particularitiesObject['tags']['cancelarNfseEnvioAlterada'] : particularitiesObject['tags']['cancelarNfseEnvio']}>`;
                                    xml += xmlNotSigned;
                                    xml += `</${particularitiesObject['tags']['cancelarNfseEnvio']}>`;


                                    xml = particularitiesObject['envelopment'].replace('__xml__', xml);

                                    if (particularitiesObject['isSigned']['cancelarNfse']) {
                                        xml = `<${particularitiesObject['tags']['cancelarNfseEnvioAlterada'] ? particularitiesObject['tags']['cancelarNfseEnvioAlterada'] : particularitiesObject['tags']['cancelarNfseEnvio']}>`;
                                        xml += xmlSignature;
                                        xml += `</${particularitiesObject['tags']['cancelarNfseEnvio']}>`;

                                        xml = particularitiesObject['envelopment'].replace('__xml__', xml);
                                    } else {

                                    }

                                    const result = {
                                        url: particularitiesObject['webserviceUrl'],
                                        soapEnvelop: xml
                                    }
                                    if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['cancelarNfse']) {
                                        result['soapAction'] = particularitiesObject['soapActions']['cancelarNfse'];
                                    }

                                    resolve(result);
                                }).catch(err => {
                                    console.error(err);
                                });
                        });

                    } catch (error) {
                        reject(error);
                    }
                    break;

                case 'consultarLoteRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            let xmlNotSigned = `<${particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] ? particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] : particularitiesObject['tags']['consultarLoteRpsEnvio']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['prestadorAlterada'] ? particularitiesObject['tags']['prestadorAlterada'] : particularitiesObject['tags']['prestador']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['cnpjAlterada'] ? particularitiesObject['tags']['cnpjAlterada'] : particularitiesObject['tags']['cnpj']}>${object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '')}</${particularitiesObject['tags']['cnpj']}>`;
                            if (object.prestador.inscricaoMunicipal && object.prestador.inscricaoMunicipal != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>${object.prestador.inscricaoMunicipal}</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                            }
                            xmlNotSigned += `</${particularitiesObject['tags']['prestador']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['protocoloAlterada'] ? particularitiesObject['tags']['protocoloAlterada'] : particularitiesObject['tags']['protocolo']}>${object.protocolo}</${particularitiesObject['tags']['protocolo']}>`;
                            xmlNotSigned += `</${particularitiesObject['tags']['consultarLoteRpsEnvio']}>`;

                            createSignature(xmlNotSigned, cert, 'ConsultarLoteRpsEnvio')
                                .then(xmlSignature => {
                                    if (particularitiesObject['xsds']['consultarLoteRps']) {
                                        validator.validateXML(xmlSignature, __dirname + particularitiesObject['xsds']['consultarLoteRps'], function (err, validatorResult) {
                                            if (err) {
                                                console.error(err);
                                                resolve(err);
                                            }

                                            if (!validatorResult.valid) {
                                                console.error(validatorResult);
                                                resolve(validatorResult);
                                            }
                                        })
                                    }
                                    let xml = particularitiesObject['envelopment'].replace('__xml__', xmlNotSigned);

                                    if (particularitiesObject['isSigned']['consultarLoteRps']) {
                                        xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);
                                    }

                                    const result = {
                                        url: particularitiesObject['webserviceUrl'],
                                        soapEnvelop: xml
                                    }
                                    if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarLoteRps']) {
                                        result['soapAction'] = particularitiesObject['soapActions']['consultarLoteRps'];
                                    }

                                    resolve(result);
                                }).catch(err => {
                                    console.error(err);
                                });
                        });
                    } catch (error) {
                        reject(error);
                    }
                    break;


                case 'consultarNfsePorRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            let xmlNotSigned = `<${particularitiesObject['tags']['consultarNfseRpsEnvioAlterada'] ? particularitiesObject['tags']['consultarNfseRpsEnvioAlterada'] : particularitiesObject['tags']['consultarNfseRpsEnvio']}>`;

                            xmlNotSigned += `<${particularitiesObject['tags']['identificacaoRpsAlterada'] ? particularitiesObject['tags']['identificacaoRpsAlterada'] : particularitiesObject['tags']['identificacaoRps']}>`;
                            if (object.rps.numero && object.rps.numero != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['numeroAlterada'] ? particularitiesObject['tags']['numeroAlterada'] : particularitiesObject['tags']['numero']}>${object.rps.numero}</${particularitiesObject['tags']['numero']}>`;
                            }
                            if (object.rps.serie && object.rps.serie != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['serieAlterada'] ? particularitiesObject['tags']['serieAlterada'] : particularitiesObject['tags']['serie']}>${object.rps.serie}</${particularitiesObject['tags']['serie']}>`;
                            }
                            if (object.rps.tipo && object.rps.tipo != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['tipoAlterada'] ? particularitiesObject['tags']['tipoAlterada'] : particularitiesObject['tags']['tipo']}>${object.rps.tipo}</${particularitiesObject['tags']['tipo']}>`;
                            }
                            xmlNotSigned += `</${particularitiesObject['tags']['identificacaoRps']}>`;

                            xmlNotSigned += `<${particularitiesObject['tags']['prestadorAlterada'] ? particularitiesObject['tags']['prestadorAlterada'] : particularitiesObject['tags']['prestador']}>`;
                            xmlNotSigned += `<${particularitiesObject['tags']['cnpjAlterada'] ? particularitiesObject['tags']['cnpjAlterada'] : particularitiesObject['tags']['cnpj']}>${object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '')}</${particularitiesObject['tags']['cnpj']}>`;
                            if (object.prestador.inscricaoMunicipal && object.prestador.inscricaoMunicipal != '') {
                                xmlNotSigned += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>${object.prestador.inscricaoMunicipal}</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                            }
                            xmlNotSigned += `</${particularitiesObject['tags']['prestador']}>`;
                            xmlNotSigned += `</${particularitiesObject['tags']['consultarNfseRpsEnvio']}>`;
                            
                            let isEmptyUri = null;
                            if (particularitiesObject['isSigned']['isEmptyUri']) {
                                isEmptyUri = particularitiesObject['isSigned']['isEmptyUri'];
                            }

                            let signatureId = null;
                            if (particularitiesObject['isSigned']['signatureId']) {
                                signatureId = particularitiesObject['isSigned']['signatureId'];
                            }

                            let isDifferentSignature = false;
                            if (particularitiesObject['isSigned']['isDifferentSignature']) {
                                isDifferentSignature = particularitiesObject['isSigned']['isDifferentSignature'];
                            }

                            createSignature(xmlNotSigned, cert, 'ConsultarNfseRpsEnvio', signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {
                                    if (particularitiesObject['xsds']['consultarNfseRps']) {
                                        validator.validateXML(xmlSignature, __dirname + particularitiesObject['xsds']['consultarNfseRps'], function (err, validatorResult) {
                                            if (err) {
                                                console.error(err);
                                                resolve(err);
                                            }

                                            if (!validatorResult.valid) {
                                                console.error(validatorResult);
                                                resolve(validatorResult);
                                            }
                                        })
                                    }
                                    let xml = particularitiesObject['envelopment'].replace('__xml__', xmlNotSigned);

                                    if (particularitiesObject['isSigned']['consultarNfseRps']) {
                                        xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);
                                    }

                                    const result = {
                                        url: particularitiesObject['webserviceUrl'],
                                        soapEnvelop: xml
                                    }

                                    if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarNfseRps']) {
                                        result['soapAction'] = particularitiesObject['soapActions']['consultarNfseRps'];
                                    }
                                    
                                    resolve(result);
                                }).catch(err => {
                                    console.error(err);
                                });
                        });
                    } catch (error) {
                        reject(error);
                    }
                    break;

                case 'consultarSituacaoLoteRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            let xml = '<ConsultarSituacaoLoteRpsEnvio xmlns:ns3="http://www.ginfes.com.br/servico_consultar_situacao_lote_rps_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd">';
                            xml += '<Prestador>';
                            xml += '<Cnpj>' + object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                            if (object.prestador.inscricaoMunicipal && object.prestador.inscricaoMunicipal != '') {
                                xml += '<InscricaoMunicipal>' + object.prestador.inscricaoMunicipal + '</InscricaoMunicipal>';
                            }
                            xml += '</Prestador>';
                            xml += '<Protocolo>' + object.protocolo + '</Protocolo>';
                            xml += '</ConsultarSituacaoLoteRpsEnvio>';

                            createSignature(xml, cert, 'ConsultarSituacaoLoteRpsEnvio').then(xmlSignature => {
                                validator.validateXML(xmlSignature, __dirname + '/../../../resources/xsd/ginfes/servico_consultar_situacao_lote_rps_envio_v03.xsd', function (err, validatorResult) {
                                    if (err) {
                                        console.error(err);
                                        resolve(err);
                                    }

                                    if (!validatorResult.valid) {
                                        console.error(validatorResult);
                                        resolve(validatorResult);
                                    }

                                    let xml = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
                                    xml += '<soap:Body>';
                                    xml += '<ns1:ConsultarSituacaoLoteRpsV3 xmlns:ns1="' + particularitiesObject['urlXmlns'] + '">';
                                    xml += '<arg0>';
                                    xml += '<ns2:cabecalho versao="3" xmlns:ns2="http://www.ginfes.com.br/cabecalho_v03.xsd">';
                                    xml += '<versaoDados>3</versaoDados>';
                                    xml += '</ns2:cabecalho>';
                                    xml += '</arg0>';
                                    xml += '<arg1>';
                                    xml += xmlSignature;
                                    xml += '</arg1>';
                                    xml += '</ns1:ConsultarSituacaoLoteRpsV3>';
                                    xml += '</soap:Body>';
                                    xml += '</soap:Envelope>';

                                    const result = {
                                        url: particularitiesObject['webserviceUrl'],
                                        soapEnvelop: xml
                                    }

                                    resolve(result);
                                });
                            }).catch(err => {
                                console.error(err);
                            });
                        });

                    } catch (error) {
                        reject(error);
                    }
                    break;

                case 'consultarNfse':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            let xml = '<ConsultarNfseEnvio xmlns:ns3="http://www.ginfes.com.br/servico_consultar_nfse_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd">';
                            xml += '<Prestador>';
                            xml += '<Cnpj>' + object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                            if (object.prestador.inscricaoMunicipal && object.prestador.inscricaoMunicipal != '') {
                                xml += '<InscricaoMunicipal>' + object.prestador.inscricaoMunicipal + '</InscricaoMunicipal>';
                            }
                            xml += '</Prestador>';
                            xml += '<PeriodoEmissao>';
                            xml += '<DataInicial>' + object.periodoEmissao.dataInicial + '</DataInicial>';
                            xml += '<DataFinal>' + object.periodoEmissao.dataFinal + '</DataFinal>';
                            xml += '</PeriodoEmissao>';
                            // xml += '<Tomador>';
                            // xml += '<CpfCnpj>';
                            // if (object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 11) {
                            //     xml += '<Cpf>' + object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cpf>';
                            // }

                            // if (object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 14) {
                            //     xml += '<Cnpj>' + object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                            // }
                            // xml += '</CpfCnpj>';
                            // xml += '</Tomador>';
                            xml += '</ConsultarNfseEnvio>';

                            createSignature(xml, cert, 'ConsultarNfseEnvio').then(xmlSignature => {
                                validator.validateXML(xmlSignature, __dirname + '/../../../resources/xsd/ginfes/servico_consultar_nfse_envio_v03.xsd', function (err, validatorResult) {
                                    if (err) {
                                        console.error(err);
                                        resolve(err);
                                    }

                                    if (!validatorResult.valid) {
                                        console.error(validatorResult);
                                        resolve(validatorResult);
                                    }

                                    let xml = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
                                    xml += '<soap:Body>';
                                    xml += '<ns1:ConsultarSituacaoLoteRpsV3 xmlns:ns1="' + particularitiesObject['urlXmlns'] + '">';
                                    xml += '<arg0>';
                                    xml += '<ns2:cabecalho versao="3" xmlns:ns2="http://www.ginfes.com.br/cabecalho_v03.xsd">';
                                    xml += '<versaoDados>3</versaoDados>';
                                    xml += '</ns2:cabecalho>';
                                    xml += '</arg0>';
                                    xml += '<arg1>';
                                    xml += xmlSignature;
                                    xml += '</arg1>';
                                    xml += '</ns1:ConsultarSituacaoLoteRpsV3>';
                                    xml += '</soap:Body>';
                                    xml += '</soap:Envelope>';

                                    const result = {
                                        url: particularitiesObject['webserviceUrl'],
                                        soapEnvelop: xml
                                    }

                                    resolve(result);
                                });
                            }).catch(err => {
                                console.error(err);
                            });
                        });

                    } catch (error) {
                        reject(error);
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            let result = {
                status: 500,
                message: error
            }
            if (error.errno === -2) {
                result = {
                    ...result,
                    message: 'PFX não encontrado'
                }
            }

            reject(result);
        }
    })
}

module.exports = {
    createXml
}

function addSignedXml(object, cert, particularitiesObject, numeroLote) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();

        try {
            let uniqueValue = numeroLote;
            let regexUnique = new RegExp('_uniqueValue', 'g');
            let xmlToBeSigned = '';
            let xmlToBeSignedArray = [];
            let xmlSignedArray = [];
            object.rps.forEach((r, index) => {
                let numeroRps = r.numero ? r.numero : timestamp + index;
                let serieRps = r.serie ? r.serie : 'RPS';
                let prestadorCnpj;
                let prestadorIncricaoMunicipal;
                if (r.prestador) {
                    if (r.prestador.cpfCnpj && r.prestador.cpfCnpj != '') {
                        prestadorCnpj = r.prestador.cpfCnpj.replace(/[^\d]+/g, '');
                    }
                    if (r.prestador.inscricaoMunicipal && r.prestador.inscricaoMunicipal != '') {
                        prestadorIncricaoMunicipal = r.prestador.inscricaoMunicipal;
                    }
                }
                xmlToBeSigned += `<${particularitiesObject['tags']['rpsAlterada'] ? particularitiesObject['tags']['rpsAlterada'] : particularitiesObject['tags']['rps']}>`;
                if (object.emissor.cpfCnpj && object.emissor.cpfCnpj != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['infRpsAlterada'] ? particularitiesObject['tags']['infRpsAlterada'] : particularitiesObject['tags']['infRps']}>`;
                }
                xmlToBeSigned += `<${particularitiesObject['tags']['identificacaoRps']}>`;
                xmlToBeSigned += `<${particularitiesObject['tags']['numero']}>` + numeroRps + `</${particularitiesObject['tags']['numero']}>`;
                xmlToBeSigned += `<${particularitiesObject['tags']['serie']}>` + serieRps + `</${particularitiesObject['tags']['serie']}>`;
                if (object.emissor.cpfCnpj && object.emissor.cpfCnpj != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['tipo']}>` + r.tipo + `</${particularitiesObject['tags']['tipo']}>`;
                }
                xmlToBeSigned += `</${particularitiesObject['tags']['identificacaoRps']}>`;
                if (r.dataEmissao && r.dataEmissao != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['dataEmissao']}>` + r.dataEmissao.replace(/\s/g, 'T') + `</${particularitiesObject['tags']['dataEmissao']}>`;
                }
                if (r.naturezaOperacao && r.naturezaOperacao != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['naturezaOperacao']}>` + r.naturezaOperacao + `</${particularitiesObject['tags']['naturezaOperacao']}>`;
                }
                if (r.regimeEspecialTributacao && r.regimeEspecialTributacao != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['regimeEspecialTributacao']}>` + r.regimeEspecialTributacao + `</${particularitiesObject['tags']['regimeEspecialTributacao']}>`;
                }
                if (r.optanteSimplesNacional && r.optanteSimplesNacional != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['optanteSimplesNacional']}>` + r.optanteSimplesNacional + `</${particularitiesObject['tags']['optanteSimplesNacional']}>`;
                }
                if (r.incentivadorCultural && r.incentivadorCultural != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['incentivadorCultural']}>` + r.incentivadorCultural + `</${particularitiesObject['tags']['incentivadorCultural']}>`;
                }
                if (r.status && r.status != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['status']}>` + r.status + `</${particularitiesObject['tags']['status']}>`;
                }

                xmlToBeSigned += `<${particularitiesObject['tags']['servico']}>`;
                xmlToBeSigned += `<${particularitiesObject['tags']['valores']}>`;
                if (r.servico.valorServicos && r.servico.valorServicos != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorServicos']}>` + r.servico.valorServicos + `</${particularitiesObject['tags']['valorServicos']}>`;
                }
                if (r.servico.valorDeducoes && r.servico.valorDeducoes != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorDeducoes']}>` + r.servico.valorDeducoes + `</${particularitiesObject['tags']['valorDeducoes']}>`;
                }
                if (r.servico.valorPis && r.servico.valorPis != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorPis']}>` + r.servico.valorPis + `</${particularitiesObject['tags']['valorPis']}>`;
                }
                if (r.servico.valorCofins && r.servico.valorCofins != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorCofins']}>` + r.servico.valorCofins + `</${particularitiesObject['tags']['valorCofins']}>`;
                }
                if (r.servico.valorInss && r.servico.valorInss != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorInss']}>` + r.servico.valorInss + `</${particularitiesObject['tags']['valorInss']}>`;
                }
                if (r.servico.valorIr && r.servico.valorIr != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorIr']}>` + r.servico.valorIr + `</${particularitiesObject['tags']['valorIr']}>`;
                }
                if (r.servico.valorCsll && r.servico.valorCsll != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorCsll']}>` + r.servico.valorCsll + `</${particularitiesObject['tags']['valorCsll']}>`;
                }
                if (r.servico.issRetido && r.servico.issRetido != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['issRetido']}>` + r.servico.issRetido + `</${particularitiesObject['tags']['issRetido']}>`;
                }
                if (r.servico.valorIss && r.servico.valorIss != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorIss']}>` + r.servico.valorIss + `</${particularitiesObject['tags']['valorIss']}>`;
                }
                if (r.servico.baseCalculo && r.servico.baseCalculo != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['baseCalculo']}>` + r.servico.baseCalculo + `</${particularitiesObject['tags']['baseCalculo']}>`;
                }
                if (r.servico.aliquota && r.servico.aliquota != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['aliquota']}>` + r.servico.aliquota + `</${particularitiesObject['tags']['aliquota']}>`;
                }
                if (r.servico.valorLiquidoNfse && r.servico.valorLiquidoNfse != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorLiquidoNfse']}>` + r.servico.valorLiquidoNfse + `</${particularitiesObject['tags']['valorLiquidoNfse']}>`;
                }
                xmlToBeSigned += `</${particularitiesObject['tags']['valores']}>`;
                if (r.servico.itemListaServico && r.servico.itemListaServico != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['itemListaServico']}>` + r.servico.itemListaServico + `</${particularitiesObject['tags']['itemListaServico']}>`;
                }
                if (r.servico.codigoTributacaoMunicipio && r.servico.codigoTributacaoMunicipio != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['codigoTributacaoMunicipio']}>` + r.servico.codigoTributacaoMunicipio + `</${particularitiesObject['tags']['codigoTributacaoMunicipio']}>`;
                }
                if (r.servico.discriminacao && r.servico.discriminacao != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['discriminacao']}>` + r.servico.discriminacao + `</${particularitiesObject['tags']['discriminacao']}>`;
                }
                if (r.servico.codigoMunicipio && r.servico.codigoMunicipio != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['codigoMunicipio']}>` + r.servico.codigoMunicipio + `</${particularitiesObject['tags']['codigoMunicipio']}>`;
                }
                xmlToBeSigned += `</${particularitiesObject['tags']['servico']}>`;

                if (r.prestador) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['prestador']}>`;
                    if (prestadorCnpj) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['cnpj']}>` + prestadorCnpj.replace(/[^\d]+/g, '') + `</${particularitiesObject['tags']['cnpj']}>`;
                    }
                    if (prestadorIncricaoMunicipal && prestadorIncricaoMunicipal != '') {
                        xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoMunicipal']}>` + prestadorIncricaoMunicipal + `</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                    }
                    xmlToBeSigned += `</${particularitiesObject['tags']['prestador']}>`;
                }
                if (r.tomador) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['tomador']}>`;
                    xmlToBeSigned += `<${particularitiesObject['tags']['identificacaoTomador']}>`;
                    if (r.tomador.cpfCnpj && r.tomador.cpfCnpj != '') {
                        xmlToBeSigned += `<${particularitiesObject['tags']['cpfCnpj']}>`;
                        if (r.tomador.cpfCnpj.replace(/[^\d]+/g, '').length === 11) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['cpf']}>` + r.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + `</${particularitiesObject['tags']['cpf']}>`;
                        }

                        if (r.tomador.cpfCnpj.replace(/[^\d]+/g, '').length === 14) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['cnpj']}>` + r.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + `</${particularitiesObject['tags']['cnpj']}>`;
                        }
                        xmlToBeSigned += `</${particularitiesObject['tags']['cpfCnpj']}>`;
                    }
                    if (r.tomador.inscricaoMunicipal && r.tomador.inscricaoMunicipal != '') {
                        xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoMunicipal']}>` + r.tomador.inscricaoMunicipal + `</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                    }
                    xmlToBeSigned += `</${particularitiesObject['tags']['identificacaoTomador']}>`;
                    if (r.tomador.razaoSocial && r.tomador.razaoSocial != '') {
                        xmlToBeSigned += `<${particularitiesObject['tags']['razaoSocial']}>` + r.tomador.razaoSocial + `</${particularitiesObject['tags']['razaoSocial']}>`;
                    }
                    if (r.tomador.endereco) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['endereco']}>`;
                        if (r.tomador.endereco.endereco && r.tomador.endereco.endereco != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['endereco']}>` + r.tomador.endereco.endereco + `</${particularitiesObject['tags']['endereco']}>`;
                        }
                        if (r.tomador.endereco.numero && r.tomador.endereco.numero != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['numero']}>` + r.tomador.endereco.numero + `</${particularitiesObject['tags']['numero']}>`;
                        }
                        if (r.tomador.endereco.bairro && r.tomador.endereco.bairro != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['bairro']}>` + r.tomador.endereco.bairro + `</${particularitiesObject['tags']['bairro']}>`;
                        }
                        if (r.tomador.endereco.codigoMunicipio && r.tomador.endereco.codigoMunicipio != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['codigoMunicipio']}>` + r.tomador.endereco.codigoMunicipio + `</${particularitiesObject['tags']['codigoMunicipio']}>`;
                        }
                        if (r.tomador.endereco.uf && r.tomador.endereco.uf != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['uf']}>` + r.tomador.endereco.uf + `</${particularitiesObject['tags']['uf']}>`;
                        }
                        if (r.tomador.endereco.cep && r.tomador.endereco.cep != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['cep']}>` + r.tomador.endereco.cep + `</${particularitiesObject['tags']['cep']}>`;
                        }
                        xmlToBeSigned += `</${particularitiesObject['tags']['endereco']}>`;
                    }
                    if (r.tomador.contato) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['contato']}>`;
                        if (r.tomador.contato.telefone && r.tomador.contato.telefone != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['telefone']}>` + r.tomador.contato.telefone + `</${particularitiesObject['tags']['telefone']}>`;
                        }
                        if (r.tomador.contato.email && r.tomador.contato.email != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['email']}>` + r.tomador.contato.email + `</${particularitiesObject['tags']['email']}>`;
                        }
                        xmlToBeSigned += `</${particularitiesObject['tags']['contato']}>`;
                    }
                    xmlToBeSigned += `</${particularitiesObject['tags']['tomador']}>`;
                }
                xmlToBeSigned += `</${particularitiesObject['tags']['infRps']}>`;
                xmlToBeSigned += `</${particularitiesObject['tags']['rps']}>`;
                xmlToBeSigned = xmlToBeSigned.replace(regexUnique, uniqueValue + index);

                xmlToBeSignedArray.push(xmlToBeSigned);
                xmlToBeSigned = '';
            });

            if (particularitiesObject['isSigned'] && particularitiesObject['isSigned']['infRps']) {
                xmlToBeSignedArray.map((rps, index) => {
                    createSignature(rps, cert, 'InfRps')
                        .then(createdSignatureXml => {
                            xmlSignedArray.push(createdSignatureXml);

                            if ((xmlToBeSignedArray.length - 1) === index) {
                                resolve(xmlSignedArray);
                            }
                        }).catch(error => {
                            const result = {
                                message: 'Erro no map de createSignature',
                                error: error
                            }

                            reject(result);
                        })
                })
            } else {
                resolve(xmlToBeSignedArray);
            }
        } catch (error) {
            reject(error);
        }
    })
}

function createSignature(xmlToBeSigned, cert, xmlElement, signatureId, isEmptyUri, isDifferentSignature = false) {
    return new Promise((resolve, reject) => {
        try {
            if (!signatureId) {
                signatureId = null;
            }

            if (!isEmptyUri) {
                isEmptyUri = null;
            }
            xmlSignatureController.addSignatureToXml(xmlToBeSigned, cert, xmlElement, signatureId, isEmptyUri, isDifferentSignature)
                .then(xmlSigned => {
                    resolve(xmlSigned);
                })
                .catch(xmlSignedError => {
                    const result = {
                        message: 'Erro na assinatura de nota',
                        error: xmlSignedError
                    }
                    console.error(xmlToBeSigned, 684);
                    reject(result);
                });
        } catch (error) {
            console.error(error);
            reject(error);
        }
    })
}

const settingsControllerAsync = (object, city) => {
    return settingsController.setParticularities(object, city);
}

module.exports = {
    setRequirements
}