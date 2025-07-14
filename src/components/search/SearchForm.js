import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Users, Search, Plus, Minus, X } from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { api } from '../../api/santsgApi';

const SearchForm = () => {
  const [query, setQuery] = useState('');
  const [showRoomBox, setShowRoomBox] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 86400000),
    key: 'selection',
  });

  const roomBoxRef = useRef(null);
  const roomBtnRef = useRef(null);
  const calendarRef = useRef(null);

  // === Dış tıklama ile oda kutusunu kapatma ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        roomBoxRef.current &&
        !roomBoxRef.current.contains(e.target) &&
        !roomBtnRef.current.contains(e.target)
      ) {
        setShowRoomBox(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // === Dış tıklama ile takvimi kapatma ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoomChange = (roomIndex, type, action) => {
    const updatedRooms = [...rooms];
    if (action === 'increment') {
      updatedRooms[roomIndex][type]++;
    } else if (action === 'decrement' && updatedRooms[roomIndex][type] > 0) {
      updatedRooms[roomIndex][type]--;
    }
    setRooms(updatedRooms);
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { adults: 2, children: 0 }]);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const totalGuests = rooms.reduce((sum, room) => sum + room.adults + room.children, 0);

  const handleSearch = async () => {
    try {
      const response = await api.searchHotels({
        location: query,
        startDate: selectionRange.startDate,
        endDate: selectionRange.endDate,
        rooms,
      });
      console.log('Arama sonuçları:', response.data);
    } catch (err) {
      console.error('Arama hatası:', err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 relative z-[30] overflow-visible">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-xl relative">
        {/* Lokasyon */}
        <div className="flex items-center bg-white/20 backdrop-blur px-4 py-3 rounded-lg flex-1 min-w-[220px]">
          <MapPin className="text-white mr-2" size={20} />
          <input
            type="text"
            placeholder="Şehir veya otel adı"
            className="bg-transparent text-white placeholder-white/80 focus:outline-none w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Tarih */}
        <div className="relative flex-1 min-w-[220px]">
          <div
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center bg-white/20 backdrop-blur px-4 py-3 rounded-lg cursor-pointer text-white"
          >
            <Calendar className="mr-2" size={20} />
            <span>
              {selectionRange.startDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })} -{' '}
              {selectionRange.endDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
          {showCalendar && (
            <div ref={calendarRef} className="absolute z-[999] mt-2">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => setSelectionRange(item.selection)}
                moveRangeOnFirstSelection={false}
                ranges={[selectionRange]}
                rangeColors={['#4F46E5']}
              />
            </div>
          )}
        </div>

        {/* Oda/Kişi */}
        <div className="relative flex-1 min-w-[220px]">
          <button
            ref={roomBtnRef}
            onClick={() => setShowRoomBox(!showRoomBox)}
            className="flex items-center bg-white/20 backdrop-blur px-4 py-3 rounded-lg text-white w-full"
          >
            <Users className="mr-2" size={20} />
            {totalGuests} Misafir, {rooms.length} Oda
          </button>

          {showRoomBox && (
            <div
              ref={roomBoxRef}
              className="absolute left-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-[300px] z-[999]"
            >
              {rooms.map((room, index) => (
                <div key={index} className="mb-4 border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">Oda {index + 1}</span>
                    {index > 0 && (
                      <button onClick={() => handleRemoveRoom(index)}>
                        <X size={18} className="text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-gray-700 mb-2">
                    <span>Yetişkin</span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleRoomChange(index, 'adults', 'decrement')}>
                        <Minus size={16} />
                      </button>
                      <span>{room.adults}</span>
                      <button onClick={() => handleRoomChange(index, 'adults', 'increment')}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Çocuk</span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleRoomChange(index, 'children', 'decrement')}>
                        <Minus size={16} />
                      </button>
                      <span>{room.children}</span>
                      <button onClick={() => handleRoomChange(index, 'children', 'increment')}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddRoom}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                + Oda Ekle
              </button>
            </div>
          )}
        </div>

        {/* Ara Butonu */}
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          <Search size={20} />
        </button>
      </div>
    </div>
  );
};

export default SearchForm;
