const nfse = require('../../..');
const enviarLoteRpsPortoAlegre = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-porto-alegre.pfx",
        "senhaDoCertificado": "EndRS@20!9",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "4314902",
        "acao": "enviarLoteRps"
    },
    "emissor": {
        "cpfCnpj": "26390085000317",
        "inscricaoMunicipal": "28770820"
    },
    "rps": [{
        "tipo": 1,
        "dataEmissao": "2019-03-19T09:17:00",
        "naturezaOperacao": "1",
        "optanteSimplesNacional": "2",
        "incentivadorCultural": "2",
        "status": "1",
        "servico": {
            "valorServicos": 105.00,
            "valorDeducoes": 0.00,
            "valorPis": 0.00,
            "valorCofins": 0.00,
            "valorInss": 0.00,
            "valorIr": 0.00,
            "valorCsll": 0.00,
            "issRetido": 2,
            "valorIss": 2.10,
            "baseCalculo": 105.00,
            "aliquota": 0.0200,
            "valorLiquidoNfse": 105.00,
            "itemListaServico": "11.04",
            "codigoTributacaoMunicipio": "110400100",
            "discriminacao": "Carga, descarga e arrumação de bens de qualquer espécie",
            "codigoMunicipio": "4314902"
        },
        "prestador": {
            "cpfCnpj": "26390085000317",
            "inscricaoMunicipal": "28770820"
        },
        "tomador": {
            "cpfCnpj": "33423401000103",
            "inscricaoMunicipal": "00475076",
            "razaoSocial": "ABC AGENCIA BRASILEIRA DE COMERCIO E TURISMO LTDA",
            "endereco": {
                "endereco": "RUA DA AJUDA, SAL COB 01",
                "numero": "35",
                "bairro": "centro",
                "codigoMunicipio": "3304557",
                "uf": "RJ",
                "cep": "20040915"
            },
            "contato": {
                "telefone": "02122422427",
                "email": "robertamartins@mtravel.com.br"
            }
        }
    }]
};

nfse.nfse(enviarLoteRpsPortoAlegre)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej);
    });