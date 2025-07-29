import React, { useState, useEffect } from 'react';
import { naviresService } from '../services/api';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

function NavireDetailModal({ navire, onClose }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    nom_client: '',
    nom_produit: '',
    quantite: ''
  });

  useEffect(() => {
    if (navire) {
      loadClients();
    }
  }, [navire]);

  const loadClients = async () => {
    try {
      const response = await naviresService.getClients(navire.id);
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await naviresService.addClient(navire.id, {
        nom_client: newClient.nom_client,
        nom_produit: newClient.nom_produit,
        quantite: parseFloat(newClient.quantite) || 0,
        date_chargement: new Date().toISOString().split('T')[0]
      });
      toast.success('Client ajouté avec succès');
      setNewClient({ nom_client: '', nom_produit: '', quantite: '' });
      setShowAddClient(false);
      loadClients();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout du client');
    }
  };

  const handleRemoveClient = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await naviresService.removeClient(navire.id, clientId);
        toast.success('Client supprimé avec succès');
        loadClients();
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Détails du navire: {navire.nom}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <p className="mt-1 text-sm text-gray-900">{navire.nom}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">N° IMO</label>
              <p className="mt-1 text-sm text-gray-900">{navire.numero_imo || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date d'arrivée</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(navire.date_arrivee).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de départ</label>
              <p className="mt-1 text-sm text-gray-900">
                {navire.date_depart ? new Date(navire.date_depart).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-800">Clients du navire</h4>
              <button
                onClick={() => setShowAddClient(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter client
              </button>
            </div>

            {clients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun client associé à ce navire</p>
            ) : (
              <div className="space-y-3">
                {clients.map((client, index) => (
                  <div key={index} className="border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Client</label>
                          <p className="mt-1 text-sm text-gray-900">{client.client_nom}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Produit</label>
                          <p className="mt-1 text-sm text-gray-900">{client.produit_nom}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantité</label>
                          <p className="mt-1 text-sm text-gray-900">{client.tonnage} tonnes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveClient(client.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAddClient && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h4 className="text-lg font-semibold mb-4">Ajouter un client</h4>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du client</label>
                    <input
                      type="text"
                      required
                      value={newClient.nom_client}
                      onChange={(e) => setNewClient({ ...newClient, nom_client: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                      placeholder="Ex: SONATRACH"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Produit</label>
                    <input
                      type="text"
                      required
                      value={newClient.nom_produit}
                      onChange={(e) => setNewClient({ ...newClient, nom_produit: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                      placeholder="Ex: Pétrole brut"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantité (tonnes)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newClient.quantite}
                      onChange={(e) => setNewClient({ ...newClient, quantite: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                      placeholder="Ex: 5000"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddClient(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavireDetailModal;