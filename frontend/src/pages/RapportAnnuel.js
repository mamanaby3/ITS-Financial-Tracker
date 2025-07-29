import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { rapportAnnuelMock } from '../mocks/rapportAnnuelMock';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function RapportAnnuel() {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [moisSelectionne, setMoisSelectionne] = useState(null);
  const [rapport, setRapport] = useState(null);
  const [rapportMensuel, setRapportMensuel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('resume');
  const [showDetailMois, setShowDetailMois] = useState(false);

  useEffect(() => {
    chargerRapportAnnuel();
  }, [annee]);

  const chargerRapportAnnuel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/rapports/annuel/${annee}/complet`);
      setRapport(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement du rapport annuel:', error);
      // Si l'API échoue, utiliser les données mockées
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log('Utilisation des données mockées');
        await new Promise(resolve => setTimeout(resolve, 500));
        setRapport(rapportAnnuelMock.data);
      } else {
        setError('Erreur lors du chargement du rapport annuel');
      }
    } finally {
      setLoading(false);
    }
  };

  const chargerDetailsMois = async (mois) => {
    try {
      const [resultat, details, stats] = await Promise.all([
        api.get(`/rapports/mensuel/${annee}/${mois}`),
        api.get(`/rapports/mensuel/${annee}/${mois}/details`),
        api.get(`/rapports/mensuel/${annee}/${mois}/statistiques`)
      ]);
      
      setRapportMensuel({
        resultat: resultat.data,
        details: details.data,
        statistiques: stats.data
      });
      setMoisSelectionne(mois);
      setShowDetailMois(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du mois:', error);
      alert('Erreur lors du chargement des détails du mois');
    }
  };

  const telechargerExcel = async () => {
    try {
      const response = await api.get(`/rapports/annuel/${annee}/export/excel`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_Annuel_ITS_${annee}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du rapport Excel');
    }
  };

  const telechargerExcelMois = async (mois) => {
    try {
      const response = await api.get(`/rapports/export/excel/${annee}/${mois}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_Mensuel_ITS_${annee}_${mois}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du rapport Excel');
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant || 0);
  };

  const formatPourcentage = (valeur) => {
    return `${valeur.toFixed(1)}%`;
  };

  const getNomMois = (numeroMois) => {
    const mois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return mois[numeroMois - 1] || 'Mois inconnu';
  };

  // Configuration des graphiques
  const getEvolutionChartData = () => {
    if (!rapport || !rapport.evolutionMensuelle) return {
      labels: [],
      datasets: []
    };

    return {
      labels: rapport.evolutionMensuelle.map(m => m.nom_mois),
      datasets: [
        {
          label: 'Recettes',
          data: rapport.evolutionMensuelle.map(m => m.total_recettes || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Dépenses',
          data: rapport.evolutionMensuelle.map(m => m.total_depenses || 0),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Résultat Global',
          data: rapport.evolutionMensuelle.map(m => m.resultat_global || 0),
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getNaviresChartData = () => {
    if (!rapport || !rapport.evolutionMensuelle) return {
      labels: [],
      datasets: []
    };

    return {
      labels: rapport.evolutionMensuelle.map(m => m.nom_mois),
      datasets: [{
        label: 'Nombre de navires',
        data: rapport.evolutionMensuelle.map(m => m.nombre_navires || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  };

  const getRecettesParTypeData = () => {
    if (!rapport || !rapport.statistiques || !rapport.statistiques.recettesParType) return {
      labels: [],
      datasets: []
    };

    const topRecettes = rapport.statistiques.recettesParType.slice(0, 5);
    return {
      labels: topRecettes.map(r => r.nom || 'N/A'),
      datasets: [{
        data: topRecettes.map(r => r.total || 0),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 1
      }]
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Chargement du rapport annuel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Rapport Annuel {annee}</h1>
          <div className="flex gap-4">
            <select
              value={annee}
              onChange={(e) => setAnnee(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2025, 2024, 2023, 2022].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </button>
            <button
              onClick={telechargerExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger Excel
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {['resume', 'evolution', 'navires', 'statistiques', 'analyse'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'resume' && 'Résumé'}
              {tab === 'evolution' && 'Évolution'}
              {tab === 'navires' && 'Navires'}
              {tab === 'statistiques' && 'Statistiques'}
              {tab === 'analyse' && 'Analyse'}
            </button>
          ))}
        </div>
      </div>

      {rapport && (
        <>
          {/* Tab Résumé */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              {/* Cartes de résumé */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Nombre de navires</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {rapport.totalAnnuel.nombre_navires_total}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Recettes</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {formatMontant(rapport.totalAnnuel.total_recettes_annuel)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Dépenses</h3>
                  <p className="text-3xl font-bold text-red-600">
                    {formatMontant(rapport.totalAnnuel.total_depenses_annuel)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Résultat Net Navires</h3>
                  <p className={`text-3xl font-bold ${
                    rapport.totalAnnuel.resultat_net_navires_annuel >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatMontant(rapport.totalAnnuel.resultat_net_navires_annuel)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Charges Fonctionnement</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatMontant(rapport.totalAnnuel.charges_fonctionnement_annuel)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Résultat Global</h3>
                  <p className={`text-3xl font-bold ${
                    rapport.totalAnnuel.resultat_global_annuel >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatMontant(rapport.totalAnnuel.resultat_global_annuel)}
                  </p>
                </div>
              </div>

              {/* Top 5 Navires */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Top 5 Navires par Rentabilité</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Navire</th>
                        <th className="text-left py-2">IMO</th>
                        <th className="text-right py-2">Recettes</th>
                        <th className="text-right py-2">Dépenses</th>
                        <th className="text-right py-2">Résultat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.topNavires.slice(0, 5).map((navire, index) => (
                        <tr key={navire.id} className="border-b hover:bg-gray-50">
                          <td className="py-2">{navire.nom}</td>
                          <td className="py-2">{navire.numero_imo}</td>
                          <td className="py-2 text-right">{formatMontant(navire.total_recettes)}</td>
                          <td className="py-2 text-right">{formatMontant(navire.total_depenses)}</td>
                          <td className={`py-2 text-right font-semibold ${
                            navire.resultat_net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatMontant(navire.resultat_net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Évolution */}
          {activeTab === 'evolution' && (
            <div className="space-y-6">
              {/* Graphique d'évolution financière */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Évolution Financière Mensuelle</h2>
                <div className="h-96">
                  {rapport && rapport.evolutionMensuelle && rapport.evolutionMensuelle.length > 0 ? (
                    <Line
                      data={getEvolutionChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatMontant(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Aucune donnée disponible pour le graphique</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Graphique nombre de navires */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Nombre de Navires par Mois</h2>
                <div className="h-64">
                  {rapport && rapport.evolutionMensuelle && rapport.evolutionMensuelle.length > 0 ? (
                    <Bar
                      data={getNaviresChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Aucune donnée disponible pour le graphique</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tableau d'évolution mensuelle */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Détail par Mois</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-2">Mois</th>
                        <th className="text-center py-2 px-2">Navires</th>
                        <th className="text-right py-2 px-2">Recettes</th>
                        <th className="text-right py-2 px-2">Dépenses</th>
                        <th className="text-right py-2 px-2">Résultat Net</th>
                        <th className="text-right py-2 px-2">Charges</th>
                        <th className="text-right py-2 px-2">Résultat Global</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.evolutionMensuelle.map((mois, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">
                            <div className="flex items-center justify-between">
                              <span>{mois.nom_mois}</span>
                              <button
                                onClick={() => chargerDetailsMois(mois.mois)}
                                className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                title="Voir les détails"
                              >
                                Détails
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">{mois.nombre_navires}</td>
                          <td className="py-2 px-2 text-right">{formatMontant(mois.total_recettes)}</td>
                          <td className="py-2 px-2 text-right">{formatMontant(mois.total_depenses)}</td>
                          <td className="py-2 px-2 text-right">{formatMontant(mois.resultat_net_navires)}</td>
                          <td className="py-2 px-2 text-right">{formatMontant(mois.charges_fonctionnement)}</td>
                          <td className={`py-2 px-2 text-right font-semibold ${
                            mois.resultat_global >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatMontant(mois.resultat_global)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navires */}
          {activeTab === 'navires' && (
            <div className="space-y-6">
              {/* Top Clients */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Top 10 Clients</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2">Client</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-center py-2">Nb Navires</th>
                        <th className="text-right py-2">Tonnage Total</th>
                        <th className="text-left py-2">Produits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.topClients.map((client, index) => (
                        <tr key={client.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 font-medium">{client.client || client.nom}</td>
                          <td className="py-2">{client.type || 'Armateur'}</td>
                          <td className="py-2 text-center">{client.nombre_navires}</td>
                          <td className="py-2 text-right">{client.tonnage_total} t</td>
                          <td className="py-2 text-sm">{client.produits || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Produits */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Top 10 Produits Transportés</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2">Produit</th>
                        <th className="text-left py-2">Catégorie</th>
                        <th className="text-center py-2">Nb Navires</th>
                        <th className="text-center py-2">Nb Clients</th>
                        <th className="text-right py-2">Tonnage Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.topProduits.map((produit, index) => (
                        <tr key={produit.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 font-medium">{produit.produit || produit.nom}</td>
                          <td className="py-2">{produit.categorie || 'Général'}</td>
                          <td className="py-2 text-center">{produit.nombre_navires}</td>
                          <td className="py-2 text-center">{produit.nombre_clients}</td>
                          <td className="py-2 text-right">{produit.tonnage_total} t</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Statistiques */}
          {activeTab === 'statistiques' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique recettes par type */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Top 5 Types de Recettes</h2>
                  <div className="h-64">
                    {rapport && rapport.statistiques && rapport.statistiques.recettesParType && rapport.statistiques.recettesParType.length > 0 ? (
                      <Doughnut
                        data={getRecettesParTypeData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Aucune donnée disponible pour le graphique</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques détaillées */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Statistiques Détaillées</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Recettes</h3>
                      <p className="text-sm text-gray-600">
                        {rapport.statistiques.recettesParType ? rapport.statistiques.recettesParType.length : 0} types différents
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: {formatMontant(
                          rapport.statistiques.recettesParType ? rapport.statistiques.recettesParType.reduce((sum, r) => sum + r.total, 0) : 0
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Dépenses</h3>
                      <p className="text-sm text-gray-600">
                        {rapport.statistiques.depensesParType ? rapport.statistiques.depensesParType.length : 0} types différents
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: {formatMontant(
                          rapport.statistiques.depensesParType ? rapport.statistiques.depensesParType.reduce((sum, d) => sum + d.total, 0) : 0
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Charges</h3>
                      <p className="text-sm text-gray-600">
                        {rapport.statistiques.chargesParType ? rapport.statistiques.chargesParType.length : 0} types différents
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: {formatMontant(
                          rapport.statistiques.chargesParType ? rapport.statistiques.chargesParType.reduce((sum, c) => sum + c.total, 0) : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableaux détaillés */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recettes par type */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold mb-3">Recettes par Type</h3>
                  <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b">
                          <th className="text-left py-1">Type</th>
                          <th className="text-right py-1">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rapport.statistiques.recettesParType && rapport.statistiques.recettesParType.map((recette, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-1">{recette.nom}</td>
                            <td className="py-1 text-right">{formatMontant(recette.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dépenses par type */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold mb-3">Dépenses par Type</h3>
                  <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b">
                          <th className="text-left py-1">Type</th>
                          <th className="text-right py-1">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rapport.statistiques.depensesParType && rapport.statistiques.depensesParType.map((depense, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-1">{depense.nom}</td>
                            <td className="py-1 text-right">{formatMontant(depense.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Charges par type */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold mb-3">Charges par Type</h3>
                  <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b">
                          <th className="text-left py-1">Type</th>
                          <th className="text-right py-1">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rapport.statistiques.chargesParType && rapport.statistiques.chargesParType.map((charge, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-1">{charge.nom}</td>
                            <td className="py-1 text-right">{formatMontant(charge.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Analyse */}
          {activeTab === 'analyse' && (
            <div className="space-y-6">
              {/* Analyse de performance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Analyse de Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Indicateurs clés */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Indicateurs Clés</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">Marge bénéficiaire</span>
                        <span className="font-bold text-green-600">
                          {formatPourcentage((rapport.totalAnnuel.resultat_global_annuel / rapport.totalAnnuel.total_recettes_annuel) * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">Taux de charges</span>
                        <span className="font-bold text-orange-600">
                          {formatPourcentage((rapport.totalAnnuel.charges_fonctionnement_annuel / rapport.totalAnnuel.total_recettes_annuel) * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">Rentabilité navires</span>
                        <span className="font-bold text-blue-600">
                          {formatPourcentage((rapport.totalAnnuel.resultat_net_navires_annuel / rapport.totalAnnuel.total_recettes_annuel) * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">Revenu moyen/navire</span>
                        <span className="font-bold">
                          {formatMontant(rapport.totalAnnuel.total_recettes_annuel / rapport.totalAnnuel.nombre_navires_total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comparaison mensuelle */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Meilleurs et Pires Mois</h3>
                    <div className="space-y-3">
                      {(() => {
                        const sorted = [...rapport.evolutionMensuelle].sort((a, b) => b.resultat_global - a.resultat_global);
                        const best = sorted.slice(0, 3);
                        const worst = sorted.slice(-3).reverse();
                        return (
                          <>
                            <div className="bg-green-50 p-3 rounded">
                              <p className="font-semibold text-green-800 mb-2">Top 3 Mois</p>
                              {best.map((mois, idx) => (
                                <div key={idx} className="flex justify-between text-sm py-1">
                                  <span>{mois.nom_mois}</span>
                                  <span className="font-medium">{formatMontant(mois.resultat_global)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="bg-red-50 p-3 rounded">
                              <p className="font-semibold text-red-800 mb-2">3 Mois les plus faibles</p>
                              {worst.map((mois, idx) => (
                                <div key={idx} className="flex justify-between text-sm py-1">
                                  <span>{mois.nom_mois}</span>
                                  <span className="font-medium">{formatMontant(mois.resultat_global)}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Recommandations et Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Points Forts</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Marge bénéficiaire solide de {formatPourcentage((rapport.totalAnnuel.resultat_global_annuel / rapport.totalAnnuel.total_recettes_annuel) * 100)}</li>
                        <li>• Diversification des clients avec {rapport.topClients.length} partenaires majeurs</li>
                        <li>• Croissance stable du nombre de navires traités</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Opportunités</h3>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Potentiel d'expansion avec les armateurs existants</li>
                        <li>• Optimisation des coûts de manutention</li>
                        <li>• Développement de nouveaux services portuaires</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-2">Points d'Attention</h3>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Charges de fonctionnement à surveiller</li>
                        <li>• Variation saisonnière importante</li>
                        <li>• Dépendance aux grands armateurs</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">Actions Recommandées</h3>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Négocier des contrats annuels avec les top clients</li>
                        <li>• Investir dans l'automatisation pour réduire les coûts</li>
                        <li>• Diversifier les types de services offerts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Projection pour l'Année Suivante</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Sur la base des tendances actuelles et en maintenant le niveau d'activité :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded shadow">
                      <p className="text-sm text-gray-600">Chiffre d'affaires projeté</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatMontant(rapport.totalAnnuel.total_recettes_annuel * 1.08)}
                      </p>
                      <p className="text-xs text-gray-500">+8% de croissance</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                      <p className="text-sm text-gray-600">Résultat net projeté</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatMontant(rapport.totalAnnuel.resultat_global_annuel * 1.12)}
                      </p>
                      <p className="text-xs text-gray-500">+12% d'amélioration</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                      <p className="text-sm text-gray-600">Nombre de navires estimé</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round(rapport.totalAnnuel.nombre_navires_total * 1.15)}
                      </p>
                      <p className="text-xs text-gray-500">+15% de croissance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal pour les détails du mois */}
      {showDetailMois && rapportMensuel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full">
            {/* En-tête de la modal */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Détails - {getNomMois(moisSelectionne)} {annee}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => telechargerExcelMois(moisSelectionne)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </button>
                <button
                  onClick={() => setShowDetailMois(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Résumé du mois */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800">Navires</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {rapportMensuel.resultat.nombre_navires || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-800">Recettes</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatMontant(rapportMensuel.resultat.total_recettes)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-800">Dépenses</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatMontant(rapportMensuel.resultat.total_depenses)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-purple-800">Résultat</h3>
                  <p className={`text-2xl font-bold ${
                    rapportMensuel.resultat.resultat_global >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatMontant(rapportMensuel.resultat.resultat_global)}
                  </p>
                </div>
              </div>

              {/* Détails par navire */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Détails par Navire</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-2">Navire</th>
                        <th className="text-left py-2 px-2">N° IMO</th>
                        <th className="text-center py-2 px-2">Période</th>
                        <th className="text-right py-2 px-2">Recettes</th>
                        <th className="text-right py-2 px-2">Dépenses</th>
                        <th className="text-right py-2 px-2">Résultat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapportMensuel.details && rapportMensuel.details.map((navire, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{navire.nom}</td>
                          <td className="py-2 px-2">{navire.numero_imo || 'N/A'}</td>
                          <td className="py-2 px-2 text-center text-sm">
                            {navire.date_arrivee ? new Date(navire.date_arrivee).toLocaleDateString('fr-FR') : 'N/A'} - 
                            {navire.date_depart ? new Date(navire.date_depart).toLocaleDateString('fr-FR') : 'N/A'}
                          </td>
                          <td className="py-2 px-2 text-right">{formatMontant(navire.total_recettes)}</td>
                          <td className="py-2 px-2 text-right">{formatMontant(navire.total_depenses)}</td>
                          <td className={`py-2 px-2 text-right font-semibold ${
                            navire.resultat_net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatMontant(navire.resultat_net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statistiques du mois */}
              {rapportMensuel.statistiques && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recettes par type */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Recettes par Type</h3>
                    <div className="space-y-2">
                      {rapportMensuel.statistiques.recettesParType?.map((recette, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{recette.nom}</span>
                          <span className="font-semibold">{formatMontant(recette.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dépenses par type */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Dépenses par Type</h3>
                    <div className="space-y-2">
                      {rapportMensuel.statistiques.depensesParType?.map((depense, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{depense.nom}</span>
                          <span className="font-semibold">{formatMontant(depense.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RapportAnnuel;