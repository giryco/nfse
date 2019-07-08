const nfse = require('../../..');

const consultarNfseRps = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-itu.pfx",
        "senhaDoCertificado": "brmed2018",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "3523909",
        "acao": "consultarNfsePorRps"
    },
    "rps": {
        "numero": "58076515619",
        "serie": "RPS",
        "tipo": "1"
    },
    "prestador": {
        "cpfCnpj": "17845667000198",
        "inscricaoMunicipal": "25099"
    }
};

nfse.nfse(consultarNfseRps)
    .then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    });