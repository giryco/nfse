const nfse = require('../../..');

const enviarLoteRpsGinfesItu = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-itu.pfx",
        "senhaDoCertificado": "brmed2018",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3523909",
        "acao": "enviarLoteRps"
    },
    "emissor": {
        "cpfCnpj": "17845667000198",
        "inscricaoMunicipal": "25099"
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
            "itemListaServico": "1009",
            "codigoTributacaoMunicipio": "461840200",
            "discriminacao": "Ref. Servico Conforme O.S. Foi feito ajustes nas configuracoes do SITEF.;Foi feito a instalacao do PINPAD.;Foi feito testes de venda com cartao.",
            "codigoMunicipio": "3523909"
        },
        "prestador": {
            "cpfCnpj": "17845667000198",
            "inscricaoMunicipal": "25099",
            "codigoMunicipio": "3523909"
        },
        "tomador": {
            "cpfCnpj": "70523431000118",
            "inscricaoMunicipal": "0743140200169",
            "razaoSocial": "ALANA E JOSEFA CONSTRUCOES LTDA",
            "endereco": {
                "endereco": "Rua Manuel de Autoguia",
                "numero": "791",
                "bairro": "TATUAPE",
                "codigoMunicipio": "3550308",
                "uf": "SP",
                "cep": "33130208"
            },
            "contato": {
                "telefone": "8232211212",
                "email": "analu-melo@hotmail.com"
            }
        }
    }]
};

nfse.nfse(enviarLoteRpsGinfesItu);