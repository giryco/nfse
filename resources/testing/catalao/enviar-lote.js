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
            "aliquota": 2,
            "valorLiquidoNfse": 105.00,
            "itemListaServico": "1.01",
            "codigoTributacaoMunicipio": "010101",
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
            "cpfCnpj": "00712712000214",
            "razaoSocial": "2M EMPRESA DE TURISMO LTDA",
            "endereco": {
                "endereco": "RUA VISC DE PIRAJA",
                "numero": "437",
                "bairro": "ipanema",
                "codigoMunicipio": "3304557",
                "uf": "rj",
                "cep": "22410003"
            },
            "contato": {
                "telefone": "2125210734",
                "email": "dekolerj@gmail.com"
            }
        }
    }, {
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
            "aliquota": 2,
            "valorLiquidoNfse": 105.00,
            "itemListaServico": "1.01",
            "codigoTributacaoMunicipio": "010101",
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
            "cpfCnpj": "00712712000214",
            "razaoSocial": "TESTE 1",
            "endereco": {
                "endereco": "RUA VISC DE PIRAJA",
                "numero": "437",
                "bairro": "ipanema",
                "codigoMunicipio": "3304557",
                "uf": "rj",
                "cep": "22410003"
            },
            "contato": {
                "telefone": "2125210734",
                "email": "dekolerj@gmail.com"
            }
        }
    }, {
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
            "aliquota": 2,
            "valorLiquidoNfse": 105.00,
            "itemListaServico": "1.01",
            "codigoTributacaoMunicipio": "010101",
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
            "cpfCnpj": "00712712000214",
            "razaoSocial": "TESTE 2",
            "endereco": {
                "endereco": "RUA VISC DE PIRAJA",
                "numero": "437",
                "bairro": "ipanema",
                "codigoMunicipio": "3304557",
                "uf": "rj",
                "cep": "22410003"
            },
            "contato": {
                "telefone": "2125210734",
                "email": "dekolerj@gmail.com"
            }
        }
    }]
};

nfse.nfse(enviarLoteRpsCatalao);