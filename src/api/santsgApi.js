const API_BASE_URL = 'http://localhost:8080/api/v1';
const API_ROOT_BASE_URL = 'http://localhost:8080';

// JSON dönmediğinde hata vermesin diye ortak kontrol fonksiyonu
const handleResponse = async (res, fallbackValue = null) => {
  const contentType = res.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return res.json();
  } else {
    const text = await res.text();
    console.error('Beklenmeyen yanıt:', text);
    // ❗ İsteğe göre buraya fallback veri dönebilirsin
    return fallbackValue; // hata yerine sahte veri döner
  }
};

export const api = {
  getArrivalAutocomplete: (query) =>
    fetch(`${API_BASE_URL}/locations/autocomplete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then((res) => handleResponse(res, [])),

  getNationalities: () =>
    fetch(`${API_BASE_URL}/lookups/nationalities`).then((res) =>
      handleResponse(res, [])
    ),

  getCurrencies: () =>
    fetch(`${API_BASE_URL}/lookups/currencies`).then((res) =>
      handleResponse(res, [])
    ),

  priceSearch: (searchParams) =>
    fetch(`${API_BASE_URL}/search/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams),
    }).then((res) => handleResponse(res, { prices: [] })),

  getProductInfo: (productId) =>
    fetch(`${API_BASE_URL}/products/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ product: productId }),
    }).then((res) => handleResponse(res, null)),

  searchByLocation: (requestBody) =>
    fetch(`${API_ROOT_BASE_URL}/api/price-search/by-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }).then((res) => handleResponse(res, [])),

  searchByHotel: (requestBody) =>
    fetch(`${API_ROOT_BASE_URL}/api/price-search/by-hotel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(requestBody),
    }).then((res) => handleResponse(res, [])),
};
