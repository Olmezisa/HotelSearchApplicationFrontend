// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Hotel, ArrowLeft, Globe, DollarSign } from 'lucide-react';
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
        setError(null);

        const [natRes, curRes] = await Promise.all([
          api.getNationalities(),
          api.getCurrencies()
        ]);

        setNationalities(Array.isArray(natRes) ? natRes : []);
        setCurrencies(Array.isArray(curRes) ? curRes : []);

        const defaultNat = natRes.find(n => n.id === 'TR') || natRes[0];
        const defaultCur = curRes.find(c => c.code === 'EUR') || curRes[0];

        setSelectedNationality(defaultNat?.id || '');
        setSelectedCurrency(defaultCur?.code || '');
      } catch (err) {
        setError("Başlangıç verileri yüklenemedi. Lütfen sayfayı yenileyin.");
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
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowNatDropdown(false);
        setShowCurDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handlePriceSearch = async (searchParams) => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);
      setLastSearchParams(searchParams);

      const checkInDate = new Date(searchParams.checkIn);
      const checkOutDate = new Date(searchParams.checkOut);
      if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
        throw new Error("Geçersiz tarih aralığı");
      }

      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      const baseRequest = {
        checkAllotment: true,
        checkStopSale: true,
        getOnlyBestOffers: true,
        productType: 2,
        roomCriteria: searchParams.roomCriteria || [],
        nationality: selectedNationality,
        checkIn: searchParams.checkIn,
        night: nights,
        currency: selectedCurrency,
        culture: "en-US"
      };

      const results = searchParams.locationType === 1
        ? await api.searchByLocation({ ...baseRequest, arrivalLocations: [{ id: searchParams.locationId, type: 1 }] })
        : await api.searchByHotel({ ...baseRequest, products: [searchParams.locationId] });

      const hotels = results?.body?.hotels;
      if (!Array.isArray(hotels)) throw new Error("Geçersiz arama sonucu formatı");

      setSearchResults(hotels);
      setView(hotels.length === 0 ? 'search' : 'results');
    } catch (err) {
      setError(err.message || "Arama sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = async (productId) => {
    if (!productId || loading) return;
    try {
      setLoading(true);
      const hotelDetails = await api.getProductInfo(productId);
      if (!hotelDetails) throw new Error();
      setSelectedHotel(hotelDetails);
      setView('detail');
    } catch {
      setError("Otel detayları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => { 
    setView('search'); 
    setError(null); 
    setSearchResults(null);
    setSelectedHotel(null);
  };
  
  const handleBackToResults = () => { 
    setView('results'); 
    setError(null); 
    setSelectedHotel(null);
  };
  
  const getNationalityName = () => nationalities.find(n => n.id === selectedNationality)?.name || selectedNationality;
  const getCurrencyName = () => currencies.find(c => c.code === selectedCurrency)?.name || selectedCurrency;

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
    if (error) return (
      <div className="max-w-2xl mx-auto my-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2 space-x-4">
                <button onClick={handleBackToSearch} className="text-sm text-red-700 underline hover:text-red-600">
                  Ana Sayfaya Dön
                </button>
                {view === 'detail' && (
                  <button onClick={handleBackToResults} className="text-sm text-red-700 underline hover:text-red-600">
                    Sonuçlara Dön
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    switch (view) {
      case 'results':
        return (
          <div className="max-w-7xl mx-auto">
            <button onClick={handleBackToSearch} className="flex items-center text-yellow-400 hover:text-yellow-300 mb-6">
              <ArrowLeft className="h-5 w-5 mr-2" /><span>Yeni Arama Yap</span>
            </button>
            <SearchResults results={searchResults} onHotelSelect={handleHotelSelect} currency={selectedCurrency} />
          </div>
        );
      case 'detail':
        return (
          <div className="max-w-7xl mx-auto">
            <button onClick={handleBackToResults} className="flex items-center text-yellow-400 hover:text-yellow-300 mb-6">
              <ArrowLeft className="h-5 w-5 mr-2" /><span>Arama Sonuçlarına Dön</span>
            </button>
            {selectedHotel && <HotelDetail hotel={selectedHotel} currency={selectedCurrency} />}
          </div>
        );
      default:
        return <HomePage onSearch={handlePriceSearch} nationality={selectedNationality} currency={selectedCurrency} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] font-sans text-white flex flex-col">
      <header className="bg-[#1f2937] shadow-md z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo - Tıklanabilir */}
            <button 
              onClick={handleBackToSearch}
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
            >
              <Hotel className="h-8 w-8 text-yellow-400" />
              <span className="ml-2 text-xl font-bold">Voyago</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative" ref={natRef}>
                <button onClick={() => setShowNatDropdown(!showNatDropdown)} className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
                  <Globe className="h-4 w-4" />
                  <span>{getNationalityName()}</span>
                </button>
                {showNatDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                    <div className="py-1 max-h-60 overflow-auto">
                      {nationalities.map((n) => (
                        <button key={n.id} onClick={() => { setSelectedNationality(n.id); setShowNatDropdown(false); }} className={`block w-full text-left px-4 py-2 text-sm ${selectedNationality === n.id ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-100'}`}>
                          {n.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={curRef}>
                <button onClick={() => setShowCurDropdown(!showCurDropdown)} className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
                  <DollarSign className="h-4 w-4" />
                  <span>{getCurrencyName()}</span>
                </button>
                {showCurDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                    <div className="py-1 max-h-60 overflow-auto">
                      {currencies.map((c) => (
                        <button key={c.code} onClick={() => { setSelectedCurrency(c.code); setShowCurDropdown(false); }} className={`block w-full text-left px-4 py-2 text-sm ${selectedCurrency === c.code ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-100'}`}>
                          {c.name} ({c.code})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow py-0">{renderContent()}</main>
      <footer className="bg-[#1f2937] border-t py-4 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Voyago - Tüm hakları saklıdır</p>
      </footer>
    </div>
  );
}