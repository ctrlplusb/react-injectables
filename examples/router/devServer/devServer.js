import path from 'path';
import express from 'express';
import webpack from 'webpack';
import config from '../webpack.config.babel';

const server = express();
const compiler = webpack(config);

server.use(require(`webpack-dev-middleware`)(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

server.use(require(`webpack-hot-middleware`)(compiler));

// Get the active webpack configuration.
// const webpackConfig = require(`./webpack.config.js`);

// Configure static serving of our webpack bundles.
// server.use(
//  webpackConfig.output.publicPath,
//  express.static(path.resolve(__dirname, `../public`)));

server.get(`*`, (req, res) => {
  res.sendFile(path.resolve(__dirname, `../public/index.html`));
});

server.listen(3000, `localhost`, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
