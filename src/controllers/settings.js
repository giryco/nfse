// Models
const abrasf100Model = require('../models/abrasf-1.00');
const abrasf201Model = require('../models/abrasf-2.01');

// Global constants
const particularitiesObject = {
    isSigned: {}
};

const setParticularities = (object, city) => {
    switch (city.nfseKeyword) {
        case 'ginfes':
            try {
                object.config.producaoHomologacao === 'producao' ? particularitiesObject['webserviceUrl'] = 'https://producao.ginfes.com.br/ServiceGinfesImpl?wsdl' : particularitiesObject['webserviceUrl'] = 'https://homologacao.ginfes.com.br/ServiceGinfesImpl?wsdl';
                object.config.producaoHomologacao === 'producao' ? particularitiesObject['urlXmlns'] = 'http://producao.ginfes.com.br' : particularitiesObject['urlXmlns'] = 'http://homologacao.ginfes.com.br';
                particularitiesObject['nfseKeyword'] = 'ginfes';

                if (object.config.acao === 'enviarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;                    
                    addPrefixesAsync(['EnviarLoteRpsEnvio', 'LoteRps'], 'ns3:');
                    doNotAddPrefixesAsync(['EnviarLoteRpsEnvio', 'LoteRps'], 'ns4:');
                    particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['enviarLoteRpsEnvio']} xmlns:ns3="http://www.ginfes.com.br/servico_enviar_lote_rps_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd"`;
                    particularitiesObject['tags']['loteRpsAlterada'] = `${particularitiesObject['tags']['loteRps']} Id="_uniqueValue"`;
                    particularitiesObject['tags']['infRpsAlterada'] = `${particularitiesObject['tags']['infRps']} Id="_uniqueValue"`;
                    particularitiesObject['envelopment'] = '<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"><soap:Body><ns1:RecepcionarLoteRpsV3 xmlns:ns1=\"http://homologacao.ginfes.com.br\"><arg0><ns2:cabecalho versao=\"3\" xmlns:ns2=\"http://www.ginfes.com.br/cabecalho_v03.xsd\"><versaoDados>3</versaoDados></ns2:cabecalho></arg0><arg1>__xml__</arg1></ns1:RecepcionarLoteRpsV3></soap:Body></soap:Envelope>';
                }

                if (object.config.acao === 'consultarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    addPrefixesAsync(['ConsultarLoteRpsEnvio', 'Prestador', 'Protocolo'], 'ns3:');
                    doNotAddPrefixesAsync(['ConsultarLoteRpsEnvio', 'Prestador', 'Protocolo'], 'ns4:');
                    particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['consultarLoteRpsEnvio']}  xmlns:ns3="http://www.ginfes.com.br/servico_consultar_lote_rps_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd"`;
                    particularitiesObject['envelopment'] = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns1:ConsultarLoteRpsV3 xmlns:ns1="' + particularitiesObject['urlXmlns'] + '"><arg0><ns2:cabecalho versao="3" xmlns:ns2="http://www.ginfes.com.br/cabecalho_v03.xsd"><versaoDados>3</versaoDados></ns2:cabecalho></arg0><arg1>__xml__</arg1></ns1:ConsultarLoteRpsV3></soap:Body></soap:Envelope>';
                    particularitiesObject['isSigned']['consultarLoteRps'] = true;
                }

                if (object.config.acao === 'cancelarNfse') {
                    particularitiesObject['tags'] = abrasf201Model.abrasf201;
                    addPrefixesAsync(['CancelarNfseEnvio', 'Prestador', 'NumeroNfse'], 'ns3:');
                    doNotAddPrefixesAsync(['CancelarNfseEnvio', 'Prestador', 'NumeroNfse'], 'ns4:');
                    particularitiesObject['tags']['cancelarNfseEnvioAlterada'] = `${particularitiesObject['tags']['cancelarNfseEnvio']} xmlns:ns3="http://www.ginfes.com.br/servico_cancelar_nfse_envio" xmlns:ns4="http://www.ginfes.com.br/tipos"`;
                    particularitiesObject['envelopment'] = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header/><soap:Body><ns1:CancelarNfse xmlns:ns1="${particularitiesObject['urlXmlns']}"><arg0>__xml__</arg0></ns1:CancelarNfse></soap:Body></soap:Envelope>`;
                    particularitiesObject['isSigned']['cancelarNfse'] = true;
                }

                particularitiesObject['xsds'] = {
                    enviarLoteRps: '/../../../resources/xsd/ginfes/servico_enviar_lote_rps_envio_v03.xsd',
                    consultarLoteRps: '/../../../resources/xsd/ginfes/servico_consultar_lote_rps_envio_v03.xsd'
                }
            } catch (error) {
                console.error(error);
            }
            break;

        case 'saojosedospinhais':
            try {
                object.config.producaoHomologacao === 'producao' ? particularitiesObject['webserviceUrl'] = 'https://nfe.sjp.pr.gov.br/servicos/issOnline2/ws/index.php?wsdl' : particularitiesObject['webserviceUrl'] = 'https://nfe.sjp.pr.gov.br/servicos/issOnline2/homologacao/ws/index.php?wsdl';
                particularitiesObject['nfseKeyword'] = 'saojosedospinhais';

                if (object.config.acao === 'enviarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;                    
                    // addPrefixesAsync(['EnviarLoteRpsEnvio', 'LoteRps'], 'ns3:');
                    // doNotAddPrefixesAsync(['EnviarLoteRpsEnvio', 'LoteRps'], 'ns4:');
                    particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['enviarLoteRpsEnvio']} xmlns="http://nfe.sjp.pr.gov.br/servico_enviar_lote_rps_envio_v03.xsd"`;
                    particularitiesObject['tags']['loteRpsAlterada'] = `${particularitiesObject['tags']['loteRps']} Id="_uniqueValue"`;
                    particularitiesObject['tags']['numeroLoteAlterada'] = `${particularitiesObject['tags']['numeroLote']} xmlns="http://nfe.sjp.pr.gov.br/tipos_v03.xsd"`;
                    particularitiesObject['tags']['cnpjAlterada'] = `${particularitiesObject['tags']['cnpj']} xmlns="http://nfe.sjp.pr.gov.br/tipos_v03.xsd"`;
                    particularitiesObject['tags']['inscricaoMunicipalAlterada'] = `${particularitiesObject['tags']['inscricaoMunicipal']} xmlns="http://nfe.sjp.pr.gov.br/tipos_v03.xsd"`;
                    particularitiesObject['tags']['quantidadeRpsAlterada'] = `${particularitiesObject['tags']['quantidadeRps']} xmlns="http://nfe.sjp.pr.gov.br/tipos_v03.xsd"`;
                    particularitiesObject['tags']['listaRpsAlterada'] = `${particularitiesObject['tags']['listaRps']} xmlns="http://nfe.sjp.pr.gov.br/tipos_v03.xsd"`;
                    particularitiesObject['tags']['infRpsAlterada'] = `${particularitiesObject['tags']['infRps']} Id="_uniqueValue"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://nfe.sjp.pr.gov.br"><soapenv:Header/><soapenv:Body><ns1:RecepcionarLoteRpsV3><arg0><![CDATA[<ns2:cabecalho xmlns:ns2="http://nfe.sjp.pr.gov.br/cabecalho_v03.xsd" versao="3"><versaoDados>3</versaoDados></ns2:cabecalho>]]></arg0><arg1><![CDATA[__xml__]]></arg1></ns1:RecepcionarLoteRpsV3></soapenv:Body></soapenv:Envelope>';
                    // particularitiesObject['isSigned']['infRps'] = true;
                }

                if (object.config.acao === 'consultarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    addPrefixesAsync(['ConsultarLoteRpsEnvio', 'Prestador', 'Protocolo'], 'ns3:');
                    doNotAddPrefixesAsync(['ConsultarLoteRpsEnvio', 'Prestador', 'Protocolo'], 'ns4:');
                    particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['consultarLoteRpsEnvio']}  xmlns:ns3="http://www.ginfes.com.br/servico_consultar_lote_rps_envio_v03.xsd" xmlns:ns4="http://www.ginfes.com.br/tipos_v03.xsd"`;
                    particularitiesObject['envelopment'] = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns1:ConsultarLoteRpsV3 xmlns:ns1="' + particularitiesObject['urlXmlns'] + '"><arg0><ns2:cabecalho versao="3" xmlns:ns2="http://www.ginfes.com.br/cabecalho_v03.xsd"><versaoDados>3</versaoDados></ns2:cabecalho></arg0><arg1>__xml__</arg1></ns1:ConsultarLoteRpsV3></soap:Body></soap:Envelope>';
                    particularitiesObject['isSigned']['consultarLoteRps'] = true;
                }

                if (object.config.acao === 'cancelarNfse') {
                    particularitiesObject['tags'] = abrasf201Model.abrasf201;
                    addPrefixesAsync(['CancelarNfseEnvio', 'Prestador', 'NumeroNfse'], 'ns3:');
                    doNotAddPrefixesAsync(['CancelarNfseEnvio', 'Prestador', 'NumeroNfse'], 'ns4:');
                    particularitiesObject['tags']['cancelarNfseEnvioAlterada'] = `${particularitiesObject['tags']['cancelarNfseEnvio']} xmlns:ns3="http://www.ginfes.com.br/servico_cancelar_nfse_envio" xmlns:ns4="http://www.ginfes.com.br/tipos"`;
                    particularitiesObject['envelopment'] = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Header/><soap:Body><ns1:CancelarNfse xmlns:ns1="${particularitiesObject['urlXmlns']}"><arg0>__xml__</arg0></ns1:CancelarNfse></soap:Body></soap:Envelope>`;
                    particularitiesObject['isSigned']['cancelarNfse'] = true;
                }

                particularitiesObject['xsds'] = {
                    enviarLoteRps: '/../../../resources/xsd/sao-jose-dos-pinhais/servico_enviar_lote_rps_envio_v03.xsd',
                    consultarLoteRps: '/../../../resources/xsd/sao-jose-dos-pinhais/servico_consultar_lote_rps_envio_v03.xsd'
                }
            } catch (error) {
                console.error(error);
            }
            break;

        case 'riodejaneiro':
            try {
                object.config.producaoHomologacao === 'producao' ? particularitiesObject['webserviceUrl'] = 'https://notacarioca.rio.gov.br/WSNacional/nfse.asmx?wsdl' : particularitiesObject['webserviceUrl'] = 'https://homologacao.notacarioca.rio.gov.br/WSNacional/nfse.asmx?wsdl';
                particularitiesObject['nfseKeyword'] = 'riodejaneiro';
                if (object.config.acao === 'enviarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['enviarLoteRpsEnvio']} xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd"`;
                    particularitiesObject['tags']['loteRpsAlterada'] = `${particularitiesObject['tags']['loteRps']} Id="_uniqueValue"`;
                    particularitiesObject['tags']['infRpsAlterada'] = `${particularitiesObject['tags']['infRps']} xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd" Id="_uniqueValue"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:not=\"http://notacarioca.rio.gov.br/\"><soapenv:Header/><soapenv:Body><not:RecepcionarLoteRpsRequest><not:inputXML><![CDATA[__xml__]]></not:inputXML></not:RecepcionarLoteRpsRequest></soapenv:Body></soapenv:Envelope>';
                }
                if (object.config.acao === 'consultarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['consultarLoteRpsEnvio']} xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:not="http://notacarioca.rio.gov.br/"><soapenv:Header/><soapenv:Body><not:ConsultarLoteRpsRequest><not:inputXML><![CDATA[__xml__]]></not:inputXML></not:ConsultarLoteRpsRequest></soapenv:Body></soapenv:Envelope>';
                }
                if (object.config.acao === 'cancelarNfse') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    particularitiesObject['tags']['cancelarNfseEnvioAlterada'] = `${particularitiesObject['tags']['cancelarNfseEnvio']} xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd"`;
                    particularitiesObject['tags']['pedidoAlterada'] = `${particularitiesObject['tags']['pedido']} xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse.xsd"`;
                    particularitiesObject['tags']['infPedidoCancelamentoAlterada'] = `${particularitiesObject['tags']['infPedidoCancelamento']} Id="_uniqueValue"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:not="http://notacarioca.rio.gov.br/"><soapenv:Header/><soapenv:Body><not:CancelarNfseRequest><not:inputXML><![CDATA[__xml__]]></not:inputXML></not:CancelarNfseRequest></soapenv:Body></soapenv:Envelope>';
                }
                particularitiesObject['xsds'] = {
                    enviarLoteRps: '/../../../resources/xsd/rio-de-janeiro/tipos_nfse_v01.xsd',
                    consultarLoteRps: '/../../../resources/xsd/rio-de-janeiro/tipos_nfse_v01.xsd'
                }
                particularitiesObject['soapActions'] = {
                    enviarLoteRps: 'http://notacarioca.rio.gov.br/RecepcionarLoteRps',
                    consultarLoteRps: 'http://notacarioca.rio.gov.br/ConsultarLoteRps',
                    cancelarNfse: 'http://notacarioca.rio.gov.br/CancelarNfse'
                }
            } catch (error) {
                console.error(error);
            }
            break;

        case 'portoalegre':
            try {
                object.config.producaoHomologacao === 'producao' ? particularitiesObject['webserviceUrl'] = 'https://nfe.portoalegre.rs.gov.br/bhiss-ws/nfse?wsdl' : particularitiesObject['webserviceUrl'] = 'https://nfse-hom.procempa.com.br/bhiss-ws/nfse?wsdl';
                particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:not=\"http://ws.bhiss.pbh.gov.br\"><soapenv:Header/><soapenv:Body><not:RecepcionarLoteRpsRequest><nfseCabecMsg><![CDATA[<cabecalho xmlns=\"http://www.abrasf.org.br/nfse.xsd\" versao=\"1.00\"><versaoDados>1.00</versaoDados></cabecalho>]]></nfseCabecMsg><nfseDadosMsg><![CDATA[__xml__]]></nfseDadosMsg></not:RecepcionarLoteRpsRequest></soapenv:Body></soapenv:Envelope>';
                particularitiesObject['nfseKeyword'] = 'portoalegre';
                if (object.config.acao === 'enviarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['enviarLoteRpsEnvio']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['tags']['loteRpsAlterada'] = `${particularitiesObject['tags']['loteRps']} Id="_uniqueValue" versao="1.00"`;
                    particularitiesObject['tags']['infRpsAlterada'] = `${particularitiesObject['tags']['infRps']} xmlns="http://www.abrasf.org.br/nfse.xsd" Id="_uniqueValue"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:not="http://ws.bhiss.pbh.gov.br"><soapenv:Header/><soapenv:Body><not:RecepcionarLoteRpsRequest><nfseCabecMsg><![CDATA[<cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="1.00"><versaoDados>1.00</versaoDados></cabecalho>]]></nfseCabecMsg><nfseDadosMsg><![CDATA[__xml__]]></nfseDadosMsg></not:RecepcionarLoteRpsRequest></soapenv:Body></soapenv:Envelope>';
                    particularitiesObject['isSigned']['infRps'] = true;
                }
                if (object.config.acao === 'consultarLoteRps') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['consultarLoteRpsEnvio']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:not="http://ws.bhiss.pbh.gov.br"><soapenv:Header/><soapenv:Body><not:ConsultarLoteRpsRequest><nfseCabecMsg><![CDATA[<cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="1.00"><versaoDados>1.00</versaoDados></cabecalho>]]></nfseCabecMsg><nfseDadosMsg><![CDATA[__xml__]]></nfseDadosMsg></not:ConsultarLoteRpsRequest></soapenv:Body></soapenv:Envelope>';
                }
                if (object.config.acao === 'cancelarNfse') {
                    particularitiesObject['tags'] = abrasf100Model.abrasf100;
                    particularitiesObject['tags']['cancelarNfseEnvioAlterada'] = `${particularitiesObject['tags']['cancelarNfseEnvio']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['tags']['pedidoAlterada'] = `${particularitiesObject['tags']['pedido']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['tags']['infPedidoCancelamentoAlterada'] = `${particularitiesObject['tags']['infPedidoCancelamento']} Id="Cancela__uniqueValue"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:not="http://ws.bhiss.pbh.gov.br"><soapenv:Header/><soapenv:Body><not:CancelarNfseRequest><nfseCabecMsg><![CDATA[<cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="1.00"><versaoDados>1.00</versaoDados></cabecalho>]]></nfseCabecMsg><nfseDadosMsg><![CDATA[__xml__]]></nfseDadosMsg></not:CancelarNfseRequest></soapenv:Body></soapenv:Envelope>';
                    particularitiesObject['isSigned']['cancelarNfse'] = true;
                    particularitiesObject['isSigned']['isEmptyUri'] = true;
                }
                particularitiesObject['xsds'] = {
                    enviarLoteRps: '/../../../resources/xsd/porto-alegre/nfse_v20_08_2015.xsd',
                    consultarLoteRps: '/../../../resources/xsd/porto-alegre/nfse_v20_08_2015.xsd'
                }
                particularitiesObject['soapActions'] = {
                    enviarLoteRps: 'http://ws.bhiss.pbh.gov.br/RecepcionarLoteRps',
                    consultarLoteRps: 'http://ws.bhiss.pbh.gov.br/ConsultarLoteRps',
                    cancelarNfse: 'http://ws.bhiss.pbh.gov.br/CancelarNfse'
                }
            } catch (error) {
                console.error(error);
            }
            break;

        case 'catalao':
            try {
                object.config.producaoHomologacao === 'producao' ? particularitiesObject['webserviceUrl'] = 'http://200.23.238.210/prodataws/services/NfseWSService?wsdl' : particularitiesObject['webserviceUrl'] = 'http://200.23.238.210:8585/prodataws/services/NfseWSService?wsdl';
                particularitiesObject['nfseKeyword'] = 'catalao';
                if (object.config.acao === 'enviarLoteRps') {
                    particularitiesObject['tags'] = abrasf201Model.abrasf201;
                    particularitiesObject['tags']['enviarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['enviarLoteRpsEnvio']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['tags']['loteRpsAlterada'] = `${particularitiesObject['tags']['loteRps']} Id="_uniqueValue" versao="2.01"`;
                    particularitiesObject['tags']['infDeclaracaoPrestacaoServicoAlterada'] = `${particularitiesObject['tags']['infDeclaracaoPrestacaoServico']} xmlns="http://www.abrasf.org.br/nfse.xsd" Id="_uniqueValue"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ser=\"http://services.nfse\"><soapenv:Header/><soapenv:Body><ser:RecepcionarLoteRpsRequest><nfseCabecMsg><![CDATA[<cabecalho xmlns=\"http://www.abrasf.org.br/nfse.xsd\" versao=\"2.01\"><versaoDados>1.00</versaoDados></cabecalho>]]></nfseCabecMsg><nfseDadosMsg><![CDATA[__xml__]]></nfseDadosMsg></ser:RecepcionarLoteRpsRequest></soapenv:Body></soapenv:Envelope>';
                }
                if (object.config.acao === 'consultarLoteRps') {
                    particularitiesObject['tags'] = abrasf201Model.abrasf201;
                    particularitiesObject['tags']['consultarLoteRpsEnvioAlterada'] = `${particularitiesObject['tags']['consultarLoteRpsEnvio']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.nfse"><soapenv:Header/><soapenv:Body><ser:ConsultarLoteRpsRequest><nfseCabecMsg><![CDATA[<cabecalho xmlns=\"http://www.abrasf.org.br/nfse.xsd\" versao=\"2.01\"><versaoDados>1.00</versaoDados></cabecalho>]]></nfseCabecMsg><nfseDadosMsg><![CDATA[__xml__]]></nfseDadosMsg></ser:ConsultarLoteRpsRequest></soapenv:Body></soapenv:Envelope>';
                }
                if (object.config.acao === 'cancelarNfse') {
                    particularitiesObject['tags'] = abrasf201Model.abrasf201;
                    particularitiesObject['tags']['cancelarNfseEnvioAlterada'] = `${particularitiesObject['tags']['cancelarNfseEnvio']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['tags']['pedidoAlterada'] = `${particularitiesObject['tags']['pedido']} xmlns="http://www.abrasf.org.br/nfse.xsd"`;
                    particularitiesObject['tags']['infPedidoCancelamentoAlterada'] = `${particularitiesObject['tags']['infPedidoCancelamento']}`;
                    particularitiesObject['envelopment'] = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.nfse"><soapenv:Header/><soapenv:Body><ser:CancelarNfseRequest><nfseCabecMsg><![CDATA[<cabecalho xmlns=\"http://www.abrasf.org.br/nfse.xsd\" versao=\"2.01\"><versaoDados>1.00</versaoDados></cabecalho>]]></nfseCabecMsg><nfseDadosMsg><![CDATA[__xml__]]></nfseDadosMsg></ser:CancelarNfseRequest></soapenv:Body></soapenv:Envelope>';
                }

                particularitiesObject['xsds'] = {
                    enviarLoteRps: '/../../../resources/xsd/catalao/nfse_v2_01.xsd',
                    consultarLoteRps: '/../../../resources/xsd/catalao/nfse_v2_01.xsd',
                    cancelarLoteRps: '/../../../resources/xsd/catalao/nfse_v2_01.xsd'
                }
            } catch (error) {
                console.error(error);
            }
            break;

        default:
            console.error();
            break;
    }

    return particularitiesObject;
}

