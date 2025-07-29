import React, { useState, useEffect } from 'react';
import { chargesService } from '../services/api';
import { toast } from 'react-toastify';
import { PencilIcon } from '@heroicons/react/24/outline';
import { getYearOptions, getCurrentYear, getCurrentMonth } from '../utils/yearUtils';

function ChargesFonctionnement() {
  const [chargesParType, setChargesParType] = useState([]);
  const [typesCharges, setTypesCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [editingCharge, setEditingCharge] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chargesRes, typesRes, totalRes] = await Promise.all([
        chargesService.getByType(selectedYear, selectedMonth),
        chargesService.getTypesCharges(),
        chargesService.getTotalByMonth(selectedYear, selectedMonth)
      ]);
      
      setChargesParType(chargesRes.data);
      setTypesCharges(typesRes.data);
      setTotal(totalRes.data.total);
    } catch (error) {
      console.error('Erreur chargement charges:', error);
      toast.error('Erreur lors du chargement des charges');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (typeChargeId, montant, description) => {
    try {
      await chargesService.upsert({
        type_charge_id: typeChargeId,
        montant: parseFloat(montant) || 0,
        mois: selectedMonth,
        annee: selectedYear,
        description: description
      });
      toast.success('Charge enregistrée avec succès');
      setEditingCharge(null);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde charge:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Charges de Fonctionnement
        </h2>

        <div className="flex space-x-4 mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {months.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {getYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de charge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant (FCFA)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chargesParType.map((charge) => {
                const typeCharge = typesCharges.find(t => t.code === charge.code);
                const isEditing = editingCharge === charge.code;
                
                return (
                  <tr key={charge.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {charge.type_charge}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={charge.montant}
                          className="border border-gray-300 rounded-md px-2 py-1 w-32"
                          id={`montant-${charge.code}`}
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {formatCurrency(charge.montant)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={charge.description || ''}
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          id={`description-${charge.code}`}
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {charge.description || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const montant = document.getElementById(`montant-${charge.code}`).value;
                              const description = document.getElementById(`description-${charge.code}`).value;
                              handleSave(typeCharge.id, montant, description);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditingCharge(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingCharge(charge.code)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-bold">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-lg">
                  {formatCurrency(total)}
                </td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Les charges de fonctionnement sont déduites du résultat net des navires 
            pour calculer le résultat global mensuel de l'entreprise.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChargesFonctionnement;