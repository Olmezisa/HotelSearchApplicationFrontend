// santsgApi.js - Düzeltilmiş versiyon

const API_BASE_URL = 'http://localhost:8080/api/v1';
const API_ROOT_BASE_URL = 'http://localhost:8080';
const API_TIMEOUT = 10000; // 10 saniye timeout

// Gelişmiş hata yönetimi ve JSON kontrolü
const handleResponse = async (res, fallbackValue = null) => {
  // HTTP status kontrolü
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (jsonError) {
      console.error('JSON parse hatası:', jsonError);
      throw new Error('Geçersiz JSON yanıtı');
    }
  } else {
    const text = await res.text();
    console.error('Beklenmeyen yanıt türü:', contentType);
    console.error('Yanıt içeriği:', text);
    
    // HTML yanıtı kontrolü (sunucu hatası)
    if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error('Sunucu hatası - HTML yanıtı alındı');
    }
    
    // Boş yanıt kontrolü
    if (!text.trim()) {
      throw new Error('Boş yanıt alındı');
    }
    
    return fallbackValue;
  }
};

// Timeout ile fetch wrapper
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('İstek zaman aşımına uğradı');
    }
    throw error;
  }
};

// Sunucu sağlık kontrolü
const checkServerHealth = async () => {
  try {
    const response = await fetchWithTimeout(`${API_ROOT_BASE_URL}/health`, {
      method: 'GET'
    });
    return response.ok;
  } catch (error) {
    console.error('Sunucu sağlık kontrolü başarısız:', error);
    return false;
  }
};

export const api = {
  // Sunucu sağlık kontrolü
  checkHealth: checkServerHealth,

  // Lokasyon otomatik tamamlama
  getArrivalAutocomplete: async (query) => {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/locations/autocomplete`, {
        method: 'POST',
        body: JSON.stringify({ query: query.trim() })
      });

      return await handleResponse(response, []);
    } catch (error) {
      console.error('Otomatik tamamlama hatası:', error);
      throw new Error('Lokasyon araması başarısız: ' + error.message);
    }
  },

  // Milliyetleri getir
  getNationalities: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/lookups/nationalities`);
      return await handleResponse(response, [
        { id: 'TR', name: 'Türkiye' },
        { id: 'US', name: 'Amerika' },
        { id: 'DE', name: 'Almanya' }
      ]);
    } catch (error) {
      console.error('Milliyetler yükleme hatası:', error);
      // Fallback data döndür
      return [
        { id: 'TR', name: 'Türkiye' },
        { id: 'US', name: 'Amerika' },
        { id: 'DE', name: 'Almanya' }
      ];
    }
  },

  // Para birimlerini getir
  getCurrencies: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/lookups/currencies`);
      return await handleResponse(response, [
        { code: 'EUR', name: 'Euro' },
        { code: 'USD', name: 'Dolar' },
        { code: 'TRY', name: 'Türk Lirası' }
      ]);
    } catch (error) {
      console.error('Para birimleri yükleme hatası:', error);
      // Fallback data döndür
      return [
        { code: 'EUR', name: 'Euro' },
        { code: 'USD', name: 'Dolar' },
        { code: 'TRY', name: 'Türk Lirası' }
      ];
    }
  },

  // Fiyat araması
  priceSearch: async (searchParams) => {
    try {
      if (!searchParams) {
        throw new Error('Arama parametreleri eksik');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/search/prices`, {
        method: 'POST',
        body: JSON.stringify(searchParams)
      });

      return await handleResponse(response, { prices: [] });
    } catch (error) {
      console.error('Fiyat arama hatası:', error);
      throw new Error('Fiyat araması başarısız: ' + error.message);
    }
  },

  // Ürün bilgisi getir
  getProductInfo: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Ürün ID eksik');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/products/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ product: productId })
      });

      return await handleResponse(response, null);
    } catch (error) {
      console.error('Ürün bilgisi alma hatası:', error);
      throw new Error('Ürün bilgisi alınamadı: ' + error.message);
    }
  },

  // Lokasyona göre arama
  searchByLocation: async (requestBody) => {
    try {
      if (!requestBody) {
        throw new Error('İstek verisi eksik');
      }

      console.log('Lokasyon araması isteği:', requestBody);

      const response = await fetchWithTimeout(`${API_ROOT_BASE_URL}/api/price-search/by-location`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      return await handleResponse(response, { body: { hotels: [] } });
    } catch (error) {
      console.error('Lokasyon araması hatası:', error);
      throw new Error('Lokasyon araması başarısız: ' + error.message);
    }
  },

  // Otele göre arama
  searchByHotel: async (requestBody) => {
    try {
      if (!requestBody) {
        throw new Error('İstek verisi eksik');
      }

      console.log('Otel araması isteği:', requestBody);

      const response = await fetchWithTimeout(`${API_ROOT_BASE_URL}/api/price-search/by-hotel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      return await handleResponse(response, { body: { hotels: [] } });
    } catch (error) {
      console.error('Otel araması hatası:', error);
      throw new Error('Otel araması başarısız: ' + error.message);
    }
  }
};