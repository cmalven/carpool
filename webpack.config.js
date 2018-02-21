var path = require('path');

module.exports = {
  entry: './src/carpool.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'carpool.js',
    library: 'Carpool',
    libraryTarget: 'umd'
  }
}