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
const createIdentificacaoRpsXml = (tags, rps, tc = false) => {
    if (rps) {
        let tag = tc ? tags['tcIdentificacaoRps'] : tags['IdentificacaoRps']
        let xml = `<${tag}>`;
        if (rps.numero && rps.numero != '') {
            xml += `<${tags['tcNumero']}>${rps.numero}</${tags['tcNumero']}>`;
        }
        if (rps.serie && rps.serie != '') {
            xml += `<${tags['tcSerie']}>${rps.serie}</${tags['tcSerie']}>`;
        }
        if (rps.tipo && rps.tipo != '') {
            xml += `<${tags['tcTipo']}>${rps.tipo}</${tags['tcTipo']}>`;
        }
        xml += `</${tag}>`;
        return xml
    }
    return ''
}
const createPrestadorXml = (tags, prestador, tc = false) => {
    if (prestador) {
        let tag = tc ? tags['tcPrestador'] : tags['Prestador']
        let xml = `<${tag}>`;
        xml += createCpfCnpjXml(tags, prestador.cpfCnpj);
        xml += createInscricaoMunicipalXml(tags, prestador.inscricaoMunicipal)
        xml += `</${tag}>`;
        return xml
    }
    return ''
}
const createTomadorXml = (tags, tomador, tc = false) => {
    if (tomador) {
        let tag = tc ? tags['tcTomador'] : tags['Tomador']
        let xml = `<${tag}>`;
        xml += createCpfCnpjXml(tags, tomador.cpfCnpj)
        xml += createInscricaoMunicipalXml(tags, tomador.inscricaoMunicipal)
        xml += `</${tag}>`;
        return xml
    }
    return ''
}
const createTomadorCompletoXml = (tags, tomador, tc = false) => {
    if (tomador) {
        let tag = tc ? tags['tcTomador'] : tags['Tomador']
        let xml = `<${tag}>`;
        xml += `<${tags['tcIdentificacaoTomador']}>`;
        xml += tomador.cpfCnpj ? createCpfCnpjXml(tags, tomador.cpfCnpj) : ''
        xml += `</${tags['tcIdentificacaoTomador']}>`
        xml += tomador.razaoSocial ? `<${tags['tcRazaoSocial']}>${tomador.razaoSocial}</${tags['tcRazaoSocial']}>` : ''
        xml += createEnderecoXml(tags, tomador.endereco, true)
        xml += `</${tag}>`;
        return xml
    }
    return ''
}
const createEnderecoXml = (tags, endereco, tc = false) => {
    if (endereco) {
        let tag = tc ? tags['tcEndereco'] : tags['Endereco']
        let xml = `<${tag}>`;
        xml += `<${tags['tcEndereco']}>${endereco.endereco}</${tags['tcEndereco']}>`
        xml += `<${tags['tcNumero']}>${endereco.numero}</${tags['tcNumero']}>`
        xml += `<${tags['tcComplemento']}>${endereco.complemento || ''}</${tags['tcComplemento']}>`
        xml += `<${tags['tcBairro']}>${endereco.bairro}</${tags['tcBairro']}>`
        xml += `<${tags['tcCidade']}>${endereco.codigoMunicipio}</${tags['tcCidade']}>`
        xml += `<${tags['tcEstado']}>${endereco.uf.toUpperCase()}</${tags['tcEstado']}>`
        xml += `<${tags['tcCep']}>${endereco.cep}</${tags['tcCep']}>`
        xml += `</${tag}>`;
        return xml
    }
    return ''
}
const createInscricaoMunicipalXml = (tags, inscricaoMunicipal) => {
    if (inscricaoMunicipal && inscricaoMunicipal != '') {
        return `<${tags['tcInscricaoMunicipal']}>${inscricaoMunicipal}</${tags['tcInscricaoMunicipal']}>`;
    }
    return ''
}
const createCpfCnpjXml = (tags, cpfCnpj) => {
    if (cpfCnpj) {
        let xml = `<${tags['tcCpfCnpj']}>`;
        if (cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 11) {
            xml += `<${tags['tcCpf']}>${cpfCnpj.replace(/\.|\/|\-|\s/g, '')}</${tags['tcCpf']}>`;
        }
        if (cpfCnpj.replace(/\.|\/|\-|\s/g, '').length === 14) {
            xml += `<${tags['tcCnpj']}>${cpfCnpj.replace(/\.|\/|\-|\s/g, '')}</${tags['tcCnpj']}>`
        }
        xml += `</${tags['tcCpfCnpj']}>`;
        return xml
    }
    return ''
}
const createPeriodoEmissaoXml = (tags, periodoEmissao) => {
    if (periodoEmissao && periodoEmissao.dataInicial && periodoEmissao.dataFinal) {
        let xml = `<${tags['periodoEmissao']}>`;
        xml += `<${tags['dataInicial']}>${periodoEmissao.dataInicial}</${tags['dataInicial']}>`;
        xml += `<${tags['dataFinal']}>${periodoEmissao.dataFinal}</${tags['dataFinal']}>`;
        xml += `</${tags['periodoEmissao']}>`;
        return xml
    }
    return ''
}
const generateRpsXml = (tags, rps) => {
    let xml = `<${tags['tcRps']}><${tags['tcInfRps']}>`
    xml += createIdentificacaoRpsXml(tags, rps, true)
    xml += `<${tags['tcDataEmissao']}>${rps.dataEmissao}</${tags['tcDataEmissao']}>`
    xml += `<${tags['tcNaturezaOperacao']}>${rps.naturezaOperacao}</${tags['tcNaturezaOperacao']}>`
    xml += `<${tags['tcOptanteSimplesNacional']}>${rps.optanteSimplesNacional}</${tags['tcOptanteSimplesNacional']}>`
    xml += `<${tags['tcIncentivadorCultural']}>${rps.incentivadorCultural}</${tags['tcIncentivadorCultural']}>`
    xml += `<${tags['tcStatus']}>${rps.status}</${tags['tcStatus']}>`
    xml += `<${tags['tcRegimeEspecialTributacao']}>${rps.regimeEspecialTributacao}</${tags['tcRegimeEspecialTributacao']}>`
    xml += `<${tags['tcServico']}><${tags['tcValores']}>`
    xml += `<${tags['tcValorServicos']}>${rps.servico.valorServicos || 0}</${tags['tcValorServicos']}>`
    xml += `<${tags['tcValorPis']}>${rps.servico.valorPis || 0}</${tags['tcValorPis']}>`
    xml += `<${tags['tcValorCofins']}>${rps.servico.valorCofins || 0}</${tags['tcValorCofins']}>`
    xml += `<${tags['tcValorInss']}>${rps.servico.valorInss || 0}</${tags['tcValorInss']}>`
    xml += `<${tags['tcValorIr']}>${rps.servico.valorIr || 0}</${tags['tcValorIr']}>`
    xml += `<${tags['tcValorCsll']}>${rps.servico.valorCsll || 0}</${tags['tcValorCsll']}>`
    xml += `<${tags['tcIssRetido']}>${rps.servico.issRetido || 0}</${tags['tcIssRetido']}>`
    xml += `<${tags['tcValorIss']}>${rps.servico.valorIss || 0}</${tags['tcValorIss']}>`
    xml += `<${tags['tcBaseCalculo']}>${rps.servico.baseCalculo || 0}</${tags['tcBaseCalculo']}>`
    xml += `<${tags['tcAliquota']}>${rps.servico.aliquota || 0}</${tags['tcAliquota']}>`
    xml += `<${tags['tcValorLiquidoNfse']}>${rps.servico.valorLiquidoNfse || 0}</${tags['tcValorLiquidoNfse']}>`
    xml += `<${tags['tcDescontoIncondicionado']}>${rps.servico.descontoIncondicionado || 0}</${tags['tcDescontoIncondicionado']}>`
    xml += `<${tags['tcDescontoCondicionado']}>${rps.servico.descontoCondicionado || 0}</${tags['tcDescontoCondicionado']}>`
    xml += `</${tags['tcValores']}>`
    xml += `<${tags['tcItemListaServico']}>${rps.servico.itemListaServico}</${tags['tcItemListaServico']}>`
    xml += `<${tags['tcCodigoCnae']}>${rps.servico.codigoCnae}</${tags['tcCodigoCnae']}>`
    xml += `<${tags['tcCodigoTributacaoMunicipio']}>${rps.servico.codigoTributacaoMunicipio}</${tags['tcCodigoTributacaoMunicipio']}>`
    xml += `<${tags['tcDiscriminacao']}>${rps.servico.discriminacao}</${tags['tcDiscriminacao']}>`
    xml += `<${tags['tcMunicipioPrestacaoServico']}>${rps.servico.codigoMunicipio}</${tags['tcMunicipioPrestacaoServico']}>`
    xml += `</${tags['tcServico']}>`
    xml += createPrestadorXml(tags, rps.prestador, true)
    xml += createTomadorCompletoXml(tags, rps.tomador, true)
    xml += `</${tags['tcInfRps']}></${tags['tcRps']}>`
    return xml
}
const createIdentificacaoNfseXml = (tags, nfse, emissor, codigoMunicipio) => {
    if (nfse) {
        let xml = `<${tags['tcIdentificacaoNfse']}>`;
        xml += nfse.numero && nfse.numero != '' ? `<${tags['tcNumero']}>${nfse.numero}</${tags['tcNumero']}>` : ''
        xml += emissor && emissor.cpfCnpj ? `<${tags['tcCnpj']}>${emissor.cpfCnpj}</${tags['tcCnpj']}>` : ''
        xml += emissor && emissor.inscricaoMunicipal ? `<${tags['tcInscricaoMunicipal']}>${emissor.inscricaoMunicipal}</${tags['tcInscricaoMunicipal']}>` : ''
        xml += codigoMunicipio && codigoMunicipio != '' ? `<${tags['tcCodigoMunicipio']}>${codigoMunicipio}</${tags['tcCodigoMunicipio']}>` : ''
        xml += `</${tags['tcIdentificacaoNfse']}>`;
        return xml
    }
    return ''
}

