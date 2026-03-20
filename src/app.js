import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';

import { homepageHeadline, productCatalog } from './config/product-catalog.js';
import { createModuleRegistry } from './core/modules/registry.js';
import { createPlatformRouter } from './core/platform/router.js';
import { bootstrapDatabase, createRepositories } from './db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let appContext;

export function createApp() {
  if (appContext) {
    return appContext;
  }

  const app = express();
  app.set('trust proxy', true);
  const repositories = createRepositories();

  bootstrapDatabase(repositories);

  const modules = createModuleRegistry({ repositories });

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));

  app.locals.siteName = 'OmniToolset';
  app.locals.productCatalog = productCatalog;
  app.locals.homepageHeadline = homepageHeadline;

  app.use((req, res, next) => {
    res.locals.siteName = 'OmniToolset';
    res.locals.productCatalog = productCatalog;
    res.locals.currentPath = req.path;
    next();
  });

  app.use('/', createPlatformRouter({ repositories }));

  for (const module of modules) {
    app.use(module.apiBasePath, module.router);
  }

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      platform: 'OmniToolset'
    });
  });

  app.use((req, res) => {
    res.status(404).render('pages/not-found', {
      pageTitle: 'Not Found',
      pageDescription: 'The requested page could not be found.'
    });
  });

  app.use((error, req, res, _next) => {
    console.error(error);

    if (req.path.startsWith('/api/')) {
      res.status(500).json({
        error: 'Internal server error'
      });
      return;
    }

    res.status(500).render('pages/error', {
      pageTitle: 'Server Error',
      pageDescription: 'Something went wrong while loading OmniToolset.'
    });
  });

  appContext = {
    app,
    repositories,
    modules
  };

  return appContext;
}

export default createApp().app;
