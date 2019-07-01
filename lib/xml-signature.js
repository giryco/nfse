const SignedXml = require('xml-crypto').SignedXml;

class XmlSignatureController {
    constructor() {
     }

    addSignatureToXml (xml, certificate, tagBeforeSignature, signatureId = null, isEmptyUri = null, isDifferentSignature = false) {
        return new Promise ((resolve, reject) => {
            try {
                let x509 = certificate.cert.replace(/\n/g, '');
                x509 = x509.replace(/-----END CERTIFICATE-----/g, '');
                x509 = x509.split('-----BEGIN CERTIFICATE-----')[1];
                const sig = new SignedXml();
                sig.keyInfoProvider = new myKeyInfo(x509);
                if (isDifferentSignature) {
                    sig.addReference("//*[local-name(.)='" + tagBeforeSignature + "']", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'], null, null, null, null, isEmptyUri);
                    sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
                } else {
                    sig.addReference("//*[local-name(.)='" + tagBeforeSignature + "']", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", 'http://www.w3.org/2001/10/xml-exc-c14n#'], null, null, null, null, isEmptyUri);
                    sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
                }
                sig.signingKey = certificate;
                if (signatureId) {
                    sig.computeSignature(xml, {
                        existingPrefixes: {
                            ns4: 'http://www.ginfes.com.br/tipos_v03.xsd',
                            ns3: 'http://www.ginfes.com.br/servico_consultar_nfse_rps_envio_v03.xsd',
                            ns4: 'http://nfe.sjp.pr.gov.br/tipos_v03.xsd',
                            ns3: 'http://nfe.sjp.pr.gov.br/servico_enviar_lote_rps_envio_v03.xsd'
                        },
                        attrs: {
                            Id: signatureId
                        }
                    });
                }else {
                    sig.computeSignature(xml, {
                        existingPrefixes: {
                            ns4: 'http://www.ginfes.com.br/tipos_v03.xsd',
                            ns3: 'http://www.ginfes.com.br/servico_consultar_nfse_rps_envio_v03.xsd',
                            ns4: 'http://nfe.sjp.pr.gov.br/tipos_v03.xsd',
                            ns3: 'http://nfe.sjp.pr.gov.br/servico_enviar_lote_rps_envio_v03.xsd'
                        }
                    });
                }

                resolve(sig.getSignedXml());
            } catch (error) {
                reject(error);
            }    
        })
    }
}

module.exports = XmlSignatureController;

function myKeyInfo(x509Certificate){
    this.getKeyInfo = function(key) {
            return '<X509Data><X509Certificate>'+x509Certificate+'</X509Certificate></X509Data>';
    };
    this.getKey = function(keyInfo) {
            // return the public key in pem format
            return getPublicKeyPemFromCertificate(x509Certificate).toString();
   };
}