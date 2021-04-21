// Vendors
const fs = require('fs');
const pem = require('pem');
const validator = require('xsd-schema-validator');
// TO-DO: Checar validade do pfx

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

const formatXml = (xml) => {
    return xml.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
const replaceXml = (obj, xml) => {
    return obj['envelopment'].replace('__xml__', xml);
}
const createIdentificacaoRpsXml = (rps, tag = null) => {
    if (rps) {
        let xml = `<${tag || IdentificacaoRps}>`;
        if (rps.numero && rps.numero != '') {
            xml += `<tc:Numero>${rps.numero}</tc:Numero>`;
        }
        if (rps.serie && rps.serie != '') {
            xml += `<tc:Serie>${rps.serie}</tc:Serie>`;
        }
        if (rps.tipo && rps.tipo != '') {
            xml += `<tc:Tipo>${rps.tipo}</tc:Tipo>`;
        }
        xml += `</${tag || IdentificacaoRps}>`;
        return xml
    }
    return ''
}
const createPrestadorXml = (prestador, tag = null) => {
    if (prestador) {
        let xml = `<${tag || 'Prestador'}>`;
        xml += createCpfCnpjXml(prestador.cpfCnpj);
        xml += createInscricaoMunicipalXml(prestador.inscricaoMunicipal)
        xml += `</${tag || 'Prestador'}>`;
        return xml
    }
    return ''
}
const createTomadorXml = (tomador) => {
    if (tomador) {
        let xml = '<Tomador>';
        xml += createCpfCnpjXml(tomador.cpfCnpj)
        xml += createInscricaoMunicipalXml(tomador.inscricaoMunicipal)
        xml += '</Tomador>';
        return xml
    }
    return ''
}
const createTomadorCompletoXml = (tomador) => {
    if (tomador) {
        let xml = '<tc:Tomador>'
        xml += '<tc:IdentificacaoTomador>';
        xml += tomador.cpfCnpj ? createCpfCnpjXml(tomador.cpfCnpj) : ''
        xml += '</tc:IdentificacaoTomador>'
        xml += tomador.razaoSocial ? `<tc:RazaoSocial>${tomador.razaoSocial}</tc:RazaoSocial>` : ''
        xml += createEnderecoXml(tomador.endereco)
        xml += '</tc:Tomador>';
        return xml
    }
    return ''
}
const createEnderecoXml = (endereco) => {
    if (endereco) {
        let xml = '<tc:Endereco>'
        xml += `<tc:Endereco>${endereco.endereco}</tc:Endereco>`
        xml += `<tc:Numero>${endereco.numero}</tc:Numero>`
        xml += `<tc:Complemento>${endereco.complemento}</tc:Complemento>`
        xml += `<tc:Bairro>${endereco.bairro}</tc:Bairro>`
        xml += `<tc:Cidade>${endereco.codigoMunicipio}</tc:Cidade>`
        xml += `<tc:Estado>${endereco.uf.toUpperCase()}</tc:Estado>`
        xml += `<tc:Cep>${endereco.cep}</tc:Cep>`
        xml += '</tc:Endereco>'
        return xml
    }
    return ''
}
const createInscricaoMunicipalXml = (inscricaoMunicipal) => {
    if (inscricaoMunicipal && inscricaoMunicipal != '') {
        return `<tc:InscricaoMunicipal>${inscricaoMunicipal}</tc:InscricaoMunicipal>`;
    }
    return ''
}
const createCpfCnpjXml = (cpfCnpj) => {
    if (cpfCnpj) {
        let xml = '<tc:CpfCnpj>';
        if (cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 11) {
            xml += '<tc:Cpf>' + cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</tc:Cpf>';
        }
        if (cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 14) {
            xml += '<tc:Cnpj>' + cpfCnpj.replace(/\.|\/|\-|\s/g, '') + '</tc:Cnpj>';
        }
        xml += '</tc:CpfCnpj>';
        return xml
    }
    return ''
}
const createPeriodoEmissaoXml = (periodoEmissao) => {
    if (periodoEmissao && periodoEmissao.dataInicial && periodoEmissao.dataFinal) {
        let xml = '<PeriodoEmissao>';
        xml += `<DataInicial>${periodoEmissao.dataInicial}</DataInicial>`;
        xml += `<DataFinal>${periodoEmissao.dataFinal}</DataFinal>`;
        xml += '</PeriodoEmissao>';
        return xml
    }
    return ''
}
const generateRpsXml = (rps) => {
    let xml = '<tc:Rps><tc:InfRps>'
    xml += createIdentificacaoRpsXml(rps, 'tc:IdentificacaoRps')
    xml += `<tc:DataEmissao>${rps.dataEmissao}</tc:DataEmissao>`
    xml += `<tc:NaturezaOperacao>${rps.naturezaOperacao}</tc:NaturezaOperacao>`
    xml += `<tc:OptanteSimplesNacional>${rps.optanteSimplesNacional}</tc:OptanteSimplesNacional>`
    xml += `<tc:IncentivadorCultural>${rps.incentivadorCultural}</tc:IncentivadorCultural>`
    xml += `<tc:Status>${rps.status}</tc:Status>`
    xml += `<tc:RegimeEspecialTributacao>${rps.regimeEspecialTributacao}</tc:RegimeEspecialTributacao>`
    xml += '<tc:Servico><tc:Valores>'
    xml += `<tc:ValorServicos>${rps.servico.valorServicos || 0}</tc:ValorServicos>`
    xml += `<tc:ValorPis>${rps.servico.valorPis || 0}</tc:ValorPis>`
    xml += `<tc:ValorCofins>${rps.servico.valorCofins || 0}</tc:ValorCofins>`
    xml += `<tc:ValorInss>${rps.servico.valorInss || 0}</tc:ValorInss>`
    xml += `<tc:ValorIr>${rps.servico.valorIr || 0}</tc:ValorIr>`
    xml += `<tc:ValorCsll>${rps.servico.valorCsll || 0}</tc:ValorCsll>`
    xml += `<tc:IssRetido>${rps.servico.issRetido || 0}</tc:IssRetido>`
    xml += `<tc:ValorIss>${rps.servico.valorIss || 0}</tc:ValorIss>`
    xml += `<tc:BaseCalculo>${rps.servico.baseCalculo || 0}</tc:BaseCalculo>`
    xml += `<tc:Aliquota>${rps.servico.aliquota || 0}</tc:Aliquota>`
    xml += `<tc:ValorLiquidoNfse>${rps.servico.valorLiquidoNfse || 0}</tc:ValorLiquidoNfse>`
    xml += `<tc:DescontoIncondicionado>${rps.servico.descontoIncondicionado || 0}</tc:DescontoIncondicionado>`
    xml += `<tc:DescontoCondicionado>${rps.servico.descontoCondicionado || 0}</tc:DescontoCondicionado>`
    xml += `</tc:Valores>`
    xml += `<tc:ItemListaServico>${rps.servico.itemListaServico}</tc:ItemListaServico>`
    xml += `<tc:CodigoCnae>${rps.servico.codigoCnae}</tc:CodigoCnae>`
    xml += `<tc:CodigoTributacaoMunicipio>${rps.servico.codigoTributacaoMunicipio}</tc:CodigoTributacaoMunicipio>`
    xml += `<tc:Discriminacao>${rps.servico.discriminacao}</tc:Discriminacao>`
    xml += `<tc:MunicipioPrestacaoServico>${rps.servico.codigoMunicipio}</tc:MunicipioPrestacaoServico>`
    xml += '</tc:Servico>'
    xml += createPrestadorXml(rps.prestador, 'tc:Prestador')
    xml += createTomadorCompletoXml(rps.tomador)
    xml += '</tc:InfRps></tc:Rps>'
    return xml
}
const createIdentificacaoNfseXml = (nfse, emissor, codigoMunicipio) => {
    if (nfse) {
        let xml = `<tc:IdentificacaoNfse>`;
        xml += nfse.numero && nfse.numero != '' ? `<tc:Numero>${nfse.numero}</tc:Numero>` : ''
        xml += emissor && emissor.cpfCnpj ? `<tc:Cnpj>${emissor.cpfCnpj}</tc:Cnpj>` : ''
        xml += emissor && emissor.inscricaoMunicipal ? `<tc:InscricaoMunicipal>${emissor.inscricaoMunicipal}</tc:InscricaoMunicipal>` : ''
        xml += codigoMunicipio && codigoMunicipio != '' ? `<tc:CodigoMunicipio>${codigoMunicipio}</tc:CodigoMunicipio>` : ''
        xml += `</tc:IdentificacaoNfse>`;
        return xml
    }
    return ''
}

const createXml = async (object, particularitiesObject, numeroLote) => {
    return new Promise((resolve, reject) => {
        try {
            const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

            const result = { url: particularitiesObject['webserviceUrl'] }
            switch (object.config.acao) {
                case 'enviarLoteRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            let xml = '<?xml version="1.0" encoding="utf-8"?>';

                            xml += `<${particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] ? particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] : particularitiesObject['tags']['enviarLoteRpsEnvio']}>`;
                            xml += `<LoteRps>`;
                            if (numeroLote) {
                                xml += `<tc:NumeroLote>` + numeroLote + `</tc:NumeroLote>`;
                            }
                            xml += createCpfCnpjXml(object.emissor.cpfCnpj)
                            xml += createInscricaoMunicipalXml(object.emissor.inscricaoMunicipal)

                            xml += `<tc:QuantidadeRps>${object.rps.length}</tc:QuantidadeRps>`;

                            xml += '<tc:ListaRps>'

                            object.rps.forEach(rps => {
                                xml += generateRpsXml(rps)
                            })

                            xml += '</tc:ListaRps>'
                            xml += `</LoteRps>`;
                            xml += `</${particularitiesObject['tags']['enviarLoteRpsEnvio']}>`


                            let isEmptyUri = null || particularitiesObject['isSigned']['isEmptyUri']
                            let signatureId = null || particularitiesObject['isSigned']['signatureId']
                            let isDifferentSignature = null || particularitiesObject['isSigned']['isDifferentSignature']

                            createSignature(xml, cert, 'LoteRps', signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {

                                    try {
                                        xmlSignature = formatXml(xmlSignature)
                                        let xml = replaceXml(particularitiesObject, xmlSignature)

                                        result.soapEnvelop = xml
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
                            let xml = '<?xml version="1.0" encoding="utf-8"?>';

                            xml += `<CancelarNfseEnvio xmlns:p1="http://www.issnetonline.com.br/webserviceabrasf/vsd/servico_cancelar_nfse_envio.xsd" xmlns:tc="http://www.issnetonline.com.br/webserviceabrasf/vsd/tipos_complexos.xsd" xmlns:ts="http://www.issnetonline.com.br/webserviceabrasf/vsd/tipos_simples.xsd">`;
                            xml += `<InfPedidoCancelamento>`;

                            xml += createIdentificacaoNfseXml(object.nfse, object.emissor, object.codigoMunicipio)
                            xml += `<tc:CodigoCancelamento>${object.codigoCancelamento}</tc:CodigoCancelamento>`

                            xml += `</InfPedidoCancelamento>`;
                            xml += `</CancelarNfseEnvio>`

                            let isEmptyUri = particularitiesObject['isSigned']['isEmptyUri'] || null
                            let signatureId = particularitiesObject['isSigned']['signatureId'] || null
                            let isDifferentSignature = particularitiesObject['isSigned']['isDifferentSignature'] || null

                            createSignature(xml, cert, 'InfPedidoCancelamento', signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {


                                    if (particularitiesObject['isSigned']['cancelarNfse']) {
                                        xml = xmlSignature;
                                    }
                                    xml = xml.replace("<CancelarNfseEnvio xmlns", "<p1:CancelarNfseEnvio xmlns")
                                    xml = xml.replace("<InfPedidoCancelamento>", "<Pedido><InfPedidoCancelamento>")
                                    xml = xml.replaceAll("InfPedidoCancelamento", "tc:InfPedidoCancelamento")
                                    xml = xml.replace("</CancelarNfseEnvio>", "</Pedido></p1:CancelarNfseEnvio>")
                                    console.log('xml\n', xml)
                                    xml = formatXml(xml)
                                    xml = replaceXml(particularitiesObject, xml)

                                    result.soapEnvelop = xml
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
                            let xmlNotSigned = '<?xml version="1.0" encoding="utf-8"?>';

                            xmlNotSigned += `<${particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] ? particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] : particularitiesObject['tags']['consultarLoteRpsEnvio']}>`;
                            xmlNotSigned += createPrestadorXml(object.prestador)
                            xmlNotSigned += `<Protocolo>${object.protocolo}</Protocolo>`;
                            xmlNotSigned += `</${particularitiesObject['tags']['consultarLoteRpsEnvio']}>`;

                            createSignature(xmlNotSigned, cert, 'ConsultarLoteRpsEnvio')
                                .then(xmlSignature => {
                                    xmlNotSigned = formatXml(xmlNotSigned)
                                    xmlSignature = formatXml(xmlSignature)

                                    let xml = particularitiesObject['envelopment'].replace('__xml__', xmlNotSigned);

                                    if (particularitiesObject['isSigned']['consultarLoteRpsEnvio']) {
                                        xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);
                                    }

                                    result.soapEnvelop = xml
                                    if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarLoteRpsEnvio']) {
                                        result['soapAction'] = particularitiesObject['soapActions']['consultarLoteRpsEnvio'];
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
                            let xmlNotSigned = '<?xml version="1.0" encoding="utf-8"?>';

                            xmlNotSigned += `<${particularitiesObject['tags']['consultarNfseRpsEnvioAlterada'] ? particularitiesObject['tags']['consultarNfseRpsEnvioAlterada'] : particularitiesObject['tags']['consultarNfseRpsEnvio']}>`;

                            xmlNotSigned += createIdentificacaoRpsXml(object.rps)
                            xmlNotSigned += createPrestadorXml(object.prestador)
                            xmlNotSigned += '</ConsultarNfseRpsEnvio>';

                            let isEmptyUri = null || particularitiesObject['isSigned']['isEmptyUri']
                            let signatureId = null || particularitiesObject['isSigned']['signatureId']
                            let isDifferentSignature = null || particularitiesObject['isSigned']['isDifferentSignature']

                            createSignature(xmlNotSigned, cert, 'ConsultarNfseRpsEnvio', signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {

                                    xmlNotSigned = formatXml(xmlNotSigned)
                                    xmlSignature = formatXml(xmlSignature)

                                    let xml = particularitiesObject['envelopment'].replace('__xml__', xmlNotSigned);

                                    if (particularitiesObject['isSigned']['consultarNfseRps']) {
                                        xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);
                                    }

                                    result.soapEnvelop = xml
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
                            let xmlNotSigned = '<?xml version="1.0" encoding="utf-8"?>';

                            xmlNotSigned += `<${particularitiesObject['tags']['consultarSituacaoLoteRpsEnvioAlterada'] ? particularitiesObject['tags']['consultarSituacaoLoteRpsEnvioAlterada'] : particularitiesObject['tags']['consultarSituacaoLoteRpsEnvio']}>`;
                            xmlNotSigned += createPrestadorXml(object.prestador)
                            xmlNotSigned += `<Protocolo>${object.protocolo}</Protocolo>`;
                            xmlNotSigned += `</${particularitiesObject['tags']['consultarSituacaoLoteRpsEnvio']}>`;

                            createSignature(xmlNotSigned, cert, 'ConsultarSituacaoLoteRpsEnvio')
                                .then(xmlSignature => {
                                    xmlNotSigned = formatXml(xmlNotSigned)
                                    xmlSignature = formatXml(xmlSignature)

                                    let xml = particularitiesObject['envelopment'].replace('__xml__', xmlNotSigned);

                                    if (particularitiesObject['isSigned']['consultarSituacaoLoteRpsEnvio']) {
                                        xml = particularitiesObject['envelopment'].replace('__xml__', xmlSignature);
                                    }

                                    result.soapEnvelop = xml
                                    if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarSituacaoLoteRpsEnvio']) {
                                        result['soapAction'] = particularitiesObject['soapActions']['consultarSituacaoLoteRpsEnvio'];
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

                case 'consultarNfse':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            let xmlNotSigned = '<?xml version="1.0" encoding="utf-8"?>';
                            xmlNotSigned += `<${particularitiesObject['tags']['consultarNfseEnvioAlterada'] ? particularitiesObject['tags']['consultarNfseEnvioAlterada'] : particularitiesObject['tags']['consultarNfseEnvio']}>`;

                            xmlNotSigned += createPrestadorXml(object.prestador)

                            if (object.numeroNfse) {
                                xmlNotSigned += '<NumeroNfse>' + object.numeroNfse + '</NumeroNfse>';
                            }
                            xmlNotSigned += createPeriodoEmissaoXml(object.periodoEmissao)
                            xmlNotSigned += createTomadorXml(object.tomador)
                            xmlNotSigned += '</ConsultarNfseEnvio>';

                            let isEmptyUri = null || particularitiesObject['isSigned']['isEmptyUri']
                            let signatureId = null || particularitiesObject['isSigned']['signatureId']
                            let isDifferentSignature = null || particularitiesObject['isSigned']['isDifferentSignature']

                            createSignature(xmlNotSigned, cert, 'ConsultarNfseEnvio', signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {

                                    xmlNotSigned = formatXml(xmlNotSigned)
                                    xmlSignature = formatXml(xmlSignature)

                                    xml = (particularitiesObject['isSigned']['consultarNfse'] ? replaceXml(particularitiesObject, xmlSignature) : replaceXml(particularitiesObject, xmlNotSigned))

                                    result.soapEnvelop = xml
                                    result.soapAction = null || particularitiesObject['soapActions']['consultarNfse'];

                                    resolve(result);
                                }).catch(err => {
                                    console.error(err);
                                });
                        });
                    } catch (error) {
                        reject(error);
                    }
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