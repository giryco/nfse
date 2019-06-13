const nfse = require('../../../');
const cancelarNfseNotaCarioca = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-catalao2.pfx",
        "senhaDoCertificado": "502874",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "5205109",
        "acao": "cancelarNfse"
	},
	"prestador": {
		"cpfCnpj": "10885840000132",
        "inscricaoMunicipal": "110130"
	},
	"numeroNfse": 417
};
nfse.nfse(cancelarNfseNotaCarioca);