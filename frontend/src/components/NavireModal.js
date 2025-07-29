import React, { useState, useEffect } from 'react';
import { naviresService, clientsService, produitsService } from '../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { XMarkIcon } from '@heroicons/react/24/outline';

function NavireModal({ navire, onClose }) {
  const [formData, setFormData] = useState({
    nom: '',
    tonnage_total: '',
    date_arrivee: new Date(),
    date_depart: null,
    statut: 'en_cours'
  });
  const [clientsData, setClientsData] = useState([{
    client_nom: '',
    produit_nom: '',
    quantite: ''
  }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navire) {
      setFormData({
        nom: navire.nom,
        tonnage_total: navire.tonnage_total || '',
        date_arrivee: new Date(navire.date_arrivee),
        date_depart: navire.date_depart ? new Date(navire.date_depart) : null,
        statut: navire.statut
      });
      // Pour la modification, charger les clients existants
      if (navire.id) {
        loadNavireClients(navire.id);
      }
    }
  }, [navire]);

  const loadNavireClients = async (navireId) => {
    try {
      const response = await naviresService.getClients(navireId);
      if (response.data && response.data.length > 0) {
        setClientsData(response.data.map(client => ({
          client_nom: client.client_nom,
          produit_nom: client.produit_nom,
          quantite: client.tonnage
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const addClient = () => {
    setClientsData([...clientsData, {
      client_nom: '',
      produit_nom: '',
      quantite: ''
    }]);
  };

  const removeClient = (index) => {
    const newClients = clientsData.filter((_, i) => i !== index);
    setClientsData(newClients.length > 0 ? newClients : [{
      client_nom: '',
      produit_nom: '',
      quantite: ''
    }]);
  };

  const updateClient = (index, field, value) => {
    const newClients = [...clientsData];
    newClients[index][field] = value;
    setClientsData(newClients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Créer d'abord le navire
      const navireData = {
        nom: formData.nom,
        tonnage_total: formData.tonnage_total,
        date_arrivee: formData.date_arrivee.toISOString().split('T')[0],
        date_depart: formData.date_depart ? formData.date_depart.toISOString().split('T')[0] : null,
        statut: formData.statut
      };
      
      let navireId;
      if (navire) {
        await naviresService.update(navire.id, navireData);
        navireId = navire.id;
      } else {
        const newNavire = await naviresService.create(navireData);
        navireId = newNavire.data.id;
      }
      
      // Ajouter tous les clients
      for (const client of clientsData) {
        if (client.client_nom.trim()) {
          await naviresService.addClient(navireId, {
            nom_client: client.client_nom,
            nom_produit: client.produit_nom,
            quantite: parseFloat(client.quantite) || 0,
            date_chargement: formData.date_arrivee.toISOString().split('T')[0]
          });
        }
      }
      
      toast.success(navire ? 'Navire mis à jour avec succès' : 'Navire créé avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {navire ? 'Modifier le navire' : 'Nouveau navire'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom du navire *
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tonnage total
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.tonnage_total}
              onChange={(e) => setFormData({ ...formData, tonnage_total: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              placeholder="Tonnage en tonnes"
            />
          </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-gray-800">Clients et produits</h4>
                <button
                  type="button"
                  onClick={addClient}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  + Ajouter un client
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {clientsData.map((client, index) => (
                <div key={index} className="border rounded-md p-3 bg-gray-50">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom du client
                      </label>
                      <input
                        type="text"
                        value={client.client_nom}
                        onChange={(e) => updateClient(index, 'client_nom', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                        placeholder="Ex: SONATRACH"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Produit
                      </label>
                      <input
                        type="text"
                        value={client.produit_nom}
                        onChange={(e) => updateClient(index, 'produit_nom', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                        placeholder="Ex: Pétrole brut"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantité (tonnes)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={client.quantite}
                          onChange={(e) => updateClient(index, 'quantite', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                          placeholder="Ex: 5000"
                        />
                        {clientsData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeClient(index)}
                            className="mt-1 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date d'arrivée *
              </label>
              <DatePicker
                selected={formData.date_arrivee}
                onChange={(date) => setFormData({ ...formData, date_arrivee: date })}
                dateFormat="dd/MM/yyyy"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date de départ
              </label>
              <DatePicker
                selected={formData.date_depart}
                onChange={(date) => setFormData({ ...formData, date_depart: date })}
                dateFormat="dd/MM/yyyy"
                isClearable
                placeholderText="Sélectionner une date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              >
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NavireModal;