import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import ejs from 'ejs';

import { homepageHeadline, productCatalog } from '../src/config/product-catalog.js';
import {
  buildHomePageViewModel,
  buildProductPageViewModel,
  buildPublicUrl
} from '../src/core/platform/view-models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, 'frontend-dist');
const viewsDirectory = path.join(projectRoot, 'src/views');
const publicDirectory = path.join(projectRoot, 'public');

function normalizeBaseUrl(value) {
  if (!value) {
    return '';
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

async function renderPage(templatePath, destinationPath, data) {
  const html = await ejs.renderFile(templatePath, data, {
    async: true,
    views: [viewsDirectory]
  });

  ensureDirectory(path.dirname(destinationPath));
  fs.writeFileSync(destinationPath, html);
}

function getBuildUrls() {
  const localBaseUrl = `http://localhost:${process.env.PORT || 3000}`;
  const apiBaseUrl = normalizeBaseUrl(process.env.API_BASE_URL || process.env.APP_URL) || localBaseUrl;
  const frontendAppUrl = normalizeBaseUrl(process.env.FRONTEND_APP_URL);

  if (process.env.VERCEL && !process.env.API_BASE_URL) {
    throw new Error('API_BASE_URL is required for Vercel frontend builds.');
  }

  if (process.env.VERCEL && !frontendAppUrl) {
    throw new Error('FRONTEND_APP_URL is required for Vercel frontend builds.');
  }

  return {
    apiBaseUrl,
    frontendAppUrl
  };
}

async function buildStaticFrontend() {
  const { apiBaseUrl, frontendAppUrl } = getBuildUrls();
  const accessRequestAction = `${apiBaseUrl}/access-requests`;

  fs.rmSync(outputDirectory, { recursive: true, force: true });
  ensureDirectory(outputDirectory);
  fs.cpSync(publicDirectory, outputDirectory, { recursive: true });

  const homePageData = {
    ...buildHomePageViewModel({}),
    currentPath: '/',
    siteName: 'OmniToolset',
    productCatalog,
    homepageHeadline,
    accessRequestAction,
    homeAccessReturnTo: buildPublicUrl('/', frontendAppUrl)
  };

  await renderPage(
    path.join(viewsDirectory, 'pages/home.ejs'),
    path.join(outputDirectory, 'index.html'),
    homePageData
  );

  for (const product of productCatalog) {
    const pageModel = buildProductPageViewModel({
      slug: product.slug,
      query: {}
    });

    await renderPage(
      path.join(viewsDirectory, 'pages/product.ejs'),
      path.join(outputDirectory, 'products', `${product.slug}.html`),
      {
        ...pageModel,
        currentPath: product.pagePath,
        siteName: 'OmniToolset',
        productCatalog,
        homepageHeadline,
        accessRequestAction,
        productAccessReturnTo: buildPublicUrl(product.pagePath, frontendAppUrl)
      }
    );
  }

  await renderPage(
    path.join(viewsDirectory, 'pages/not-found.ejs'),
    path.join(outputDirectory, '404.html'),
    {
      pageTitle: 'Not Found',
      pageDescription: 'The requested page could not be found.',
      currentPath: '/404',
      siteName: 'OmniToolset',
      productCatalog,
      homepageHeadline
    }
  );

  console.log(`Static frontend built to ${outputDirectory}`);
}

buildStaticFrontend().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