const addPrefixes = (tagsArray, prefix) => {
    for (const key in particularitiesObject['tags']) {
        if (particularitiesObject['tags'].hasOwnProperty(key)) {
            const tag = particularitiesObject['tags'][key];

            tagsArray.forEach(tagToCompare => {
                if (tag === tagToCompare) {
                    console.lo
                    particularitiesObject['tags'][key] = prefix + tag;
                }
            });
        }
    }

    return tagsArray;
}

const doNotAddPrefixes = (tagsArray, prefix) => {
    for (const key in particularitiesObject['tags']) {
        if (particularitiesObject['tags'].hasOwnProperty(key)) {
            const tag = particularitiesObject['tags'][key];
            let checkTag = '';
            let checkTagToCompare = 0;

            tagsArray.forEach(tagToCompare => {
                (tag.split(':').length > 1) ? checkTag = tag.split(':')[1]: checkTag = tag;
                if (checkTag != tagToCompare) {
                    checkTagToCompare++;
                }
            });

            if (checkTagToCompare === tagsArray.length) {
                particularitiesObject['tags'][key] = prefix + tag;
            }
        }
    }

    return tagsArray;
}

const addPrefixesAsync = (tagsArray, prefix) => {
    return addPrefixes(tagsArray, prefix);
}

const doNotAddPrefixesAsync = (tagsArray, prefix) => {
    return doNotAddPrefixes(tagsArray, prefix);
}

module.exports = {
    setParticularities
}