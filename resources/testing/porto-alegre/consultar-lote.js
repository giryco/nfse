const nfse = require('../../../');
const consultarLoteRpsPortoAlegre = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-porto-alegre.pfx",
        "senhaDoCertificado": "EndRS@20!9",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "4314902",
        "acao": "consultarLoteRps"
    },
    "prestador": {
        "cpfCnpj": "26390085000317",
        "inscricaoMunicipal": "28770820"
    },
    "protocolo": "AV0219127d2019t000000438"
};
nfse.nfse(consultarLoteRpsPortoAlegre)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej);
    });