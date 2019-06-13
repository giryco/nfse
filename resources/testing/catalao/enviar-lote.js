const nfse = require('../../../');
const enviarLoteRpsCatalao = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-catalao2.pfx",
        "senhaDoCertificado": "502874",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "5205109",
        "acao": "enviarLoteRps"
    },
    "emissor": {
        "cpfCnpj": "10885840000132",
        "inscricaoMunicipal": "110130"
    },
    "rps": [{
        "tipo": 1,
        "dataEmissao": "2019-03-19",
        "naturezaOperacao": "1",
        "optanteSimplesNacional": "2",
        "incentivoFiscal": "2",
        "status": "1",
        "competencia": "2019-03-19",
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
            "aliquota": 0.05,
            "valorLiquidoNfse": 105.00,
            "itemListaServico": "6311",
            "codigoTributacaoMunicipio": "6311900",
            "discriminacao": "Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet.",
            "codigoMunicipio": "5205109",
            "codigoPais": "1058",
            "exigibilidadeIss": "1"
        },
        "prestador": {
            "cpfCnpj": "10885840000132",
            "codigoMunicipio": "5205109",
            "inscricaoMunicipal": "110130"
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

nfse.nfse(enviarLoteRpsCatalao);