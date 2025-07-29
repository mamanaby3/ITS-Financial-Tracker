import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

function Parametres() {
  const [parametres, setParametres] = useState({
    nomDeveloppeur: '',
    nomEntreprise: 'International Trading & Services',
    emailEntreprise: 'contact@its.com',
    telephoneEntreprise: '+237 233 123 456',
    siteWeb: 'www.its-cameroun.com',
    adresse: 'Port de Douala, Cameroun',
    version: '1.0.0',
    anneeDebut: 2024
  });

  const [isEditing, setIsEditing] = useState(false);

  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    const savedParams = localStorage.getItem('appParametres');
    if (savedParams) {
      setParametres(JSON.parse(savedParams));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('appParametres', JSON.stringify(parametres));
    setIsEditing(false);
    alert('Paramètres sauvegardés avec succès !');
  };

  const handleChange = (field, value) => {
    setParametres(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Paramètres de l'Application</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations du développeur */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CodeBracketIcon className="w-6 h-6 mr-2 text-blue-600" />
              Informations du Développeur
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Nom du Développeur
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={parametres.nomDeveloppeur}
                    onChange={(e) => handleChange('nomDeveloppeur', e.target.value)}
                    placeholder="Entrez votre nom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {parametres.nomDeveloppeur || 'Non défini'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                  Version de l'Application
                </label>
                <p className="text-gray-900">{parametres.version}</p>
              </div>
            </div>
          </div>

          {/* Informations de l'entreprise */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-600" />
              Informations de l'Entreprise
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'Entreprise
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={parametres.nomEntreprise}
                    onChange={(e) => handleChange('nomEntreprise', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{parametres.nomEntreprise}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={parametres.emailEntreprise}
                    onChange={(e) => handleChange('emailEntreprise', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{parametres.emailEntreprise}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <PhoneIcon className="w-4 h-4 inline mr-1" />
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={parametres.telephoneEntreprise}
                    onChange={(e) => handleChange('telephoneEntreprise', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{parametres.telephoneEntreprise}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                  Site Web
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={parametres.siteWeb}
                    onChange={(e) => handleChange('siteWeb', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{parametres.siteWeb}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                {isEditing ? (
                  <textarea
                    value={parametres.adresse}
                    onChange={(e) => handleChange('adresse', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{parametres.adresse}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section À propos */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">À propos de l'Application</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>ITS Financial Tracker</strong> est une application de gestion financière 
              développée pour International Trading & Services.
            </p>
            <p>
              Cette application permet de suivre les performances économiques mensuelles de l'entreprise,
              incluant la gestion des navires, des recettes, des dépenses et des charges de fonctionnement.
            </p>
            {parametres.nomDeveloppeur && (
              <p className="mt-4 text-sm">
                <strong>Développé par :</strong> {parametres.nomDeveloppeur}
              </p>
            )}
            <p className="text-sm">
              <strong>Année :</strong> {parametres.anneeDebut} - {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Footer avec crédit */}
        {parametres.nomDeveloppeur && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Application développée avec ❤️ par <strong>{parametres.nomDeveloppeur}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              © {new Date().getFullYear()} - Tous droits réservés
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Parametres;