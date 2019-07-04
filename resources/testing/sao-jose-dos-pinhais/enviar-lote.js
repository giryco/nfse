const nfse = require('../../..');
const enviarLoteRpsSaoJoseDosPinhais = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-sao-jose-dos-pinhais.pfx",
        "senhaDoCertificado": "Endpr@20!8",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "4125506",
        "acao": "enviarLoteRps"
    },
    "emissor": {
        "cpfCnpj": "26390085000406",
        "inscricaoMunicipal": "74250"
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
            "itemListaServico": "5211",
            "codigoTributacaoMunicipio": "521170101",
            "discriminacao": "assessoria ou consultoria de qualquer natureza, não especificada",
            "codigoMunicipio": "3304557"
        },
        "prestador": {
            "cpfCnpj": "26390085000406",
            "inscricaoMunicipal": "74250"
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
                "uf": "rj",
                "cep": "20040915"
            },
            "contato": {
                "telefone": "02122422427",
                "email": "robertamartins@mtravel.com.br"
            }
        }
    }]
};

nfse.nfse(enviarLoteRpsSaoJoseDosPinhais)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej);
    });