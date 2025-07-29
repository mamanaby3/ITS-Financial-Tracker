const express = require('express');
const app = express();

// Import des routes
const rapportsRoutes = require('./src/routes/rapports.routes');
const rapportsAnnuelsRoutes = require('./src/routes/rapports-annuels.routes');

// Routes
app.use('/api/rapports', rapportsRoutes);
app.use('/api/rapports', rapportsAnnuelsRoutes);

// Liste toutes les routes
function print(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
  } else if (layer.method) {
    console.log('%s /%s',
      layer.method.toUpperCase(),
      path.concat(split(layer.regexp)).filter(Boolean).join('/'))
  }
}

function split(thing) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    var match = thing.toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^(.*?)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}

console.log('Routes disponibles:');
app._router.stack.forEach(print.bind(null, []))