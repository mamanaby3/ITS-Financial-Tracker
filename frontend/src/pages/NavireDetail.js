import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { naviresService, recettesService, depensesService } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import RecetteModal from '../components/RecetteModal';
import DepenseModal from '../components/DepenseModal';

function NavireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [navire, setNavire] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [recettes, setRecettes] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecetteModal, setShowRecetteModal] = useState(false);
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const [selectedRecette, setSelectedRecette] = useState(null);
  const [selectedDepense, setSelectedDepense] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [navireRes, resultatRes, recettesRes, depensesRes] = await Promise.all([
        naviresService.getById(id),
        naviresService.getResultat(id),
        recettesService.getByNavire(id),
        depensesService.getByNavire(id)
      ]);
      
      setNavire(navireRes.data);
      setResultat(resultatRes.data);
      setRecettes(recettesRes.data);
      setDepenses(depensesRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const handleDeleteRecette = async (recetteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      try {
        await recettesService.delete(recetteId);
        toast.success('Recette supprimée avec succès');
        fetchData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteDepense = async (depenseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await depensesService.delete(depenseId);
        toast.success('Dépense supprimée avec succès');
        fetchData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!navire) {
    return <div>Navire non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/navires')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{navire.nom}</h2>
          </div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            navire.statut === 'en_cours' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {navire.statut === 'en_cours' ? 'En cours' : 'Terminé'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Numéro IMO</p>
            <p className="text-lg font-medium">{navire.numero_imo || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date d'arrivée</p>
            <p className="text-lg font-medium">
              {format(new Date(navire.date_arrivee), 'dd/MM/yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date de départ</p>
            <p className="text-lg font-medium">
              {navire.date_depart ? format(new Date(navire.date_depart), 'dd/MM/yyyy') : '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">Total Recettes</h3>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(resultat?.total_recettes)}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800">Total Dépenses</h3>
            <p className="text-2xl font-bold text-red-900">
              {formatCurrency(resultat?.total_depenses)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Résultat Net</h3>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(resultat?.resultat_net)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recettes</h3>
            <button
              onClick={() => {
                setSelectedRecette(null);
                setShowRecetteModal(true);
              }}
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>
          
          <div className="space-y-2">
            {recettes.map((recette) => (
              <div key={recette.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{recette.type_prestation_nom}</p>
                    <p className="text-sm text-gray-500">{recette.categorie}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(recette.date_recette), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(recette.montant)}
                    </p>
                    <div className="flex space-x-2 mt-1">
                      <button
                        onClick={() => {
                          setSelectedRecette(recette);
                          setShowRecetteModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteRecette(recette.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {recettes.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune recette enregistrée</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Dépenses</h3>
            <button
              onClick={() => {
                setSelectedDepense(null);
                setShowDepenseModal(true);
              }}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>
          
          <div className="space-y-2">
            {depenses.map((depense) => (
              <div key={depense.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{depense.type_depense_nom}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(depense.date_depense), 'dd/MM/yyyy')}
                    </p>
                    {depense.description && (
                      <p className="text-sm text-gray-600 mt-1">{depense.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(depense.montant)}
                    </p>
                    <div className="flex space-x-2 mt-1">
                      <button
                        onClick={() => {
                          setSelectedDepense(depense);
                          setShowDepenseModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteDepense(depense.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {depenses.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune dépense enregistrée</p>
            )}
          </div>
        </div>
      </div>

      {showRecetteModal && (
        <RecetteModal
          navireId={navire.id}
          recette={selectedRecette}
          onClose={() => {
            setShowRecetteModal(false);
            fetchData();
          }}
        />
      )}

      {showDepenseModal && (
        <DepenseModal
          navireId={navire.id}
          depense={selectedDepense}
          onClose={() => {
            setShowDepenseModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

export default NavireDetail;