const nfse = require('../../..');

const consultarNfseRps = {
    "config": {
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-porto-alegre.pfx",
        "senhaDoCertificado": "EndRS@20!9",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "4314902",
        "acao": "consultarNfsePorRps"
    },
    "rps": {
        "numero": "1562261645075",
        "serie": "RPS",
        "tipo": "1"
    },
    "prestador": {
        "cpfCnpj": "26390085000317",
        "inscricaoMunicipal": "28770820"
    }
};

nfse.nfse(consultarNfseRps)
    .then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    });