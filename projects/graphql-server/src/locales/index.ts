import * as i18n from 'i18next';
import en from './lang/en.json';
import es from './lang/es.json';

const resources = {
	en: {
		translation: en,
	},
	es: {
		translation: es,
	},
};

i18n.init({
	resources,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
}).catch(console.error);

export default i18n;