const createXml = async (object, particularitiesObject, numeroLote) => {
    return new Promise((resolve, reject) => {
        try {
            const pfx = fs.readFileSync(object.config.diretorioDoCertificado);

            const result = { url: particularitiesObject['webserviceUrl'] }
            let tags = particularitiesObject['tags']
            let xml = '<?xml version="1.0" encoding="utf-8"?>';

            switch (object.config.acao) {

                case 'cancelarNfse':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            xml += `<${tags['cancelarNfseAlterada'] ? tags['cancelarNfseAlterada'] : tags['cancelarNfse']}>`;
                            xml += `<${tags['Pedido']}>`;
                            xml += `<${tags['tcInfPedidoCancelamento']}>`;

                            xml += createIdentificacaoNfseXml(tags, object.nfse, object.emissor, object.codigoMunicipio)
                            xml += `<${tags['tcCodigoCancelamento']}>${object.codigoCancelamento}</${tags['tcCodigoCancelamento']}>`
                            xml += object.motivoCancelamento ? `<${tags['tcMotivoCancelamentoNfse']}>${object.motivoCancelamento}</${tags['tcMotivoCancelamentoNfse']}>` : ''

                            xml += `</${tags['tcInfPedidoCancelamento']}>`;
                            xml += `</${tags['Pedido']}>`;
                            xml += `</${tags['cancelarNfse']}>`
                            console.log(xml);
                            let isEmptyUri = particularitiesObject['isSigned']['isEmptyUri'] || null
                            let signatureId = particularitiesObject['isSigned']['signatureId'] || null
                            let isDifferentSignature = particularitiesObject['isSigned']['isDifferentSignature'] || null

                            createSignature(xml, cert, tags['tcInfPedidoCancelamento'], signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {


                                    if (particularitiesObject['isSigned']['cancelarNfse']) {
                                        xml = xmlSignature;
                                    }

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

                case 'consultarDadosCadastrais':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            xml += `<${tags['consultarDadosCadastraisAlterada'] ? tags['consultarDadosCadastraisAlterada'] : tags['consultarDadosCadastrais']}>`;

                            xml += createPrestadorXml(tags, object.prestador)

                            xml += `</${tags['consultarDadosCadastrais']}>`

                            let isEmptyUri = particularitiesObject['isSigned']['isEmptyUri'] || null
                            let signatureId = particularitiesObject['isSigned']['signatureId'] || null
                            let isDifferentSignature = particularitiesObject['isSigned']['isDifferentSignature'] || null

                            createSignature(xml, cert, tags['Prestador'], signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {

                                    try {
                                        xmlNotSigned = formatXml(xml)
                                        xmlSignature = formatXml(xmlSignature)

                                        xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['consultarDadosCadastrais'] ? xmlSignature : xmlNotSigned)

                                        result.soapEnvelop = xml
                                        if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarDadosCadastrais']) {
                                            result['soapAction'] = particularitiesObject['soapActions']['consultarDadosCadastrais'];
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

                case 'consultarLoteRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            xml += `<${tags['consultarLoteRpsAlterada'] ? tags['consultarLoteRpsAlterada'] : tags['consultarLoteRps']}>`;

                            xml += createPrestadorXml(tags, object.prestador)

                            xml += `<${tags['Protocolo']}>${object.protocolo}</${tags['Protocolo']}>`;
                            xml += `</${tags['consultarLoteRps']}>`;

                            createSignature(xml, cert, tags['consultarLoteRps'])
                                .then(xmlSignature => {
                                    xmlNotSigned = formatXml(xml)
                                    xmlSignature = formatXml(xmlSignature)

                                    xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['consultarLoteRps'] ? xmlSignature : xmlNotSigned)

                                    result.soapEnvelop = xml
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

                case 'consultarNfse':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            xml += `<${tags['consultarNfseAlterada'] ? tags['consultarNfseAlterada'] : tags['consultarNfse']}>`;

                            xml += createPrestadorXml(tags, object.prestador)

                            if (object.numeroNfse) {
                                xml += `<${tags['NumeroNfse']}>${object.numeroNfse}</${tags['NumeroNfse']}>`;
                            }
                            xml += createPeriodoEmissaoXml(tags, object.periodoEmissao)
                            xml += createTomadorXml(tags, object.tomador)
                            xml += `</${tags['consultarNfse']}>`;

                            let isEmptyUri = null || particularitiesObject['isSigned']['isEmptyUri']
                            let signatureId = null || particularitiesObject['isSigned']['signatureId']
                            let isDifferentSignature = null || particularitiesObject['isSigned']['isDifferentSignature']

                            createSignature(xml, cert, tags['Prestador'], signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {

                                    xmlNotSigned = formatXml(xml)
                                    xmlSignature = formatXml(xmlSignature)

                                    xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['consultarNfse'] ? xmlSignature : xmlNotSigned)

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

                case 'consultarNfsePorRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }
                            xml += `<${tags['consultarNfseRpsAlterada'] ? tags['consultarNfseRpsAlterada'] : tags['consultarNfseRps']}>`;

                            xml += createIdentificacaoRpsXml(tags, object.rps, false)
                            xml += createPrestadorXml(tags, object.prestador)

                            xml += `</${tags['consultarNfseRps']}>`;

                            let isEmptyUri = null || particularitiesObject['isSigned']['isEmptyUri']
                            let signatureId = null || particularitiesObject['isSigned']['signatureId']
                            let isDifferentSignature = null || particularitiesObject['isSigned']['isDifferentSignature']
                            console.log(xml);
                            createSignature(xml, cert, tags['consultarNfseRps'], signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {

                                    xmlNotSigned = formatXml(xml)
                                    xmlSignature = formatXml(xmlSignature)

                                    xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['consultarNfseRps'] ? xmlSignature : xmlNotSigned)

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
                            xml += `<${tags['consultarSituacaoLoteRpsAlterada'] ? tags['consultarSituacaoLoteRpsAlterada'] : tags['consultarSituacaoLoteRps']}>`;
                            xml += createPrestadorXml(tags, object.prestador)
                            xml += `<${tags['Protocolo']}>${object.protocolo}</${tags['Protocolo']}>`;
                            xml += `</${tags['consultarSituacaoLoteRps']}>`;

                            createSignature(xml, cert, tags['consultarSituacaoLoteRps'])
                                .then(xmlSignature => {
                                    xmlNotSigned = formatXml(xml)
                                    xmlSignature = formatXml(xmlSignature)

                                    xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['consultarSituacaoLoteRps'] ? xmlSignature : xmlNotSigned)

                                    result.soapEnvelop = xml
                                    if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarSituacaoLoteRps']) {
                                        result['soapAction'] = particularitiesObject['soapActions']['consultarSituacaoLoteRps'];
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

                case 'consultarUrlVisualizacaoNfse':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            let xml = '<?xml version="1.0" encoding="utf-8"?>';

                            xml += `<${tags['consultarUrlVisualizacaoNfseAlterada'] ? tags['consultarUrlVisualizacaoNfseAlterada'] : tags['consultarUrlVisualizacaoNfse']}>`;

                            xml += createPrestadorXml(tags, object.prestador)
                            xml += `<${tags['Numero']}>${object.numero}</${tags['Numero']}>`
                            xml += `<${tags['CodigoTributacaoMunicipio']}>${object.codigoTributacaoMunicipio}</${tags['CodigoTributacaoMunicipio']}>`

                            xml += `</${tags['consultarUrlVisualizacaoNfse']}>`

                            let isEmptyUri = particularitiesObject['isSigned']['isEmptyUri'] || null
                            let signatureId = particularitiesObject['isSigned']['signatureId'] || null
                            let isDifferentSignature = particularitiesObject['isSigned']['isDifferentSignature'] || null

                            createSignature(xml, cert, tags['Prestador'], signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {
                                    try {
                                        xmlNotSigned = formatXml(xml)
                                        xmlSignature = formatXml(xmlSignature)

                                        xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['consultarUrlVisualizacaoNfse'] ? xmlSignature : xmlNotSigned)

                                        result.soapEnvelop = xml
                                        if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarUrlVisualizacaoNfse']) {
                                            result['soapAction'] = particularitiesObject['soapActions']['consultarUrlVisualizacaoNfse'];
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

                case 'consultarUrlVisualizacaoNfseSerie':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            xml += `<${tags['consultarUrlVisualizacaoNfseSerieAlterada'] ? tags['consultarUrlVisualizacaoNfseSerieAlterada'] : tags['consultarUrlVisualizacaoNfseSerie']}>`;

                            xml += createPrestadorXml(tags, object.prestador)
                            xml += `<${tags['Numero']}>${object.numero}</${tags['Numero']}>`
                            xml += `<${tags['CodigoTributacaoMunicipio']}>${object.codigoTributacaoMunicipio}</${tags['CodigoTributacaoMunicipio']}>`
                            xml += `<${tags['CodigoSerie']}>${object.codigoSerie}</${tags['CodigoSerie']}>`

                            xml += `</${tags['consultarUrlVisualizacaoNfseSerie']}>`

                            let isEmptyUri = particularitiesObject['isSigned']['isEmptyUri'] || null
                            let signatureId = particularitiesObject['isSigned']['signatureId'] || null
                            let isDifferentSignature = particularitiesObject['isSigned']['isDifferentSignature'] || null

                            createSignature(xml, cert, tags['Prestador'], signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {
                                    try {
                                        xmlNotSigned = formatXml(xml)
                                        xmlSignature = formatXml(xmlSignature)

                                        xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['consultarUrlVisualizacaoNfseSerie'] ? xmlSignature : xmlNotSigned)

                                        result.soapEnvelop = xml
                                        if (particularitiesObject['soapActions'] && particularitiesObject['soapActions']['consultarUrlVisualizacaoNfseSerie']) {
                                            result['soapAction'] = particularitiesObject['soapActions']['consultarUrlVisualizacaoNfseSerie'];
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

                case 'enviarLoteRps':
                    try {
                        pem.readPkcs12(pfx, {
                            p12Password: object.config.senhaDoCertificado
                        }, (err, cert) => {
                            if (err) {
                                resolve(err);
                            }

                            xml += `<${tags['enviarLoteRpsAlterada'] ? tags['enviarLoteRpsAlterada'] : tags['enviarLoteRps']}>`;
                            xml += `<${tags['loteRpsAlterada'] ? tags['loteRpsAlterada'] : tags['loteRps']}>`;

                            if (numeroLote) {
                                xml += `<${tags['tcNumeroLoteAlterada'] ? tags['tcNumeroLoteAlterada'] : tags['tcNumeroLote']}>${numeroLote}</${tags['tcNumeroLote']}>`;
                            }
                            xml += createCpfCnpjXml(tags, object.emissor.cpfCnpj)
                            xml += createInscricaoMunicipalXml(tags, object.emissor.inscricaoMunicipal)

                            xml += `<${tags['tcQuantidadeRpsAlterada'] ? tags['tcQuantidadeRpsAlterada'] : tags['tcQuantidadeRps']}>${object.rps.length}</${tags['tcQuantidadeRps']}>`;

                            xml += `<${tags['tcListaRpsAlterada'] ? tags['tcListaRpsAlterada'] : tags['tcListaRps']}>`

                            object.rps.forEach(rps => {
                                xml += generateRpsXml(tags, rps)
                            })

                            xml += `</${tags['tcListaRps']}>`
                            xml += `</${tags['loteRps']}>`;
                            xml += `</${tags['enviarLoteRps']}>`

                            let isEmptyUri = null || particularitiesObject['isSigned']['isEmptyUri']
                            let signatureId = null || particularitiesObject['isSigned']['signatureId']
                            let isDifferentSignature = null || particularitiesObject['isSigned']['isDifferentSignature']

                            createSignature(xml, cert, tags['loteRps'], signatureId, isEmptyUri, isDifferentSignature)
                                .then(xmlSignature => {

                                    try {
                                        xmlNotSigned = formatXml(xml)
                                        xmlSignature = formatXml(xmlSignature)

                                        xml = replaceXml(particularitiesObject, particularitiesObject['isSigned']['enviarLoteRps'] ? xmlSignature : xmlNotSigned)

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
            }
        } catch (error) {
            let result = {
                status: 500,
                message: error
            }
            if (error.errno === -2 || error.errno === -4058) {
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