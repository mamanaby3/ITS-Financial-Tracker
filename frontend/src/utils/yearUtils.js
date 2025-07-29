// Fonction pour générer une liste d'années dynamique
export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2023; // Année de début des données
  const years = [];
  
  // Générer les années de startYear jusqu'à l'année actuelle + 1
  for (let year = startYear; year <= currentYear + 1; year++) {
    years.push(year);
  }
  
  return years;
};

// Fonction pour obtenir l'année actuelle
export const getCurrentYear = () => {
  return new Date().getFullYear();
};

// Fonction pour obtenir le mois actuel (1-12)
export const getCurrentMonth = () => {
  return new Date().getMonth() + 1;
};