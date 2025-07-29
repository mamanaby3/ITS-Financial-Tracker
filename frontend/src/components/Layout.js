import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

function Layout({ children }) {
  const location = useLocation();
  const [developerName, setDeveloperName] = useState('');

  // Charger le nom du développeur depuis localStorage
  useEffect(() => {
    const savedParams = localStorage.getItem('appParametres');
    if (savedParams) {
      const params = JSON.parse(savedParams);
      setDeveloperName(params.nomDeveloppeur || '');
    }
  }, [location]); // Recharger quand on change de page

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Navires', href: '/navires', icon: DocumentTextIcon },
    { name: 'Charges Fonctionnement', href: '/charges', icon: CurrencyDollarIcon },
    { name: 'Rapports Mensuels', href: '/rapports', icon: ChartBarIcon },
    { name: 'Rapport Annuel', href: '/rapport-annuel', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-700">ITS Financial Tracker</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <Link 
                to="/parametres"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                title="Paramètres"
              >
                <Cog6ToothIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer avec crédit du développeur */}
      {developerName && (
        <footer className="bg-gray-100 mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-600">
              Développé par <span className="font-semibold text-gray-800">{developerName}</span> • 
              © {new Date().getFullYear()} ITS Financial Tracker
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default Layout;