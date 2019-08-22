const nfse = require('../../../');
const enviarLoteRpsCatalao = {
    "config": {
        "database": "cargox_homol",
        "owner": "manifesto",
        "idEmpresa": 1,
        "idPessoa": 1634,
        "diretorioDoCertificado": "/home/ofm/Downloads/pfx/client-catalao2.pfx",
        "senhaDoCertificado": "502874",
        "producaoHomologacao": "homologacao",
        "codigoMunicipio": "5205109",
        "acao": "enviarLoteRps"
    },
    "emissor": {
        "cpfCnpj": "10885840000132",
        "inscricaoMunicipal": "110130"
    },
    "rps": [{
        "numero": 104,
        "idNotaFiscal": 2530,
        "tipo": 1,
        "dataEmissao": "2019-08-14",
        "naturezaOperacao": "1",
        "optanteSimplesNacional": "2",
        "regimeEspecialTributacao": "3",
        "incentivoFiscal": "2",
        "status": "1",
        "serie": "",
        "competencia": "2019-08-14",
        "servico": {
            "aliquota": 0.00,
            "valorIss": 0,
            "valorIr": 0,
            "valorCsll": 0,
            "valorCofins": 0,
            "valorPis": 0,
            "valorInss": 0,
            "valorDeducoes": 0,
            "valorServicos": 100,
            "issRetido": 2,
            "baseCalculo": 100,
            "valorLiquidoNfse": 100,
            "itemListaServico": "17.06",
            "codigoTributacaoMunicipio": "7319001",
            "discriminacao": "TESTE",
            "codigoMunicipio": "5205109",
            "codigoCnae": "6311900",
            "codigoPais": "1058",
            "exigibilidadeIss": "2"
        },
        "prestador": {
            "cpfCnpj": "10885840000132",
            "inscricaoMunicipal": "110130"
        },
        "tomador": {
            "cpfCnpj": "62087309001351",
            "razaoSocial": "TRANSYOKI-TRANSPORTES YOKI LTDA",
            "endereco": {
                "endereco": "AVENIDA IRENE SILVEIRA COSTA",
                "numero": "0",
                "bairro": "LIMEIRA",
                "codigoMunicipio": "3152501",
                "uf": "MG",
                "cep": "37550000",
                "codigoPais": "1058"
            },
            "contato": {
                "telefone": "",
                "email": ""
            }
        }
    }]
};

nfse.nfse(enviarLoteRpsCatalao)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej);
    });