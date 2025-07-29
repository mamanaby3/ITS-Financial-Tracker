import React, { useState, useEffect } from 'react';
import { recettesService } from '../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { XMarkIcon } from '@heroicons/react/24/outline';

function RecetteModal({ navireId, recette, onClose }) {
  const [formData, setFormData] = useState({
    navire_id: navireId,
    type_prestation_id: '',
    montant: '',
    date_recette: new Date(),
    description: ''
  });
  const [typesPrestations, setTypesPrestations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTypesPrestations();
    if (recette) {
      setFormData({
        navire_id: navireId,
        type_prestation_id: recette.type_prestation_id,
        montant: recette.montant,
        date_recette: new Date(recette.date_recette),
        description: recette.description || ''
      });
    }
  }, [recette, navireId]);

  const fetchTypesPrestations = async () => {
    try {
      const response = await recettesService.getTypesPrestations();
      setTypesPrestations(response.data);
    } catch (error) {
      console.error('Erreur chargement types prestations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        ...formData,
        montant: parseFloat(formData.montant),
        date_recette: formData.date_recette.toISOString().split('T')[0]
      };

      if (recette) {
        await recettesService.update(recette.id, data);
        toast.success('Recette mise à jour avec succès');
      } else {
        await recettesService.create(data);
        toast.success('Recette ajoutée avec succès');
      }
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
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {recette ? 'Modifier la recette' : 'Nouvelle recette'}
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
              Type de prestation *
            </label>
            <select
              required
              value={formData.type_prestation_id}
              onChange={(e) => setFormData({ ...formData, type_prestation_id: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              <option value="">Sélectionner un type</option>
              {typesPrestations.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nom} ({type.categorie})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Montant (FCFA) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de la recette *
            </label>
            <DatePicker
              selected={formData.date_recette}
              onChange={(date) => setFormData({ ...formData, date_recette: date })}
              dateFormat="dd/MM/yyyy"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
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
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecetteModal;