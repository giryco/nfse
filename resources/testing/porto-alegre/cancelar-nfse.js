const nfse = require('../../../');
const cancelarNfsePortoAlegre = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-porto-alegre.pfx",
        "senhaDoCertificado": "Endpoa@20!8",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "4314902",
        "acao": "cancelarNfse"
	},
	"prestador": {
		"cpfCnpj": "26390085000317",
        "inscricaoMunicipal": "28770820"
	},
    "numeroNfse": 201900000000011,
    "codigoCancelamento": 2
};
nfse.nfse(cancelarNfsePortoAlegre);