const nfse = require('../../..');

const consultarNfseRps = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-catalao2.pfx",
        "senhaDoCertificado": "502874",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "5205109",
        "acao": "consultarNfsePorRps"
    },
    "rps": {
        "numero": "58076515619",
        "serie": "RPS",
        "tipo": "1"
    },
    "prestador": {
        "cpfCnpj": "10885840000132",
        "inscricaoMunicipal": "110130"
    }
};

nfse.nfse(consultarNfseRps)
    .then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    });