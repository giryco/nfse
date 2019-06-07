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

const setRequirements = (object, city, model) => {
    const particularitiesObject = settingsControllerAsync(object, city, model);
    console.log(createXmlAsync(object, particularitiesObject), 20);
}

const createXml = async (object, particularitiesObject) => {
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
        
                            addSignedXml(object, cert, particularitiesObject)
                                .then(signedXmlRes => {
                                    signedXmlRes.forEach(element => {
                                        xml += element;
                                    });
                                    xml += `</${particularitiesObject['tags']['listaRps']}>`;
                                    xml += `</${particularitiesObject['tags']['loteRps']}>`;
                                    xml += `</${particularitiesObject['tags']['enviarLoteRpsEnvio']}>`;
                                    
                                    createSignature(xml, cert, 'LoteRps').then(xmlSignature => {
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
                                            console.log(result);
                                            resolve(result);
                                        });
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
                                resolve(err);
                            }
        
                            let xml = '<CancelarNfseEnvio xmlns:ns3="http://www.ginfes.com.br/servico_cancelar_nfse_envio" xmlns:ns4="http://www.ginfes.com.br/tipos">';
                            xml += '<Prestador>';
                            xml += '<Cnpj>' + object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                            if (object.prestador.inscricaoMunicipal || object.prestador.inscricaoMunicipal != '') {
                                xml += '<InscricaoMunicipal>' + object.prestador.inscricaoMunicipal + '</InscricaoMunicipal>';
                            }
                            xml += '</Prestador>';
                            xml += '<NumeroNfse>' + object.numeroNfse + '</NumeroNfse>';
                            xml += '</CancelarNfseEnvio>';
        
                            createSignature(xml, cert, 'CancelarNfseEnvio', true).then(xmlSignature => {
                                validator.validateXML(xmlSignature, __dirname + '/../../../../resources/xsd/ginfes/schemas_v202/servico_cancelar_nfse_envio_v02.xsd', function (err, validatorResult) {
                                    if (err) {
                                        console.error(err);
                                        resolve(err);
                                    }
        
                                    if (!validatorResult.valid) {
                                        console.error(validatorResult);
                                        resolve(validatorResult);
                                    }
        
                                    let xml = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
                                    xml += '<soap:Header/>';
                                    xml += '<soap:Body>';
                                    xml += '<ns1:CancelarNfse xmlns:ns1="' + particularitiesObject['urlXmlns'] + '">';
                                    xml += '<arg0>';
                                    xml += xmlSignature;
                                    xml += '</arg0>';
                                    xml += '</ns1:CancelarNfse>';
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
        
                case 'consultarLoteRps':
                    try {
                        const pfx = fs.readFileSync(object.config.diretorioDoCertificado);
        
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
        
                            let xml = '<ConsultarLoteRpsEnvio>';
                            xml += '<Prestador>';
                            xml += '<Cnpj>' + object.prestador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                            if (object.prestador.inscricaoMunicipal || object.prestador.inscricaoMunicipal != '') {
                                xml += '<InscricaoMunicipal>' + object.prestador.inscricaoMunicipal + '</InscricaoMunicipal>';
                            }
                            xml += '</Prestador>';
                            xml += '<Protocolo>' + object.protocolo + '</Protocolo>';
                            xml += '</ConsultarLoteRpsEnvio>';
        
                            createSignature(xml, cert, 'ConsultarLoteRpsEnvio').then(xmlSignature => {
                                validator.validateXML(xmlSignature, __dirname + '/../../../../resources/xsd/ginfes/servico_consultar_lote_rps_envio_v03.xsd', function (err, validatorResult) {
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
                                    xml += '<ns1:ConsultarLoteRpsV3 xmlns:ns1="' + particularitiesObject['urlXmlns'] + '">';
                                    xml += '<arg0>';
                                    xml += '<ns2:cabecalho versao="3" xmlns:ns2="http://www.ginfes.com.br/cabecalho_v03.xsd">';
                                    xml += '<versaoDados>3</versaoDados>';
                                    xml += '</ns2:cabecalho>';
                                    xml += '</arg0>';
                                    xml += '<arg1>';
                                    xml += xmlSignature;
                                    xml += '</arg1>';
                                    xml += '</ns1:ConsultarLoteRpsV3>';
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
        
        
                case 'consultarNfsePorRps':
                    try {
                        const pfx = fs.readFileSync(object.config.diretorioDoCertificado);
        
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
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
                                validator.validateXML(xmlSignature, __dirname + '/../../../../resources/xsd/ginfes/servico_consultar_nfse_rps_envio_v03.xsd', function (err, validatorResult) {
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
                                resolve(err);
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
                                validator.validateXML(xmlSignature, __dirname + '/../../../../resources/xsd/ginfes/servico_consultar_situacao_lote_rps_envio_v03.xsd', function (err, validatorResult) {
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
                                resolve(err);
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
                            //     xml += '<Cpf>' + object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cpf>';
                            // }
        
                            // if (object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 14) {
                            //     xml += '<Cnpj>' + object.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                            // }
                            // xml += '</CpfCnpj>';
                            // xml += '</Tomador>';
                            xml += '</ConsultarNfseEnvio>';
        
                            createSignature(xml, cert, 'ConsultarNfseEnvio').then(xmlSignature => {
                                validator.validateXML(xmlSignature, __dirname + '/../../../../resources/xsd/ginfes/servico_consultar_nfse_envio_v03.xsd', function (err, validatorResult) {
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
            reject(error);
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
            let baseCalculoRps = r.baseCalculo ? r.baseCalculo : (r.servico.valorServicos - r.servico.valorDeducoes);
            let prestadorCnpj;
            let prestadorIncricaoMunicipal;
            if (r.prestador) {
                if (r.prestador.cpfCnpj) {
                    prestadorCnpj = r.prestador.cpfCnpj.replace(/[^\d]+/g, '');
                }
                if (r.prestador.inscricaoMunicipal) {
                    prestadorIncricaoMunicipal = r.prestador.inscricaoMunicipal;
                }
            }
            xmlToBeSigned += `<${particularitiesObject['tags']['rpsAlterada'] ? particularitiesObject['tags']['rpsAlterada'] : particularitiesObject['tags']['rps']}>`;
            if (object.emissor.cpfCnpj || object.emissor.cpfCnpj != '') {
                xmlToBeSigned += `<${particularitiesObject['tags']['infRpsAlterada'] ? particularitiesObject['tags']['infRpsAlterada'] : particularitiesObject['tags']['infRps']}>`;
            }
            xmlToBeSigned += `<${particularitiesObject['tags']['identificacaoRpsAlterada'] ? particularitiesObject['tags']['identificacaoRpsAlterada'] : particularitiesObject['tags']['identificacaoRps']}>`;
            xmlToBeSigned += `<${particularitiesObject['tags']['numeroAlterada'] ? particularitiesObject['tags']['numeroAlterada'] : particularitiesObject['tags']['numero']}>` + numeroRps + `</${particularitiesObject['tags']['numero']}>`;
            xmlToBeSigned += `<${particularitiesObject['tags']['serieAlterada'] ? particularitiesObject['tags']['serieAlterada'] : particularitiesObject['tags']['serie']}>` + serieRps + `</${particularitiesObject['tags']['serie']}>`;
            if (object.emissor.cpfCnpj || object.emissor.cpfCnpj != '') {
                xmlToBeSigned += `<${particularitiesObject['tags']['tipoAlterada'] ? particularitiesObject['tags']['tipoAlterada'] : particularitiesObject['tags']['tipo']}>` + r.tipo + `</${particularitiesObject['tags']['tipo']}>`;
            }
            xmlToBeSigned += `</${particularitiesObject['tags']['identificacaoRps']}>`;
            if (r.dataEmissao) {
                xmlToBeSigned += `<${particularitiesObject['tags']['dataEmissaoAlterada'] ? particularitiesObject['tags']['dataEmissaoAlterada'] : particularitiesObject['tags']['dataEmissao']}>` + r.dataEmissao.replace(/\s/g, 'T') + `</${particularitiesObject['tags']['dataEmissao']}>`;
            }
            if (r.naturezaOperacao) {
                xmlToBeSigned += `<${particularitiesObject['tags']['naturezaOperacaoAlterada'] ? particularitiesObject['tags']['naturezaOperacaoAlterada'] : particularitiesObject['tags']['naturezaOperacao']}>` + r.naturezaOperacao + `</${particularitiesObject['tags']['naturezaOperacao']}>`;
            }
            if (r.regimeEspecialTributacao && r.regimeEspecialTributacao != '') {
                xmlToBeSigned += `<${particularitiesObject['tags']['regimeEspecialTributacaoAlterada'] ? particularitiesObject['tags']['regimeEspecialTributacaoAlterada'] : particularitiesObject['tags']['regimeEspecialTributacao']}>` + r.regimeEspecialTributacao + `</${particularitiesObject['tags']['regimeEspecialTributacao']}>`;
            }
            if (r.optanteSimplesNacional) {
                xmlToBeSigned += `<${particularitiesObject['tags']['optanteSimplesNacionalAlterada'] ? particularitiesObject['tags']['optanteSimplesNacionalAlterada'] : particularitiesObject['tags']['optanteSimplesNacional']}>` + r.optanteSimplesNacional + `</${particularitiesObject['tags']['optanteSimplesNacional']}>`;
            }
            if (r.incentivadorCultural) {
                xmlToBeSigned += `<${particularitiesObject['tags']['incentivadorCulturalAlterada'] ? particularitiesObject['tags']['incentivadorCulturalAlterada'] : particularitiesObject['tags']['incentivadorCultural']}>` + r.incentivadorCultural + `</${particularitiesObject['tags']['incentivadorCultural']}>`;
            }
            if (r.status) {
                xmlToBeSigned += `<${particularitiesObject['tags']['statusAlterada'] ? particularitiesObject['tags']['statusAlterada'] : particularitiesObject['tags']['status']}>` + r.status + `</${particularitiesObject['tags']['status']}>`;
            }

            xmlToBeSigned += `<${particularitiesObject['tags']['servicoAlterada'] ? particularitiesObject['tags']['servicoAlterada'] : particularitiesObject['tags']['servico']}>`;
            xmlToBeSigned += `<${particularitiesObject['tags']['valoresAlterada'] ? particularitiesObject['tags']['valoresAlterada'] : particularitiesObject['tags']['valores']}>`;
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
            if (r.servico.issRetido) {
                xmlToBeSigned += `<${particularitiesObject['tags']['issRetidoAlterada'] ? particularitiesObject['tags']['issRetidoAlterada'] : particularitiesObject['tags']['issRetido']}>` + r.servico.issRetido + `</${particularitiesObject['tags']['issRetido']}>`;
            }
            if (r.servico.valorIss) {
                xmlToBeSigned += `<${particularitiesObject['tags']['valorIssAlterada'] ? particularitiesObject['tags']['valorIssAlterada'] : particularitiesObject['tags']['valorIss']}>` + r.servico.valorIss + `</${particularitiesObject['tags']['valorIss']}>`;
            }
            if (baseCalculoRps) {
                xmlToBeSigned += `<${particularitiesObject['tags']['baseCalculoAlterada'] ? particularitiesObject['tags']['baseCalculoAlterada'] : particularitiesObject['tags']['baseCalculo']}>` + baseCalculoRps + `</${particularitiesObject['tags']['baseCalculo']}>`;
            }
            if (r.servico.aliquota) {
                xmlToBeSigned += `<${particularitiesObject['tags']['aliquotaAlterada'] ? particularitiesObject['tags']['aliquotaAlterada'] : particularitiesObject['tags']['aliquota']}>` + r.servico.aliquota + `</${particularitiesObject['tags']['aliquota']}>`;
            }
            if (r.servico.valorLiquidoNfse) {
                xmlToBeSigned += `<${particularitiesObject['tags']['valorLiquidoNfseAlterada'] ? particularitiesObject['tags']['valorLiquidoNfseAlterada'] : particularitiesObject['tags']['valorLiquidoNfse']}>` + r.servico.valorLiquidoNfse + `</${particularitiesObject['tags']['valorLiquidoNfse']}>`;
            }
            xmlToBeSigned += `</${particularitiesObject['tags']['valores']}>`;
            if (r.servico.itemListaServico) {
                xmlToBeSigned += `<${particularitiesObject['tags']['itemListaServicoAlterada'] ? particularitiesObject['tags']['itemListaServicoAlterada'] : particularitiesObject['tags']['itemListaServico']}>` + r.servico.itemListaServico.replace(/[^\d]+/g, '') + `</${particularitiesObject['tags']['itemListaServico']}>`;
            }
            if (r.servico.codigoTributacaoMunicipio || r.servico.codigoTributacaoMunicipio != '') {
                xmlToBeSigned += `<${particularitiesObject['tags']['codigoTributacaoMunicipioAlterada'] ? particularitiesObject['tags']['codigoTributacaoMunicipioAlterada'] : particularitiesObject['tags']['codigoTributacaoMunicipio']}>` + r.servico.codigoTributacaoMunicipio + `</${particularitiesObject['tags']['codigoTributacaoMunicipio']}>`;
            }
            if (r.servico.discriminacao) {
                xmlToBeSigned += `<${particularitiesObject['tags']['discriminacaoAlterada'] ? particularitiesObject['tags']['discriminacaoAlterada'] : particularitiesObject['tags']['discriminacao']}>` + r.servico.discriminacao + `</${particularitiesObject['tags']['discriminacao']}>`;
            }
            if (r.servico.codigoMunicipio) {
                xmlToBeSigned += `<${particularitiesObject['tags']['codigoMunicipioAlterada'] ? particularitiesObject['tags']['codigoMunicipioAlterada'] : particularitiesObject['tags']['codigoMunicipio']}>` + r.servico.codigoMunicipio + `</${particularitiesObject['tags']['codigoMunicipio']}>`;
            }
            xmlToBeSigned += `</${particularitiesObject['tags']['servico']}>`;

            if (r.prestador) {
                xmlToBeSigned += `<${particularitiesObject['tags']['prestadorAlterada'] ? particularitiesObject['tags']['prestadorAlterada'] : particularitiesObject['tags']['prestador']}>`;
                if (prestadorCnpj) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['cnpjAlterada'] ? particularitiesObject['tags']['cnpjAlterada'] : particularitiesObject['tags']['cnpj']}>` + prestadorCnpj.replace(/[^\d]+/g, '') + `</${particularitiesObject['tags']['cnpj']}>`;
                }
                if (prestadorIncricaoMunicipal || prestadorIncricaoMunicipal != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>` + prestadorIncricaoMunicipal + `</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                }
                xmlToBeSigned += `</${particularitiesObject['tags']['prestador']}>`;
            }
            if (r.tomador) {
                xmlToBeSigned += `<${particularitiesObject['tags']['tomadorAlterada'] ? particularitiesObject['tags']['tomadorAlterada'] : particularitiesObject['tags']['tomador']}>`;
                xmlToBeSigned += `<${particularitiesObject['tags']['identificacaoTomadorAlterada'] ? particularitiesObject['tags']['identificacaoTomadorAlterada'] : particularitiesObject['tags']['identificacaoTomador']}>`;
                if (r.tomador.cpfCnpj) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['cpfCnpjAlterada'] ? particularitiesObject['tags']['cpfCnpjAlterada'] : particularitiesObject['tags']['cpfCnpj']}>`;
                    if (r.tomador.cpfCnpj.replace(/[^\d]+/g, '').length === 11) {
                        xmlToBeSigned += '<Cpf>' + r.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cpf>';
                    }

                    if (r.tomador.cpfCnpj.replace(/[^\d]+/g, '').length === 14) {
                        xmlToBeSigned += '<Cnpj>' + r.tomador.cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</Cnpj>';
                    }
                    xmlToBeSigned += `</${particularitiesObject['tags']['cpfCnpj']}>`;
                }
                if (r.tomador.inscricaoMunicipal || r.tomador.inscricaoMunicipal != '') {
                    xmlToBeSigned += `<${particularitiesObject['tags']['inscricaoMunicipalAlterada'] ? particularitiesObject['tags']['inscricaoMunicipalAlterada'] : particularitiesObject['tags']['inscricaoMunicipal']}>` + r.tomador.inscricaoMunicipal + `</${particularitiesObject['tags']['inscricaoMunicipal']}>`;
                }
                xmlToBeSigned += `</${particularitiesObject['tags']['identificacaoTomador']}>`;
                if (r.tomador.razaoSocial) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['razaoSocialAlterada'] ? particularitiesObject['tags']['razaoSocialAlterada'] : particularitiesObject['tags']['razaoSocial']}>` + r.tomador.razaoSocial + `</${particularitiesObject['tags']['razaoSocial']}>`;
                }
                if (r.tomador.endereco) {
                    xmlToBeSigned += `<${particularitiesObject['tags']['enderecoAlterada'] ? particularitiesObject['tags']['enderecoAlterada'] : particularitiesObject['tags']['endereco']}>`;
                    if (r.tomador.endereco.endereco) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['enderecoAlterada'] ? particularitiesObject['tags']['enderecoAlterada'] : particularitiesObject['tags']['endereco']}>` + r.tomador.endereco.endereco + `</${particularitiesObject['tags']['endereco']}>`;
                    }
                    if (r.tomador.endereco.numero) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['numeroAlterada'] ? particularitiesObject['tags']['numeroAlterada'] : particularitiesObject['tags']['numero']}>` + r.tomador.endereco.numero + `</${particularitiesObject['tags']['numero']}>`;
                    }
                    if (r.tomador.endereco.bairro) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['bairroAlterada'] ? particularitiesObject['tags']['bairroAlterada'] : particularitiesObject['tags']['bairro']}>` + r.tomador.endereco.bairro + `</${particularitiesObject['tags']['bairro']}>`;
                    }
                    if (r.tomador.endereco.codigoMunicipio) {
                        xmlToBeSigned += `<${particularitiesObject['tags']['codigoMunicipioAlterada'] ? particularitiesObject['tags']['codigoMunicipioAlterada'] : particularitiesObject['tags']['codigoMunicipio']}>` + r.tomador.endereco.codigoMunicipio + `</${particularitiesObject['tags']['codigoMunicipio']}>`;
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
                    xmlToBeSigned += `<${particularitiesObject['tags']['contatoAlterada'] ? particularitiesObject['tags']['contatoAlterada'] : particularitiesObject['tags']['contato']}>`;
                    if (r.tomador.contato.telefone && r.tomador.contato.telefone != '') {
                        xmlToBeSigned += `<${particularitiesObject['tags']['telefoneAlterada'] ? particularitiesObject['tags']['telefoneAlterada'] : particularitiesObject['tags']['telefone']}>` + r.tomador.contato.telefone + `</${particularitiesObject['tags']['telefone']}>`;
                    }
                    if (r.tomador.contato.email && r.tomador.contato.email != '') {
                        xmlToBeSigned += `<${particularitiesObject['tags']['emailAlterada'] ? particularitiesObject['tags']['emailAlterada'] : particularitiesObject['tags']['email']}>` + r.tomador.contato.email + `</${particularitiesObject['tags']['email']}>`;
                    }
                    xmlToBeSigned += `</${particularitiesObject['tags']['contato']}>`;
                }
                xmlToBeSigned += `</${particularitiesObject['tags']['tomador']}>`;
            }
            xmlToBeSigned += `</${particularitiesObject['tags']['infRps']}>`;
            xmlToBeSigned += `</${particularitiesObject['tags']['rps']}>`;
            xmlToBeSigned = xmlToBeSigned.replace(regexUnique, uniqueValue + index);

            xmlToBeSignedArray.push(xmlToBeSigned);

        });

        if (particularitiesObject['nfseKeyword'] === 'portoalegre') {
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

const createXmlAsync = async (object, particularitiesObject) => {
    await createXml(object, particularitiesObject)
        .then(res => {
            return res;
        })
        .catch(rej => {
            return rej;
            console.log(rej)
        })
}

const settingsControllerAsync = (object, city, model) => {
    return settingsController.setParticularities(object, city, model);
}

module.exports = {
    setRequirements
}