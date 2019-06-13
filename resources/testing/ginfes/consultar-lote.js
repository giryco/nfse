const nfse = require('../../..');
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

nfse.nfse(consultarLoteRpsGinfesItu);