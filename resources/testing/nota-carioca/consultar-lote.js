const nfse = require('../../../');
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
    "protocolo": "00000000000000000000000000000000000000000002310677"
};
nfse.nfse(consultarLoteRpsNotaCarioca);