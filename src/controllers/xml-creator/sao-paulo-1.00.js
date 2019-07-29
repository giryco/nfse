// Vendors
const fs = require('fs');
const pem = require('pem');
const validator = require('xsd-schema-validator');

// Libs
const XmlSignatureController = require('../../../lib/xml-signature');
const xmlSignatureController = new XmlSignatureController();

// Controllers
const settingsController = require('../settings');

//Global contants
const d = new Date();
const timestamp = Date.now();
const numeroLote = timestamp.toString().substring(4, 13) + (d.getYear() - 100);

const setRequirements = (object, city) => {
    return new Promise((resolve, reject) => {
        try {
            const particularitiesObject = settingsControllerAsync(object, city);

            createXml(object, particularitiesObject)
                .then(res => {
                    resolve(res);
                })
                .catch(rej => {
                    reject(rej);
                })
        } catch (error) {
            reject(error);
        }
    })
}

const createXml = (object, particularitiesObject) => {
    return new Promise((resolve, reject) => {
        const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

        switch (object.config.acao) {
            case 'enviarLoteRps':
                try {
                    pem.readPkcs12(pfx, {
                        p12Password: object.config.senhaDoCertificado
                    }, (err, cert) => {
                        if (err) {
                            resolve({
                                error: err
                            });
                        }
                        let uniqueValue = numeroLote;
                        let regexUnique = new RegExp('_uniqueValue', 'g');

                        let xml = `<${particularitiesObject['tags']['pedidoEnvioLoteRpsAlterada'] ? particularitiesObject['tags']['pedidoEnvioLoteRpsAlterada'] : particularitiesObject['tags']['pedidoEnvioLoteRps']}>`;
                        xml += `<${particularitiesObject['tags']['cabecalhoAlterada'] ? particularitiesObject['tags']['cabecalhoAlterada'] : particularitiesObject['tags']['cabecalho']}>`;
                        if (object.emissor.cpfCnpj) {
                            xml += `<${particularitiesObject['tags']['cpfCnpjRemetenteAlterada'] ? particularitiesObject['tags']['cpfCnpjRemetenteAlterada'] : particularitiesObject['tags']['cpfCnpjRemetente']}>`;
                            if (object.emissor.cpfCnpj.replace(/[^\d]+/g, '').length === 11) {
                                xml += `<CPF>${object.emissor.cpfCnpj.replace(/\.|\/|\-|\s/g, '')}</CPF>`;
                            }
        
                            if (object.emissor.cpfCnpj.replace(/[^\d]+/g, '').length === 14) {
                                xml += `<CNPJ>${object.emissor.cpfCnpj.replace(/\.|\/|\-|\s/g, '')}</CNPJ>`;
                            }
                            xml += `</${particularitiesObject['tags']['cpfCnpjRemetente']}>`;
                        }
                        if (object.transacao) {
                            xml += `<${particularitiesObject['tags']['transacaoAlterada'] ? particularitiesObject['tags']['transacaoAlterada'] : particularitiesObject['tags']['transacao']}>${object.transacao}</${particularitiesObject['tags']['transacao']}>`;
                        }
                        if (object.dtInicio) {
                            xml += `<${particularitiesObject['tags']['dtInicioAlterada'] ? particularitiesObject['tags']['dtInicioAlterada'] : particularitiesObject['tags']['dtInicio']}>${object.dtInicio}</${particularitiesObject['tags']['dtInicio']}>`;
                        }
                        if (object.dtFim) {
                            xml += `<${particularitiesObject['tags']['dtFimAlterada'] ? particularitiesObject['tags']['dtFimAlterada'] : particularitiesObject['tags']['dtFim']}>${object.dtFim}</${particularitiesObject['tags']['dtFim']}>`;
                        }
                        if (object.rps) {
                            xml += `<${particularitiesObject['tags']['qtdRpsAlterada'] ? particularitiesObject['tags']['qtdRpsAlterada'] : particularitiesObject['tags']['qtdRps']}>${object.rps.length}</${particularitiesObject['tags']['qtdRps']}>`;
                        }
                        if (object.valorTotalServicos) {
                            xml += `<${particularitiesObject['tags']['valorTotalServicosAlterada'] ? particularitiesObject['tags']['valorTotalServicosAlterada'] : particularitiesObject['tags']['valorTotalServicos']}>${object.valorTotalServicos}</${particularitiesObject['tags']['valorTotalServicos']}>`;
                        }
                        if (object.valorTotalDeducoes) {
                            xml += `<${particularitiesObject['tags']['valorTotalDeducoesAlterada'] ? particularitiesObject['tags']['valorTotalDeducoesAlterada'] : particularitiesObject['tags']['valorTotalDeducoes']}>${object.valorTotalDeducoes}</${particularitiesObject['tags']['valorTotalDeducoes']}>`;
                        }
                        xml += `</${particularitiesObject['tags']['cabecalho']}>`;

                        xml = xml.replace(regexUnique, uniqueValue);

                        addSignedXml(object, cert, particularitiesObject)
                            .then(signedXmlRes => {
                                signedXmlRes.forEach(element => {
                                    xml += element;
                                });

                                xml += `</${particularitiesObject['tags']['pedidoEnvioLoteRps']}>`;
                                
                                createSignature(xml, cert, 'PedidoEnvioLoteRPS').then(xmlSignature => {
                                    if (particularitiesObject['xsds']['enviarLoteRps']) {
                                        validator.validateXML(xmlSignature, __dirname + particularitiesObject['xsds']['enviarLoteRps'], function (err, validatorResult) {
                                            if (err) {
                                                console.error(err);
                                                resolve(err);
                                            }
    
                                            let xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);
    
                                            if (!validatorResult.valid) {
                                                console.error(validatorResult);
                                                resolve(validatorResult);
                                            }
    
                                            const result = {
                                                url: particularitiesObject['webserviceUrl'],
                                                soapEnvelop: xml
                                            }
                                            if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['enviarLoteRps']) {
                                                result['soapAction'] = particularitiesObject['soapActions']['enviarLoteRps'];
                                            }
                                            resolve(result);
                                        });
                                    }
                                }).catch(err => {
                                    console.error(err);
                                });
                            })
                    });
                } catch (error) {
                    reject(error);
                }
                break;

            case 'cancelarNfse':
                try {
                    const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

                    pem.readPkcs12(pfx, {
                        p12Password: object.config.senhaDoCertificado
                    }, (err, cert) => {
                        if (err) {
                            return res.send({
                                error: err
                            });
                        }

                        let xmlNotSigned = `<${particularitiesObject['tags']['cancelarNfseEnvioAlterada'] ? particularitiesObject['tags']['cancelarNfseEnvioAlterada'] : particularitiesObject['tags']['cancelarNfseEnvio']}>`;
                        xmlNotSigned += `<${particularitiesObject['tags']['prestadorAlterada'] ? particularitiesObject['tags']['prestadorAlterada'] : particularitiesObject['tags']['prestador']}>`;
                        xmlNotSigned += `<${particularitiesObject['tags']['cnpjAlterada'] ? particularitiesObject['tags']['cnpjAlterada'] : particularitiesObject['tags']['cnpj']}>${object.prestador.cpfCnpj}</${particularitiesObject['tags']['cnpj']}>`;
                        if (object.prestador.inscricaoMunicipal || object.prestador.inscricaoMunicipal != '') {
                            xmlNotSigned += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>${object.prestador.inscricaoMunicipal}</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                        }
                        xmlNotSigned += `</${particularitiesObject['tags']['prestador']}>`;
                        xmlNotSigned += `<${particularitiesObject['tags']['numeroNfseAlterada'] ? particularitiesObject['tags']['numeroNfseAlterada'] : particularitiesObject['tags']['numeroNfse']}>${object.numeroNfse}</${particularitiesObject['tags']['numeroNfse']}>`;
                        xmlNotSigned += `</${particularitiesObject['tags']['cancelarNfseEnvio']}>`;
                        
                        createSignature(xmlNotSigned, cert, 'CancelarNfseEnvio', true).then(xmlSignature => {
                            if (particularitiesObject['xsds']['cancelarNfse']) {
                                validator.validateXML(xmlSignature, __dirname + particularitiesObject['xsds']['cancelarNfse'], function (err, validatorResult) {
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
                            try {
                                let xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);

                                const result = {
                                    url: particularitiesObject['webserviceUrl'],
                                    soapEnvelop: xml
                                }
                                if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['cancelarNfse']) {
                                    result['soapAction'] = particularitiesObject['soapActions']['cancelarNfse'];
                                }

                                resolve(result);
                            } catch (error) {
                                console.error(error);
                            }
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
                    const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

                    pem.readPkcs12(pfx, {
                        p12Password: object.config.senhaDoCertificado
                    }, (err, cert) => {
                        if (err) {
                            resolve({
                                error: err
                            });
                        }

                        let xmlNotSigned = `<${particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] ? particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] : particularitiesObject['tags']['consultarLoteRpsEnvio']}>`;
                        xmlNotSigned += `<${particularitiesObject['tags']['prestadorAlterada'] ? particularitiesObject['tags']['prestadorAlterada'] : particularitiesObject['tags']['prestador']}>`;
                        xmlNotSigned += `<${particularitiesObject['tags']['cnpjAlterada'] ? particularitiesObject['tags']['cnpjAlterada'] : particularitiesObject['tags']['cnpj']}>${object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '')}</${particularitiesObject['tags']['cnpj']}>`;
                        if (object.prestador.inscricaoMunicipal || object.prestador.inscricaoMunicipal != '') {
                            xmlNotSigned += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>${object.prestador.inscricaoMunicipal}</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                        }
                        xmlNotSigned += `</${particularitiesObject['tags']['prestador']}>`;
                        xmlNotSigned += `<${particularitiesObject['tags']['protocoloAlterada'] ? particularitiesObject['tags']['protocoloAlterada'] : particularitiesObject['tags']['protocolo']}>${object.protocolo}</${particularitiesObject['tags']['protocolo']}>`;
                        xmlNotSigned += `</${particularitiesObject['tags']['consultarLoteRpsEnvio']}>`;

                        createSignature(xmlNotSigned, cert, 'ConsultarLoteRpsEnvio')
                                .then(xmlSignature => {
                                    if (particularitiesObject['xsds']['consultarLoteRps']) {
                                        validator.validateXML(xmlSignature, __dirname + particularitiesObject['xsds']['cancelarNfse'], function (err, validatorResult) {
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
                    const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

                    pem.readPkcs12(pfx, {
                        p12Password: object.config.senhaDoCertificado
                    }, (err, cert) => {
                        if (err) {
                            resolve({
                                error: err
                            });
                        }

                        let xml = '<ConsultarNfseRpsEnvio xmlns:ns3="http://www.ginfes.com.br/servico_consultar_nfse_rps_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd">';
                        xml += '<IdentificacaoRps>';
                        xml += '<Numero>' + object.identificacaoRps.numero + '</Numero>';
                        xml += '<Serie>' + object.identificacaoRps.serie + '</Serie>';
                        xml += '<Tipo>' + object.identificacaoRps.tipo + '</Tipo>';
                        xml += '</IdentificacaoRps>';
                        xml += '<Prestador>';
                        xml += '<Cnpj>' + object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                        if (object.prestador.inscricaoMunicipal || object.prestador.inscricaoMunicipal != '') {
                            xml += '<InscricaoMunicipal>' + object.prestador.inscricaoMunicipal + '</InscricaoMunicipal>';
                        }
                        xml += '</Prestador>';
                        xml += '</ConsultarNfseRpsEnvio>';

                        createSignature(xml, cert, 'ConsultarNfseRpsEnvio', true).then(xmlSignature => {
                            validator.validateXML(xmlSignature, __dirname + '/../../../resources/xsd/ginfes/servico_consultar_nfse_rps_envio_v03.xsd', function (err, validatorResult) {
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
                                xml += '<ns1:ConsultarNfsePorRpsV3 xmlns:ns1="' + particularitiesObject['urlXmlns'] + '">';
                                xml += '<arg0>';
                                xml += '<ns2:cabecalho versao="3" xmlns:ns2="http://www.ginfes.com.br/cabecalho_v03.xsd">';
                                xml += '<versaoDados>3</versaoDados>';
                                xml += '</ns2:cabecalho>';
                                xml += '</arg0>';
                                xml += '<arg1>';
                                xml += xmlSignature;
                                xml += '</arg1>';
                                xml += '</ns1:ConsultarNfsePorRpsV3>';
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

            case 'consultarSituacaoLoteRps':
                try {
                    const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

                    pem.readPkcs12(pfx, {
                        p12Password: object.config.senhaDoCertificado
                    }, (err, cert) => {
                        if (err) {
                            return res.send({
                                error: err
                            });
                        }

                        let xml = '<ConsultarSituacaoLoteRpsEnvio xmlns:ns3="http://www.ginfes.com.br/servico_consultar_situacao_lote_rps_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd">';
                        xml += '<Prestador>';
                        xml += '<Cnpj>' + object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                        if (object.prestador.inscricaoMunicipal || object.prestador.inscricaoMunicipal != '') {
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
                    const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

                    pem.readPkcs12(pfx, {
                        p12Password: object.config.senhaDoCertificado
                    }, (err, cert) => {
                        if (err) {
                            return res.send({
                                error: err
                            });
                        }

                        let xml = '<ConsultarNfseEnvio xmlns:ns3="http://www.ginfes.com.br/servico_consultar_nfse_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd">';
                        xml += '<Prestador>';
                        xml += '<Cnpj>' + object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                        if (object.prestador.inscricaoMunicipal || object.prestador.inscricaoMunicipal != '') {
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
                        //     xml += '<Cpf>' + object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '<Cpf>';
                        // }

                        // if (object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 14) {
                        //     xml += '<Cnpj>' + object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '<Cnpj>';
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
    })
}

module.exports = {
    createXml
}

function addSignedXml(object, cert, particularitiesObject) {
    return new Promise((resolve, reject) => {
        let uniqueValue = numeroLote;
        let regexUnique = new RegExp('_uniqueValue', 'g');
        let xmlToBeSigned = '';
        let xmlToBeSignedArray = [];
        let xmlSignedArray = [];
        object.rps.forEach((r, index) => {
            let numeroRps = r.numero ? r.numero : timestamp + index;
            let serieRps = r.serie ? r.serie : 'RPS';            
            let prestadorCpfCnpj;
            let prestadorInscricaoMunicipal;
            let prestadorCodigoMunicipio;
            let tomadorCpfCnpj;
            let tomadorInscricaoMunicipal;
            if (r.prestador) {
                if (r.prestador.cpfCnpj) {
                    prestadorCpfCnpj = r.prestador.cpfCnpj.replace(/[^\d]+/g, '');
                }
                if (r.prestador.inscricaoMunicipal) {
                    prestadorInscricaoMunicipal = r.prestador.inscricaoMunicipal;
                }
                if (r.prestador.codigoMunicipio) {
                    prestadorCodigoMunicipio = r.prestador.codigoMunicipio;
                }
            }

            if (r.tomador) {
                if (r.tomador.cpfCnpj) {
                    tomadorCpfCnpj = r.tomador.cpfCnpj.replace(/[^\d]+/g, '');
                }
                if (r.tomador.inscricaoMunicipal) {
                    tomadorInscricaoMunicipal = r.tomador.inscricaoMunicipal;
                }
            }

            if (r.intermediario) {
                if (r.intermediario.cpfCnpj) {
                    intermediarioCpfCnpj = r.intermediario.cpfCnpj.replace(/[^\d]+/g, '');
                }
                if (r.intermediario.inscricaoMunicipal) {
                    intermediarioInscricaoMunicipal = r.intermediario.inscricaoMunicipal;
                }
            }

            xmlToBeSigned += `<${particularitiesObject['tags']['rpsAlterada'] ? particularitiesObject['tags']['rpsAlterada'] : particularitiesObject['tags']['rps']}>`;
            xmlToBeSigned += `<${particularitiesObject['tags']['assinaturaAlterada'] ? particularitiesObject['tags']['assinaturaAlterada'] : particularitiesObject['tags']['assinatura']}></${particularitiesObject['tags']['assinatura']}>`;
            xmlToBeSigned += `<${particularitiesObject['tags']['chaveRpsAlterada'] ? particularitiesObject['tags']['chaveRpsAlterada'] : particularitiesObject['tags']['chaveRps']}>`;
            if (prestadorInscricaoMunicipal) {
                xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoPrestadorAlterada'] ? particularitiesObject['tags']['inscricaoPrestadorAlterada'] : particularitiesObject['tags']['inscricaoPrestador']}>${prestadorInscricaoMunicipal}</${particularitiesObject['tags']['inscricaoPrestador']}>`;
            }
            xmlToBeSigned += `<${particularitiesObject['tags']['serieRpsAlterada'] ? particularitiesObject['tags']['serieRpsAlterada'] : particularitiesObject['tags']['serieRps']}>` + serieRps + `</${particularitiesObject['tags']['serieRps']}>`;
            xmlToBeSigned += `<${particularitiesObject['tags']['numeroRpsAlterada'] ? particularitiesObject['tags']['numeroRpsAlterada'] : particularitiesObject['tags']['numeroRps']}>` + numeroRps + `</${particularitiesObject['tags']['numeroRps']}>`;
            xmlToBeSigned += `</${particularitiesObject['tags']['chaveRps']}>`;
            if (r.tipo) {
                xmlToBeSigned += `<${particularitiesObject['tags']['tipoAlterada'] ? particularitiesObject['tags']['tipoAlterada'] : particularitiesObject['tags']['tipo']}>` + r.tipo + `</${particularitiesObject['tags']['tipo']}>`;
            }
            if (r.dataEmissao) {
                xmlToBeSigned += `<${particularitiesObject['tags']['dataEmissaoAlterada'] ? particularitiesObject['tags']['dataEmissaoAlterada'] : particularitiesObject['tags']['dataEmissao']}>` + r.dataEmissao.replace(/\s/g, 'T') + `</${particularitiesObject['tags']['dataEmissao']}>`;
            }
            if (r.status) {
                xmlToBeSigned += `<${particularitiesObject['tags']['statusRpsAlterada'] ? particularitiesObject['tags']['statusRpsAlterada'] : particularitiesObject['tags']['statusRps']}>` + r.status + `</${particularitiesObject['tags']['statusRps']}>`;
            }
            if (r.servico) {
                if (r.servico.codigoTributacaoMunicipio || r.servico.codigoTributacaoMunicipio != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['tributacaoRpsAlterada'] ? particularitiesObject['tags']['tributacaoRpsAlterada'] : particularitiesObject['tags']['tributacaoRps']}>` + r.servico.codigoTributacaoMunicipio + `</${particularitiesObject['tags']['tributacaoRps']}>`;
                }
                if (r.servico.valorServicos) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorServicosAlterada'] ? particularitiesObject['tags']['valorServicosAlterada'] : particularitiesObject['tags']['valorServicos']}>` + r.servico.valorServicos + `</${particularitiesObject['tags']['valorServicos']}>`;
                }
                if (r.servico.valorDeducoes) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorDeducoesAlterada'] ? particularitiesObject['tags']['valorDeducoesAlterada'] : particularitiesObject['tags']['valorDeducoes']}>` + r.servico.valorDeducoes + `</${particularitiesObject['tags']['valorDeducoes']}>`;
                }
                if (r.servico.valorPis) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorPisAlterada'] ? particularitiesObject['tags']['valorPisAlterada'] : particularitiesObject['tags']['valorPis']}>` + r.servico.valorPis + `</${particularitiesObject['tags']['valorPis']}>`;
                }
                if (r.servico.valorCofins) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorCofinsAlterada'] ? particularitiesObject['tags']['valorCofinsAlterada'] : particularitiesObject['tags']['valorCofins']}>` + r.servico.valorCofins + `</${particularitiesObject['tags']['valorCofins']}>`;
                }
                if (r.servico.valorInss) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorInssAlterada'] ? particularitiesObject['tags']['valorInssAlterada'] : particularitiesObject['tags']['valorInss']}>` + r.servico.valorInss + `</${particularitiesObject['tags']['valorInss']}>`;
                }
                if (r.servico.valorIr) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorIrAlterada'] ? particularitiesObject['tags']['valorIrAlterada'] : particularitiesObject['tags']['valorIr']}>` + r.servico.valorIr + `</${particularitiesObject['tags']['valorIr']}>`;
                }
                if (r.servico.valorCsll) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorCsllAlterada'] ? particularitiesObject['tags']['valorCsllAlterada'] : particularitiesObject['tags']['valorCsll']}>` + r.servico.valorCsll + `</${particularitiesObject['tags']['valorCsll']}>`;
                }
                if (r.servico.codigoCnae) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['codigoServico'] ? particularitiesObject['tags']['codigoServico'] : particularitiesObject['tags']['codigoServico']}>` + r.servico.codigoCnae.replace(/[^\d]+/g, '') + `</${particularitiesObject['tags']['codigoServico']}>`;
                }
                if (r.servico.aliquota) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['aliquotaServicosAlterada'] ? particularitiesObject['tags']['aliquotaServicosAlterada'] : particularitiesObject['tags']['aliquotaServicos']}>` + r.servico.aliquota + `</${particularitiesObject['tags']['aliquotaServicos']}>`;
                }
                if (r.servico.issRetido) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['issRetidoAlterada'] ? particularitiesObject['tags']['issRetidoAlterada'] : particularitiesObject['tags']['issRetido']}>` + r.servico.issRetido + `</${particularitiesObject['tags']['issRetido']}>`;
                }
                
                if (r.tomador) {
                    if (tomadorCpfCnpj) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['cpfCnpjTomadorAlterada'] ? particularitiesObject['tags']['cpfCnpjTomadorAlterada'] : particularitiesObject['tags']['cpfCnpjTomador']}>`;
                        if (tomadorCpfCnpj.replace(/[^\d]+/g, '').length === 11) {
                            xmlToBeSigned += `<CPF>${tomadorCpfCnpj.replace(/\.|\/|\-|\s/g, '')}</CPF>`;
                        }
    
                        if (tomadorCpfCnpj.replace(/[^\d]+/g, '').length === 14) {
                            xmlToBeSigned += `<CNPJ>${tomadorCpfCnpj.replace(/\.|\/|\-|\s/g, '')}</CNPJ>`;
                        }
                        xmlToBeSigned += `</${particularitiesObject['tags']['cpfCnpjTomador']}>`;
                    }
    
                    if (r.tomador.inscricaoMunicipal) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoMunicipalTomadorAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalTomadorAlterada'] : particularitiesObject['tags']['inscricaoMunicipalTomador']}>` + r.tomador.inscricaoMunicipal + `</${particularitiesObject['tags']['inscricaoMunicipalTomador']}>`;
                    }
                    if (r.tomador.inscricaoEstadual) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoEstadualTomadorAlterada'] ? particularitiesObject['tags']['inscricaoEstadualTomadorAlterada'] : particularitiesObject['tags']['inscricaoEstadualTomador']}>` + r.tomador.inscricaoEstadual + `</${particularitiesObject['tags']['inscricaoEstadualTomador']}>`;
                    }
                    if (r.tomador.razaoSocial) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['razaoSocialTomadorAlterada'] ? particularitiesObject['tags']['razaoSocialTomadorAlterada'] : particularitiesObject['tags']['razaoSocialTomador']}>` + r.tomador.razaoSocial + `</${particularitiesObject['tags']['razaoSocialTomador']}>`;
                    }
    
                    if (r.tomador.endereco) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['enderecoTomadorAlterada'] ? particularitiesObject['tags']['enderecoTomadorAlterada'] : particularitiesObject['tags']['enderecoTomador']}>`;
                        if (r.tomador.endereco.tipoLogradouro) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['tipoLogradouroAlterada'] ? particularitiesObject['tags']['tipoLogradouroAlterada'] : particularitiesObject['tags']['tipoLogradouro']}>` + r.tomador.endereco.endereco + `</${particularitiesObject['tags']['tipoLogradouro']}>`;
                        }
                        if (r.tomador.endereco.endereco) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['logradouroAlterada'] ? particularitiesObject['tags']['logradouroAlterada'] : particularitiesObject['tags']['logradouro']}>` + r.tomador.endereco.endereco + `</${particularitiesObject['tags']['logradouro']}>`;
                        }
                        if (r.tomador.endereco.numero) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['numeroEnderecoAlterada'] ? particularitiesObject['tags']['numeroEnderecoAlterada'] : particularitiesObject['tags']['numeroEndereco']}>` + r.tomador.endereco.numero + `</${particularitiesObject['tags']['numeroEndereco']}>`;
                        }
                        if (r.tomador.endereco.complemento) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['complementoEnderecoAlterada'] ? particularitiesObject['tags']['complementoEnderecoAlterada'] : particularitiesObject['tags']['complementoEndereco']}>` + r.tomador.endereco.complemento + `</${particularitiesObject['tags']['complementoEndereco']}>`;
                        }
                        if (r.tomador.endereco.bairro) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['bairroAlterada'] ? particularitiesObject['tags']['bairroAlterada'] : particularitiesObject['tags']['bairro']}>` + r.tomador.endereco.bairro + `</${particularitiesObject['tags']['bairro']}>`;
                        }
                        if (r.tomador.endereco.codigoMunicipio) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['cidadeAlterada'] ? particularitiesObject['tags']['cidadeAlterada'] : particularitiesObject['tags']['cidade']}>` + r.tomador.endereco.codigoMunicipio + `</${particularitiesObject['tags']['cidade']}>`;
                        }
                        if (r.tomador.endereco.uf) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['ufAlterada'] ? particularitiesObject['tags']['ufAlterada'] : particularitiesObject['tags']['uf']}>` + r.tomador.endereco.uf + `</${particularitiesObject['tags']['uf']}>`;
                        }
                        if (r.tomador.endereco.cep) {
                            xmlToBeSigned += `<${particularitiesObject['tags']['cepAlterada'] ? particularitiesObject['tags']['cepAlterada'] : particularitiesObject['tags']['cep']}>` + r.tomador.endereco.cep + `</${particularitiesObject['tags']['cep']}>`;
                        }
                        xmlToBeSigned += `</${particularitiesObject['tags']['endereco']}>`;
                    }
    
                    if (r.tomador.contato) {
                        if (r.tomador.contato.email && r.tomador.contato.email != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['emailTomadorAlterada'] ? particularitiesObject['tags']['emailTomadorAlterada'] : particularitiesObject['tags']['emailTomador']}>` + r.tomador.contato.email + `</${particularitiesObject['tags']['emailTomador']}>`;
                        }
                    }
                }
    
                if (r.intermediario) {
                    if (intermediarioCpfCnpj) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['cpfCnpjIntermediario'] ? particularitiesObject['tags']['cpfCnpjIntermediario'] : particularitiesObject['tags']['cpfCnpjIntermediario']}>`;
                        if (intermediarioCpfCnpj.replace(/[^\d]+/g, '').length === 11) {
                            xmlToBeSigned += `<CPF>${intermediarioCpfCnpj.replace(/\.|\/|\-|\s/g, '')}</CPF>`;
                        }
    
                        if (intermediarioCpfCnpj.replace(/[^\d]+/g, '').length === 14) {
                            xmlToBeSigned += `<CNPJ>${intermediarioCpfCnpj.replace(/\.|\/|\-|\s/g, '')}</CNPJ>`;
                        }
                        xmlToBeSigned += `</${particularitiesObject['tags']['cpfCnpjIntermediario']}>`;
                    }
    
                    if (r.intermediario.inscricaoMunicipal) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoMunicipalTomadorAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalTomadorAlterada'] : particularitiesObject['tags']['inscricaoMunicipalTomador']}>` + r.intermediario.inscricaoMunicipal + `</${particularitiesObject['tags']['inscricaoMunicipalTomador']}>`;
                    }
                    if (r.intermediario.issRetido) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['issRetidoIntermediarioAlterada'] ? particularitiesObject['tags']['issRetidoIntermediarioAlterada'] : particularitiesObject['tags']['issRetidoIntermediario']}>` + r.intermediario.issRetido + `</${particularitiesObject['tags']['issRetidoIntermediario']}>`;
                    }
    
                    if (r.intermediario.contato) {
                        if (r.intermediario.contato.email && r.intermediario.contato.email != '') {
                            xmlToBeSigned += `<${particularitiesObject['tags']['emailTomadorAlterada'] ? particularitiesObject['tags']['emailTomadorAlterada'] : particularitiesObject['tags']['emailTomador']}>` + r.tomador.contato.email + `</${particularitiesObject['tags']['emailTomador']}>`;
                        }
                    }
                }

                if (r.servico.discriminacao) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['discriminacaoAlterada'] ? particularitiesObject['tags']['discriminacaoAlterada'] : particularitiesObject['tags']['discriminacao']}>` + r.servico.discriminacao + `</${particularitiesObject['tags']['discriminacao']}>`;
                }
                if (r.servico.valorCargaTributaria) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorCargaTributariaAlterada'] ? particularitiesObject['tags']['valorCargaTributariaAlterada'] : particularitiesObject['tags']['valorCargaTributaria']}>` + r.servico.valorCargaTributaria + `</${particularitiesObject['tags']['valorCargaTributaria']}>`;
                }
                if (r.servico.percentualCargaTributaria) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['percentualCargaTributariaAlterada'] ? particularitiesObject['tags']['percentualCargaTributariaAlterada'] : particularitiesObject['tags']['percentualCargaTributaria']}>` + r.servico.percentualCargaTributaria + `</${particularitiesObject['tags']['percentualCargaTributaria']}>`;
                }
                if (r.servico.fonteCargaTributaria) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['fonteCargaTributariaAlterada'] ? particularitiesObject['tags']['fonteCargaTributariaAlterada'] : particularitiesObject['tags']['fonteCargaTributaria']}>` + r.servico.fonteCargaTributaria + `</${particularitiesObject['tags']['fonteCargaTributaria']}>`;
                }
                if (r.construcaoCivil) {
                    if (r.construcaoCivil.codigoCei) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['codigoCeiAlterada'] ? particularitiesObject['tags']['codigoCeiAlterada'] : particularitiesObject['tags']['codigoCei']}>` + r.construcaoCivil.codigoCei + `</${particularitiesObject['tags']['codigoCei']}>`;
                    }
                    if (r.construcaoCivil.codigoObra) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['matriculaAlteradaObra'] ? particularitiesObject['tags']['matriculaAlteradaObra'] : particularitiesObject['tags']['matriculaObra']}>` + r.construcaoCivil.codigoObra + `</${particularitiesObject['tags']['matriculaObra']}>`;
                    }
                }
                if (prestadorCodigoMunicipio) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['municipioPrestacaoAlterada'] ? particularitiesObject['tags']['municipioPrestacaoAlterada'] : particularitiesObject['tags']['municipioPrestacao']}>${prestadorCodigoMunicipio}</${particularitiesObject['tags']['municipioPrestacao']}>`;
                }
                if (r.numeroEncapsulamento) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['numeroEncapsulamentoAlterada'] ? particularitiesObject['tags']['numeroEncapsulamentoAlterada'] : particularitiesObject['tags']['numeroEncapsulamento']}>` + r.numeroEncapsulamento + `</${particularitiesObject['tags']['numeroEncapsulamento']}>`;
                }
                if (r.servico.valorTotalRecebido) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['valorTotalRecebidoAlterada'] ? particularitiesObject['tags']['valorTotalRecebidoAlterada'] : particularitiesObject['tags']['valorTotalRecebido']}>${r.servico.valorTotalRecebido}</${particularitiesObject['tags']['valorTotalRecebido']}>`;
                }
            }
            xmlToBeSigned += `</${particularitiesObject['tags']['rps']}>`;
            
            // São Paulo: end
            
            xmlToBeSigned = xmlToBeSigned.replace(regexUnique, uniqueValue + index);

            xmlToBeSignedArray.push(xmlToBeSigned);

        });

        if (particularitiesObject['nfseKeyword'] === 'catalao') {
            xmlToBeSignedArray.map((rps, index) => {
                createSignature(rps, cert, 'InfDeclaracaoPrestacaoServico')
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
    })
}

function createSignature(xmlToBeSigned, cert, xmlElement, isEmptyUri = null) {
    return new Promise((resolve, reject) => {
        xmlSignatureController.addSignatureToXml(xmlToBeSigned, cert, xmlElement, null, isEmptyUri)
            .then(xmlSigned => {
                resolve(xmlSigned);
            })
            .catch(xmlSignedError => {
                const result = {
                    message: 'Erro na assinatura de nota',
                    error: xmlSignedError
                }

                reject(result);
            });
    })
}

const settingsControllerAsync = (object, city) => {
    return settingsController.setParticularities(object, city);
}

module.exports = {
    setRequirements
}