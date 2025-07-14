import React, { useState, useEffect, useRef } from 'react';
import { Hotel, ArrowLeft } from 'lucide-react';
import { api } from './api/santsgApi';
import HomePage from './components/search/HomePage';
import { Spinner } from './components/common/Spinner';
import { SearchResults } from './components/results/SearchResults';
import { HotelDetail } from './components/detail/HotelDetail';

export default function App() {
  const [nationalities, setNationalities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const [view, setView] = useState('search');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedNationality, setSelectedNationality] = useState('TR');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');

  const [showNatDropdown, setShowNatDropdown] = useState(false);
  const [showCurDropdown, setShowCurDropdown] = useState(false);

  const natRef = useRef();
  const curRef = useRef();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [natRes, curRes] = await Promise.all([
          api.getNationalities(),
          api.getCurrencies()
        ]);

        setNationalities(natRes || []);
        setCurrencies(curRes || []);

        if (natRes && natRes.length > 0) {
          const defaultNat = natRes.find(n => n.id === 'TR') || natRes[0];
          setSelectedNationality(defaultNat.id);
        }
        if (curRes && curRes.length > 0) {
          const defaultCur = curRes.find(c => c.code === 'EUR') || curRes[0];
          setSelectedCurrency(defaultCur.code);
        }
      } catch (err) {
        setError("Başlangıç verileri yüklenemedi.");
        console.error("Initial data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (natRef.current && !natRef.current.contains(e.target)) setShowNatDropdown(false);
      if (curRef.current && !curRef.current.contains(e.target)) setShowCurDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePriceSearch = async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      setLastSearchParams(searchParams);

      const checkInDate = new Date(searchParams.checkIn);
      const checkOutDate = new Date(searchParams.checkOut);
      const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      const baseRequest = {
        checkAllotment: true,
        checkStopSale: true,
        getOnlyBestOffers: true,
        productType: 2,
        roomCriteria: searchParams.roomCriteria,
        nationality: selectedNationality,
        checkIn: searchParams.checkIn,
        night: nights,
        currency: selectedCurrency,
        culture: "en-US",
      };

      let results;
      if (searchParams.locationType === 1) {
        const locationRequestBody = {
          ...baseRequest,
          arrivalLocations: [{ id: searchParams.locationId, type: searchParams.locationType }]
        };
        results = await api.searchByLocation(locationRequestBody);
      } else {
        const hotelRequestBody = {
          ...baseRequest,
          products: [searchParams.locationId]
        };
        results = await api.searchByHotel(hotelRequestBody);
      }

      setSearchResults(results.body?.hotels || []);
      setView('results');
    } catch (err) {
      setError("Arama sırasında bir hata oluştu.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const hotelDetails = await api.getProductInfo(productId);
      setSelectedHotel(hotelDetails);
      setView('detail');
    } catch (err) {
      setError("Otel detayları alınamadı.");
      console.error("Hotel detail fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (error)
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      );

    switch (view) {
      case 'results':
        return (
          <>
            <button
              onClick={() => setView('search')}
              className="mb-4 flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" /> Yeni Arama Yap
            </button>
            <SearchResults
              results={searchResults}
              onHotelSelect={handleHotelSelect}
              currency={selectedCurrency}
            />
          </>
        );
      case 'detail':
        return selectedHotel && <HotelDetail hotel={selectedHotel} onBack={() => setView('results')} />;
      case 'search':
      default:
        return (
          <HomePage
            onSearch={handlePriceSearch}
            nationality={selectedNationality}
            currency={selectedCurrency}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
      <header className="bg-white shadow-md">
        <nav className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hotel className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">Voyago</span>
          </div>

          <div className="flex items-center gap-4 pr-4">
            {/* Nationality dropdown */}
            <div className="relative" ref={natRef}>
              <button
                onClick={() => setShowNatDropdown(!showNatDropdown)}
                className="flex items-center justify-center w-9 h-9 rounded border bg-white text-sm text-gray-800 hover:bg-gray-50"
              >
                🌍
              </button>
              {showNatDropdown && (
                <ul className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50 max-h-60 overflow-auto">
                  {nationalities.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => {
                        setSelectedNationality(n.id);
                        setShowNatDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {n.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Currency dropdown */}
            <div className="relative" ref={curRef}>
              <button
                onClick={() => setShowCurDropdown(!showCurDropdown)}
                className="flex items-center justify-center w-9 h-9 rounded border bg-white text-sm text-gray-800 hover:bg-gray-50"
              >
                💰
              </button>
              {showCurDropdown && (
                <ul className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-50 max-h-60 overflow-auto">
                  {currencies.map((c) => (
                    <li
                      key={c.code}
                      onClick={() => {
                        setSelectedCurrency(c.code);
                        setShowCurDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {c.name} ({c.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>

      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>© 2025 Staj Projesi - SAN TSG</p>
      </footer>
    </div>
  );
}
