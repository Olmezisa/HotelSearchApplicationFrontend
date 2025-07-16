import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Users, Search, Plus, Minus, X, Loader2 } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { api } from '../../api/santsgApi';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const SearchForm = ({ onSearch, currency, nationality }) => {
  const [query, setQuery] = useState('');
  const [showRoomBox, setShowRoomBox] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000),
    key: 'selection',
  });

  const roomBoxRef = useRef(null);
  const roomBtnRef = useRef(null);
  const calendarRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoadingSuggestions(true);
        setError(null);
        try {
          const results = await api.getArrivalAutocomplete(query);
          setSuggestions(results || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Autocomplete hatası:', err);
          setError('Konum araması başarısız oldu');
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roomBoxRef.current && !roomBoxRef.current.contains(e.target) &&
          roomBtnRef.current && !roomBtnRef.current.contains(e.target)) {
        setShowRoomBox(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowRoomBox(false);
        setShowCalendar(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleRoomChange = (index, type, action) => {
    const updated = [...rooms];
    if (action === 'increment') {
      if ((type === 'adults' && updated[index][type] >= 6) || (type === 'children' && updated[index][type] >= 4)) return;
      updated[index][type]++;
    } else if (action === 'decrement') {
      if ((type === 'adults' && updated[index][type] <= 1) || (type === 'children' && updated[index][type] <= 0)) return;
      updated[index][type]--;
    }
    setRooms(updated);
  };

  const handleAddRoom = () => {
    if (rooms.length < 5) setRooms([...rooms, { adults: 2, children: 0 }]);
  };

  const handleRemoveRoom = (index) => {
    if (rooms.length > 1) setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setQuery(loc.name);
    setShowSuggestions(false);
    setError(null);
  };

  const validateForm = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Konum kontrolü - eğer query varsa ama selectedLocation yoksa, query'yi konum olarak kabul et
    if (!selectedLocation && !query.trim()) {
      setError('Lütfen bir konum girin!');
      return false;
    }

    if (selectionRange.startDate < today) {
      setError('Giriş tarihi geçmiş olamaz!');
      return false;
    }
    
    if (selectionRange.endDate <= selectionRange.startDate) {
      setError('Çıkış tarihi, giriş tarihinden sonra olmalı!');
      return false;
    }

    const diff = Math.ceil((selectionRange.endDate - selectionRange.startDate) / (1000 * 60 * 60 * 24));
    if (diff > 30) {
      setError('Maksimum kalış süresi 30 gündür!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Search butonu tıklandı'); // Debug için
    
    if (isSearching) {
      console.log('Zaten arama yapılıyor, işlem iptal edildi');
      return;
    }

    if (!validateForm()) {
      console.log('Form validasyonu başarısız');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const checkIn = selectionRange.startDate.toISOString().split('T')[0];
      const checkOut = selectionRange.endDate.toISOString().split('T')[0];

      const searchParams = {
        location: selectedLocation ? selectedLocation.name : query.trim(),
        locationType: selectedLocation ? selectedLocation.type : 'city',
        locationId: selectedLocation ? selectedLocation.id : null,
        checkIn,
        checkOut,
        roomCriteria: rooms.map(r => ({ 
          adult: r.adults, 
          child: r.children, 
          childAges: Array(r.children).fill(5) 
        })),
        currency: currency || 'EUR',
        nationality: nationality || 'TR'
      };

      console.log('Arama parametreleri:', searchParams); // Debug için

      // onSearch fonksiyonu kontrol et
      if (typeof onSearch === 'function') {
        await onSearch(searchParams);
        console.log('Arama başarılı');
      } else {
        console.error('onSearch fonksiyonu tanımlanmamış');
        setError('Arama fonksiyonu tanımlanmamış');
      }
    } catch (err) {
      console.error('Arama hatası:', err);
      setError('Arama sırasında bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsSearching(false);
    }
  };

  // Buton tıklama fonksiyonu - form submit'e alternatif
  const handleButtonClick = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const totalGuests = rooms.reduce((sum, r) => sum + r.adults + r.children, 0);
  const dateRangeText = `${selectionRange.startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${selectionRange.endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`;

  return (
    <div className="bg-[#1f1f1fcc] backdrop-blur-md rounded-xl shadow-lg p-4 w-full max-w-5xl mx-auto">
      {/* Hata mesajı */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 items-center">
        {/* Konum */}
        <div className="relative w-full md:flex-1">
          <div className="flex items-center bg-[#1f1f1fcc] text-white rounded-lg px-3 py-2">
            <MapPin className="text-white mr-2" size={18} />
            <input
              type="text"
              placeholder="Şehir veya otel"
              className="bg-transparent w-full text-sm focus:outline-none placeholder-white"
              value={query}
              onChange={(e) => { 
                setQuery(e.target.value); 
                setSelectedLocation(null); 
                setError(null); 
              }}
            />
            {isLoadingSuggestions && <Loader2 className="animate-spin text-white ml-2" size={16} />}
          </div>
          {showSuggestions && (
            <div ref={suggestionsRef} className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow border max-h-60 overflow-y-auto">
              {suggestions.map((sug, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  onClick={() => handleLocationSelect(sug)} 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <div className="font-medium">{sug.name}</div>
                  <div className="text-xs text-gray-500">{sug.country}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tarih */}
        <div className="relative w-full md:flex-1">
          <button 
            type="button" 
            onClick={() => setShowCalendar(!showCalendar)} 
            className="flex items-center w-full bg-[#1f1f1fcc] text-white rounded-lg px-3 py-2"
          >
            <Calendar className="text-white mr-2" size={18} />
            <span className="text-sm">{dateRangeText || 'Tarih Seç'}</span>
          </button>
          {showCalendar && (
            <div ref={calendarRef} className="absolute z-20 mt-2">
              <DateRange
                ranges={[selectionRange]}
                onChange={(item) => setSelectionRange(item.selection)}
                minDate={new Date()}
                rangeColors={['#8986c8']}
                className="bg-white rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Oda */}
        <div className="relative w-full md:flex-1">
          <button 
            ref={roomBtnRef} 
            type="button" 
            onClick={() => setShowRoomBox(!showRoomBox)} 
            className="flex items-center w-full bg-[#1f1f1fcc] text-white rounded-lg px-3 py-2"
          >
            <Users className="text-white mr-2" size={18} />
            <span className="text-sm">{totalGuests} Kişi, {rooms.length} Oda • Oda Seç</span>
          </button>
          {showRoomBox && (
            <div ref={roomBoxRef} className="absolute z-20 mt-2 right-0 w-72 bg-[#1f1f1fcc] text-white rounded-lg shadow-lg border p-4">
              {rooms.map((room, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Yetişkin</span>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleRoomChange(idx, 'adults', 'decrement')} 
                        className="text-white border border-white rounded-full px-2"
                      >
                        -
                      </button>
                      <span>{room.adults}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRoomChange(idx, 'adults', 'increment')} 
                        className="text-white border border-white rounded-full px-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Çocuk</span>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleRoomChange(idx, 'children', 'decrement')} 
                        className="text-white border border-white rounded-full px-2"
                      >
                        -
                      </button>
                      <span>{room.children}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRoomChange(idx, 'children', 'increment')} 
                        className="text-white border border-white rounded-full px-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {rooms.length > 1 && (
                    <div className="text-right mt-2">
                      <button 
                        type="button"
                        onClick={() => handleRemoveRoom(idx)} 
                        className="text-xs text-red-300 hover:underline"
                      >
                        Odayı Kaldır
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {rooms.length < 5 && (
                <button 
                  type="button" 
                  onClick={handleAddRoom} 
                  className="text-sm text-blue-300 hover:underline w-full text-center mt-2"
                >
                  + Oda Ekle
                </button>
              )}
            </div>
          )}
        </div>

        {/* Arama Butonu */}
        <div className="w-full md:w-auto">
          <button
            type="submit"
            onClick={handleButtonClick}
            disabled={isSearching}
            className="bg-[#1f2937] hover:bg-[#172B66] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg w-full transition-colors"
          >
            {isSearching ? (
              <>
                <Loader2 className="animate-spin inline mr-2" size={16} />
                Aranıyor...
              </>
            ) : (
              <>
                <Search className="inline mr-2" size={16} />
                Otelleri Keşfet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;