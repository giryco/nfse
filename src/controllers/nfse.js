//Resources
const cities = require('../../resources/json/cities');
const nfseKeywordModelDictionary = require('../../resources/json/nfse-keyword-model-dictionary');

//Global variables
var object = {};
var city = {};
var model = {};

//Controllers
const abrasf100Controller = require('./xml-creator/abrasf-1.00');
const abrasf201Controller = require('./xml-creator/abrasf-2.01');
const abrasf202Controller = require('./xml-creator/abrasf-2.02');
const abrasf204Controller = require('./xml-creator/abrasf-2.04');
const saopaulo100Controller = require('./xml-creator/sao-paulo-1.00');

const nfse = (newObject) => {
    object = newObject;

    findCityByCodeAsync(object.config.codigoMunicipio);
    findModelByKeywordAsync(city.nfseKeyword);
    setModelToSendAsync(city, model);
}

const findCityByCode = (cityCode) => {
    try {
        for (let i = 0; i < cities.length; i++) {
            const c = cities[i];
            if (c.cityCode && (c.cityCode == cityCode)) {
                city = c;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

const findModelByKeyword = (nfseKeyword) => {
    try {
        for (let i = 0; i < nfseKeywordModelDictionary.length; i++) {
            const m = nfseKeywordModelDictionary[i];

            if (m.nfseKeyword) {
                for (let j = 0; j < m.nfseKeyword.length; j++) {
                    const keyword = m.nfseKeyword[j];

                    if (keyword.name === nfseKeyword) {
                        model = m;
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}


const setModelToSend = (city, model) => {
    if (model.model === 'abrasf1.00') {
        abrasf100Controller.setRequirements(object, city, model);
    }

    if (model.model === 'abrasf2.01') {
        abrasf201Controller.setRequirements(object, city, model);
    }
}


const findCityByCodeAsync = async (cityCode) => {
    await findCityByCode(cityCode);
}

const findModelByKeywordAsync = async (cityCode) => {
    await findModelByKeyword(cityCode);
}

const setModelToSendAsync = async (city, model) => {
    await setModelToSend(city, model);
}

module.exports = {
    nfse
}