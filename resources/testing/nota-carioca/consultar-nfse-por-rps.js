const nfse = require('../../..');

const consultarNfseRps = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-rio-de-janeiro.pfx",
        "senhaDoCertificado": "12345678",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3304557",
        "acao": "consultarNfsePorRps"
    },
    "rps": {
        "numero": "58076515619",
        "serie": "RPS",
        "tipo": "1"
    },
    "prestador": {
        "cpfCnpj": "10393366000121",
        "inscricaoMunicipal": "04386965"
    }
};

nfse.nfse(consultarNfseRps)
    .then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    });