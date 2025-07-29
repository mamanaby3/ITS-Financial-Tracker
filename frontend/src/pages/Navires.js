import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { naviresService } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import NavireModal from '../components/NavireModal';
import { getYearOptions, getCurrentYear } from '../utils/yearUtils';

function Navires() {
  const [navires, setNavires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedNavire, setSelectedNavire] = useState(null);
  const [filterMois, setFilterMois] = useState('');
  const [filterAnnee, setFilterAnnee] = useState(getCurrentYear());

  useEffect(() => {
    fetchNavires();
  }, [filterMois, filterAnnee]);

  const fetchNavires = async () => {
    try {
      setLoading(true);
      let response;
      if (filterMois && filterAnnee) {
        response = await naviresService.getByMonth(filterAnnee, filterMois);
      } else {
        response = await naviresService.getAll();
      }
      setNavires(response.data);
    } catch (error) {
      console.error('Erreur chargement navires:', error);
      toast.error('Erreur lors du chargement des navires');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedNavire(null);
    setShowModal(true);
  };

  const handleEdit = (navire) => {
    setSelectedNavire(navire);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce navire ?')) {
      try {
        await naviresService.delete(id);
        toast.success('Navire supprimé avec succès');
        fetchNavires();
      } catch (error) {
        console.error('Erreur suppression navire:', error);
        toast.error('Erreur lors de la suppression du navire');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedNavire(null);
    fetchNavires();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Navires</h2>
          <button
            onClick={handleCreate}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau Navire
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <select
            value={filterMois}
            onChange={(e) => setFilterMois(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Tous les mois</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
              </option>
            ))}
          </select>
          
          <select
            value={filterAnnee}
            onChange={(e) => setFilterAnnee(e.target.value)}
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
                  Navire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Arrivée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Départ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {navires.map((navire) => (
                <tr key={navire.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{navire.nom}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{navire.clients_noms || navire.client_nom || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{navire.produits_noms || navire.produit_nom || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(navire.date_arrivee), 'dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {navire.date_depart ? format(new Date(navire.date_depart), 'dd/MM/yyyy') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      navire.statut === 'en_cours' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {navire.statut === 'en_cours' ? 'En cours' : 'Terminé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/navires/${navire.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleEdit(navire)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(navire.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {navires.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun navire trouvé
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NavireModal
          navire={selectedNavire}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default Navires;