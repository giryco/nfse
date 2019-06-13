const nfse = require('./');

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
            "inscricaoMunicipal": "25099"
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

const enviarLoteRpsNotaCarioca = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-rio-de-janeiro.pfx",
        "senhaDoCertificado": "12345678",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3304557",
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

const enviarLoteRpsPortoAlegre = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-porto-alegre.pfx",
        "senhaDoCertificado": "Endpoa@20!8",
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
            "itemListaServico": "1701",
            "codigoTributacaoMunicipio": "17.01.01 ",
            "discriminacao": "assessoria ou consultoria de qualquer natureza, não especificada",
            "codigoMunicipio": "3304557"
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

const consultarLoteRpsGinfesItu = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-itu.pfx",
        "senhaDoCertificado": "brmed2018",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3523909",
        "acao": "consultarLoteRps"
	},
	"prestador": {
		"cpfCnpj": "17845667000198",
        "inscricaoMunicipal": "25099"
	},
    "protocolo": "9522475"
};

const consultarLoteRpsNotaCarioca = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-rio-de-janeiro.pfx",
        "senhaDoCertificado": "12345678",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3304557",
        "acao": "consultarLoteRps"
	},
	"prestador": {
		"cpfCnpj": "10393366000121",
        "inscricaoMunicipal": "04386965"
	},
    "protocolo": "00000000000000000000000000000000000000000002310676"
};

const cancelarNfseGinfesItu = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-itu.pfx",
		"senhaDoCertificado": "brmed2018",
		"producaoHomologacao": "homologacao",
        "codigoMunicipio": "3523909",
        "acao": "cancelarNfse"
	},
	"prestador": {
		"cpfCnpj": "17845667000198",
		"inscricaoMunicipal": "25099",
	},
	"numeroNfse": 417
};

nfse.nfse(enviarLoteRpsGinfesItu);