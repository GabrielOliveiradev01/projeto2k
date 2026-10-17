require('./lib/load-env');
const { connectLambda, getStore } = require('@netlify/blobs');
const { jsonResponse } = require('./lib/asaas');

const STORE_NAME = 'products';

function isAuthorized(event) {
  const secret = process.env.ADMIN_PASSWORD || '';
  if (!secret) return false;

  const header = event.headers.authorization || event.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token === secret;
}

function getProductsStore(event) {
  if (event.blobs) connectLambda(event);
  return getStore(STORE_NAME);
}

async function readProducts(store) {
  const data = await store.get('items', { type: 'json' });
  return Array.isArray(data) ? data : [];
}

function sortProducts(products) {
  return products.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function parseProductFields(body) {
  const name = String(body.name || '').trim();
  const price = Number(String(body.price ?? '').replace(',', '.'));
  const stock = Number.parseInt(body.stock ?? 0, 10);
  const category = String(body.category || '').trim();

  if (!name) return { error: 'Informe o nome do produto.' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Informe um preço válido.' };
  if (!Number.isFinite(stock) || stock < 0) return { error: 'Informe um estoque válido.' };

  return {
    fields: {
      name,
      category,
      price: Math.round(price * 100) / 100,
      stock,
      active: body.active !== false,
    },
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (!isAuthorized(event)) {
    return jsonResponse(401, { error: 'Não autorizado.' });
  }

  try {
    const store = getProductsStore(event);
    const products = await readProducts(store);

    if (event.httpMethod === 'GET') {
      return jsonResponse(200, { products: sortProducts(products) });
    }

    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        return jsonResponse(400, { error: 'Dados inválidos.' });
      }
    }

    if (event.httpMethod === 'POST') {
      const { fields, error } = parseProductFields(body);
      if (error) return jsonResponse(400, { error });

      const product = {
        id: `prod_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        ...fields,
        createdAt: new Date().toISOString(),
      };
      products.push(product);
      await store.setJSON('items', products);
      return jsonResponse(200, { product });
    }

    if (event.httpMethod === 'PATCH') {
      const id = String(body.id || '').trim();
      const index = products.findIndex((item) => item.id === id);
      if (index === -1) return jsonResponse(404, { error: 'Produto não encontrado.' });

      const { fields, error } = parseProductFields({ ...products[index], ...body });
      if (error) return jsonResponse(400, { error });

      products[index] = { ...products[index], ...fields };
      await store.setJSON('items', products);
      return jsonResponse(200, { product: products[index] });
    }

    if (event.httpMethod === 'DELETE') {
      const id = String(body.id || '').trim();
      const next = products.filter((item) => item.id !== id);
      if (next.length === products.length) {
        return jsonResponse(404, { error: 'Produto não encontrado.' });
      }
      await store.setJSON('items', next);
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'Método não permitido.' });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao processar solicitação.' });
  }
};
