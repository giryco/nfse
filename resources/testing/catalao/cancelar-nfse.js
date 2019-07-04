const nfse = require('../../../');
const cancelarNfseCatalao = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-catalao2.pfx",
        "senhaDoCertificado": "502874",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "5205109",
        "acao": "cancelarNfse"
    },
    "prestador": {
        "cpfCnpj": "10885840000132",
        "inscricaoMunicipal": "110130",
        "codigoMunicipio": "5205109"
    },
    "numeroNfse": 145331,
    "codigoCancelamento": 1
};
nfse.nfse(cancelarNfseCatalao)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej);
    });