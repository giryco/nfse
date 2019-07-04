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
    "protocolo": "A40219127I20196000000239"
};
nfse.nfse(consultarLoteRpsPortoAlegre)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej);
    });