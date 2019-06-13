const nfse = require('../../../');
const cancelarNfseNotaCarioca = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-rio-de-janeiro.pfx",
        "senhaDoCertificado": "12345678",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3304557",
        "acao": "cancelarNfse"
	},
	"prestador": {
		"cpfCnpj": "10393366000121",
        "inscricaoMunicipal": "04386965"
	},
	"numeroNfse": 283
};
nfse.nfse(cancelarNfseNotaCarioca);