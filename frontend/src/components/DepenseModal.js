import React, { useState, useEffect } from 'react';
import { depensesService } from '../services/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { XMarkIcon } from '@heroicons/react/24/outline';

function DepenseModal({ navireId, depense, onClose }) {
  const [formData, setFormData] = useState({
    navire_id: navireId,
    type_depense_id: '',
    montant: '',
    date_depense: new Date(),
    description: ''
  });
  const [typesDepenses, setTypesDepenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTypesDepenses();
    if (depense) {
      setFormData({
        navire_id: navireId,
        type_depense_id: depense.type_depense_id,
        montant: depense.montant,
        date_depense: new Date(depense.date_depense),
        description: depense.description || ''
      });
    }
  }, [depense, navireId]);

  const fetchTypesDepenses = async () => {
    try {
      const response = await depensesService.getTypesDepenses();
      setTypesDepenses(response.data);
    } catch (error) {
      console.error('Erreur chargement types dépenses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        ...formData,
        montant: parseFloat(formData.montant),
        date_depense: formData.date_depense.toISOString().split('T')[0]
      };

      if (depense) {
        await depensesService.update(depense.id, data);
        toast.success('Dépense mise à jour avec succès');
      } else {
        await depensesService.create(data);
        toast.success('Dépense ajoutée avec succès');
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
            {depense ? 'Modifier la dépense' : 'Nouvelle dépense'}
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
              Type de dépense *
            </label>
            <select
              required
              value={formData.type_depense_id}
              onChange={(e) => setFormData({ ...formData, type_depense_id: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              <option value="">Sélectionner un type</option>
              {typesDepenses.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nom}
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
              Date de la dépense *
            </label>
            <DatePicker
              selected={formData.date_depense}
              onChange={(date) => setFormData({ ...formData, date_depense: date })}
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

export default DepenseModal;