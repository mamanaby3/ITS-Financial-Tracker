import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rapportsService } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState(new Date());
  const [resultatMensuel, setResultatMensuel] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [developerName, setDeveloperName] = useState('');

  const annee = currentMonth.getFullYear();
  const mois = currentMonth.getMonth() + 1;

  useEffect(() => {
    fetchDashboardData();
    // Charger le nom du développeur
    const savedParams = localStorage.getItem('appParametres');
    if (savedParams) {
      const params = JSON.parse(savedParams);
      setDeveloperName(params.nomDeveloppeur || '');
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resultat, evo, stats] = await Promise.all([
        rapportsService.getMensuel(annee, mois),
        rapportsService.getEvolution(annee),
        rapportsService.getStatistiquesMensuel(annee, mois)
      ]);
      
      setResultatMensuel(resultat.data);
      setEvolution(evo.data);
      setStatistiques(stats.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
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

  const pieData = statistiques && {
    labels: statistiques.recettesParType.map(r => r.nom),
    datasets: [{
      data: statistiques.recettesParType.map(r => r.total),
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6'
      ]
    }]
  };

  const evolutionData = {
    labels: evolution.map(e => `Mois ${e.mois}`),
    datasets: [
      {
        label: 'Recettes',
        data: evolution.map(e => e.total_recettes),
        borderColor: '#10b981',
        backgroundColor: '#10b98133',
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: evolution.map(e => e.total_depenses),
        borderColor: '#ef4444',
        backgroundColor: '#ef444433',
        tension: 0.4
      },
      {
        label: 'Résultat Global',
        data: evolution.map(e => e.resultat_global),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f633',
        tension: 0.4
      }
    ]
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Tableau de bord - {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          {developerName && (
            <p className="text-sm text-gray-600">
              Bienvenue dans l'application de <span className="font-semibold">{developerName}</span>
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-800">Nombre de navires</h3>
            <p className="text-3xl font-bold text-blue-900">{resultatMensuel?.nombre_navires || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-green-800">Total Recettes</h3>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(resultatMensuel?.total_recettes)}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-red-800">Total Dépenses</h3>
            <p className="text-2xl font-bold text-red-900">
              {formatCurrency(resultatMensuel?.total_depenses)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-purple-800">Résultat Net Navires</h3>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(resultatMensuel?.resultat_net_navires)}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-yellow-800">Charges Fonctionnement</h3>
            <p className="text-2xl font-bold text-yellow-900">
              {formatCurrency(resultatMensuel?.total_charges_fonctionnement)}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium">Résultat Global du Mois</h3>
          <p className="text-4xl font-bold">
            {formatCurrency(resultatMensuel?.resultat_global)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition des Recettes</h3>
          {pieData && (
            <div className="h-64">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution Annuelle</h3>
          <div className="h-64">
            <Line data={evolutionData} options={{ 
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/navires"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center"
          >
            Gérer les Navires
          </Link>
          <Link
            to="/charges"
            className="bg-secondary-600 text-white px-4 py-2 rounded-md hover:bg-secondary-700 text-center"
          >
            Gérer les Charges
          </Link>
          <Link
            to="/rapports"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-center"
          >
            Voir les Rapports
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;