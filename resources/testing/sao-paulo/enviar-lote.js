const nfse = require('../../..');
const enviarLoteRpsSaoPaulo = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-rio-de-janeiro.pfx",
        "senhaDoCertificado": "12345678",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3550308",
        "acao": "enviarLoteRps"
    },
    "emissor": {
        "cpfCnpj": "10393366000121",
        "inscricaoMunicipal": "04386965"
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
			"aliquota": 0.05,
			"valorLiquidoNfse": 105.00,
			"itemListaServico": "0802",
			"codigoTributacaoMunicipio": "461840200",
			"discriminacao": "Ref. Servico Conforme O.S. Foi feito ajustes nas configuracoes do SITEF.;Foi feito a instalacao do PINPAD.;Foi feito testes de venda com cartao.",
			"codigoMunicipio": "3523909"
        },
        "prestador": {
            "cpfCnpj": "10393366000121",
            "inscricaoMunicipal": "04386965"
        },
        "tomador": {
            "cnpjCpf": "00712712000214",
            "inscricaoMunicipal": "04430182",
            "razaoSocial": "2M EMPRESA DE TURISMO LTDA",
            "endereco": {
                "endereco": "RUA VISC DE PIRAJA",
                "numero": "437",
                "bairro": "ipanema",
                "codigoMunicipio": "3550308",
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

nfse.nfse(enviarLoteRpsSaoPaulo);