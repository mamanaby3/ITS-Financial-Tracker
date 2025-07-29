import React, { useState, useEffect } from 'react';
import { rapportsService } from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getYearOptions, getCurrentYear, getCurrentMonth } from '../utils/yearUtils';

function RapportMensuel() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [resultatMensuel, setResultatMensuel] = useState(null);
  const [detailsNavires, setDetailsNavires] = useState([]);
  const [statistiques, setStatistiques] = useState(null);

  useEffect(() => {
    fetchRapportData();
  }, [selectedMonth, selectedYear]);

  const fetchRapportData = async () => {
    try {
      setLoading(true);
      const [resultat, details, stats] = await Promise.all([
        rapportsService.getMensuel(selectedYear, selectedMonth),
        rapportsService.getDetailsMensuel(selectedYear, selectedMonth),
        rapportsService.getStatistiquesMensuel(selectedYear, selectedMonth)
      ]);
      
      setResultatMensuel(resultat.data);
      setDetailsNavires(details.data);
      setStatistiques(stats.data);
    } catch (error) {
      console.error('Erreur chargement rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    window.open(rapportsService.exportExcel(selectedYear, selectedMonth), '_blank');
  };

  const handleExportPdf = () => {
    window.open(rapportsService.exportPdf(selectedYear, selectedMonth), '_blank');
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

  const depensesChartData = statistiques && {
    labels: statistiques.depensesParType.slice(0, 5).map(d => d.nom),
    datasets: [{
      data: statistiques.depensesParType.slice(0, 5).map(d => d.total),
      backgroundColor: [
        '#ef4444',
        '#f59e0b',
        '#10b981',
        '#3b82f6',
        '#8b5cf6'
      ]
    }]
  };

  const recettesChartData = statistiques && {
    labels: statistiques.recettesParType.map(r => r.nom),
    datasets: [{
      label: 'Recettes par type',
      data: statistiques.recettesParType.map(r => r.total),
      backgroundColor: '#10b981'
    }]
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
          <h2 className="text-2xl font-bold text-gray-900">
            Rapport Mensuel - {months[selectedMonth - 1]} {selectedYear}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              PDF
            </button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Navires</h3>
            <p className="text-2xl font-bold text-blue-900">
              {resultatMensuel?.nombre_navires || 0}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">Total Recettes</h3>
            <p className="text-xl font-bold text-green-900">
              {formatCurrency(resultatMensuel?.total_recettes)}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800">Total Dépenses</h3>
            <p className="text-xl font-bold text-red-900">
              {formatCurrency(resultatMensuel?.total_depenses)}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800">Résultat Global</h3>
            <p className="text-xl font-bold text-purple-900">
              {formatCurrency(resultatMensuel?.resultat_global)}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Détails par Navire</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Navire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Arrivée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recettes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dépenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Résultat Net
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailsNavires.map((navire) => (
                  <tr key={navire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{navire.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(navire.date_arrivee), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-medium">
                        {formatCurrency(navire.total_recettes)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-medium">
                        {formatCurrency(navire.total_depenses)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${navire.resultat_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(navire.resultat_net)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="2" className="px-6 py-4 font-bold">Total</td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    {formatCurrency(resultatMensuel?.total_recettes)}
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">
                    {formatCurrency(resultatMensuel?.total_depenses)}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {formatCurrency(resultatMensuel?.resultat_net_navires)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Répartition des Recettes</h3>
            {recettesChartData && (
              <div className="h-64">
                <Bar data={recettesChartData} options={{ 
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } }
                }} />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Top 5 Dépenses</h3>
            {depensesChartData && (
              <div className="h-64">
                <Doughnut data={depensesChartData} options={{ maintainAspectRatio: false }} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm opacity-90">Résultat Net Navires</p>
              <p className="text-2xl font-bold">{formatCurrency(resultatMensuel?.resultat_net_navires)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Charges Fonctionnement</p>
              <p className="text-2xl font-bold">{formatCurrency(resultatMensuel?.total_charges_fonctionnement)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Résultat Global</p>
              <p className="text-3xl font-bold">{formatCurrency(resultatMensuel?.resultat_global)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RapportMensuel;