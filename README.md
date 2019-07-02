#[NFSE](https://github.com/giryco/nfse)
> Geração de nota fiscal de serviço

##Instalação
```
npm install --save nfse@latest
```

##Últimas alterações
- Atendendo os municípios do padrão GINFES (listados no arquivo cities.json - avise-nos se souberem mais atendidos pela ginfes)
- Atendendo Rio de Janeiro
- Atendendo Porto Alegre
- Atendendo Catalão

##Exemplos de utilização para NFS-e
###Enviar lote de RPS
```
const nfse = require('nfse');

const enviarLoteRps = {
	"config": {
		"diretorioDoCertificado": "/atalho/para/certificado.pfx",
		"senhaDoCertificado": "su$S3nh@P4r@0C3Rt1fiC4d0",
		"producaoHomologacao": "homologacao",
		"codigoMunicipio": "3523909",
        "acao": "enviarLoteRps"
    },
    "emissor": {
        "cpfCnpj": "00000000000000",
        "inscricaoMunicipal": "000000"
    },
    "rps": [{
    	"numero": "",
    	"serie": "",
        "tipo": 1,
        "dataEmissao": "2019-03-19T09:17:00",
        "naturezaOperacao": "1",
        "optanteSimplesNacional": "2",
        "incentivadorCultural": "2",
        "incentivoFiscal": "",
        "status": "1",
        "competencia": "",
        "regimeEspecialTributacao": "",
        "servico": {
            "valorServicos": 105.00,
            "valorDeducoes": 0.00,
            "valorPis": 0.00,
            "valorCofins": 0.00,
            "valorInss": 0.00,
            "valorIr": 0.00,
            "valorCsll": 0.00,
            "outrasRetencoes": "",
            "issRetido": 2,
            "valorIss": 2.10,
            "valorIssRetido": "",
            "baseCalculo": 105.00,
            "aliquota": 0.0200,
            "descontoIncondicionado": "",
            "descontoCondicionado": "",
            "responsavelRetencao": "",
            "valorLiquidoNfse": 105.00,
            "itemListaServico": "1009",
            "codigoTributacaoMunicipio": "461840200",
            "codigoCnae": "",
            "discriminacao": "Ref. Servico Conforme O.S. Foi feito ajustes nas configuracoes do SITEF.;Foi feito a instalacao do PINPAD.;Foi feito testes de venda com cartao.",
            "codigoMunicipio": "3523909",
            "codigoPais": "",
            "exigibilidadeIss": "",
            "municipioIncidencia": "",
            "numeroProcesso": ""
        },
        "prestador": {
            "cpfCnpj": "00000000000000",
            "inscricaoMunicipal": "000000",
            "codigoMunicipio": ""
        },
        "tomador": {
            "cpfCnpj": "00000000000000",
            "inscricaoMunicipal": "000000",
            "razaoSocial": "ALANA E JOSEFA CONSTRUCOES LTDA",
            "endereco": {
                "endereco": "Rua Manuel de Autoguia",
                "numero": "791",
                "bairro": "TATUAPE",
                "codigoMunicipio": "3550308",
                "uf": "SP",
                "codigoPais": "",
                "cep": "33130208"
            },
            "contato": {
                "telefone": "00000000000",
                "email": "contato@email.com"
            }
        }
    }]
};

nfse.nfse(enviarLoteRps)
	.then(res => {
		console.log(res);
	}).catch(err => {
		console.log(err)
	});
```

###Consultar lote de RPS
```
const nfse = require('nfse');

const consultarLoteRps = {
    "config": {
		"diretorioDoCertificado": "/atalho/para/certificado.pfx",
		"senhaDoCertificado": "su$S3nh@P4r@0C3Rt1fiC4d0",
		"producaoHomologacao": "homologacao",
		"codigoMunicipio": "3523909",
        "acao": "consultarLoteRps"
	},
	"prestador": {
		"cpfCnpj": "00000000000000",
        "inscricaoMunicipal": "00000"
	},
    "protocolo": "2019104089"
};
nfse.nfse(consultarLoteRps)
	.then(res => {
		console.log(res);
	}).catch(err => {
		console.log(err)
	});
```

###Consultar NFSe por RPS
```
const nfse = require('nfse');

const consultarNfseRps = {
    "config": {
		"diretorioDoCertificado": "/atalho/para/certificado.pfx",
		"senhaDoCertificado": "su$S3nh@P4r@0C3Rt1fiC4d0",
		"producaoHomologacao": "homologacao",
		"codigoMunicipio": "3523909",
        "acao": "consultarNfsePorRps"
	},
	"rps": {
		"numero": "000000000",
        "serie": "RPS",
        "tipo": "1"
	},
	"prestador": {
		"cpfCnpj": "00000000000000",
        "inscricaoMunicipal": "00000"
	}
};
nfse.nfse(consultarNfseRps)
	.then(res => {
		console.log(res);
	}).catch(err => {
		console.log(err)
	});
```

###Cancelar NFSE
```
const nfse = require('nfse');

const cancelarNfse = {
    "config": {
		"diretorioDoCertificado": "/atalho/para/certificado.pfx",
		"senhaDoCertificado": "su$S3nh@P4r@0C3Rt1fiC4d0",
		"producaoHomologacao": "homologacao",
		"codigoMunicipio": "3523909",
        "acao": "cancelarNfse"
	},
	"prestador": {
		"cpfCnpj": "00000000000000",
        "inscricaoMunicipal": "00000",
        "codigoMunicipio": "5205109"
	},
	"numeroNfse": 145331,
    "codigoCancelamento": 1
};
nfse.nfse(cancelarNfse)
	.then(res => {
		console.log(res);
	}).catch(err => {
		console.log(err)
	});
```