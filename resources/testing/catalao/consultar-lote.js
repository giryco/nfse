const nfse = require('../../../');
const consultarLoteRpsCatalao = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-catalao2.pfx",
        "senhaDoCertificado": "502874",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "5205109",
        "acao": "consultarLoteRps"
	},
	"prestador": {
		"cpfCnpj": "10885840000132",
        "inscricaoMunicipal": "110130"
	},
    "protocolo": "00000000000000000000000000000000000000000002310677"
};
nfse.nfse(consultarLoteRpsCatalao);