const nfse = require('../../../');
const consultarLoteRpsPortoAlegre = {
    "config": {
		"diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-porto-alegre.pfx",
        "senhaDoCertificado": "Endpoa@20!8",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "4314902",
        "acao": "consultarLoteRps"
	},
	"prestador": {
		"cpfCnpj": "26390085000317",
        "inscricaoMunicipal": "28770820"
	},
    "protocolo": "AK0219127b2019d000000190"
};
nfse.nfse(consultarLoteRpsPortoAlegre);