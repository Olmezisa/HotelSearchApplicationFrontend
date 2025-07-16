import React, { useRef } from 'react';
import SearchForm from './SearchForm';
import { Sparkles } from 'lucide-react';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const holidayThemes = [
  { name: 'Butik Oteller', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/b7/d2/b3/tuvana-hotel-main-1.jpg?w=1800&h=1000&s=1' },
  { name: 'Balayı Otelleri', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/9c/66/8d/h2o-underwater-experience.jpg?w=1400&h=-1&s=1' },
  { name: 'Bungalov Oteller', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG9vVhvZaHs7ct0IFwF62K8EMsHBh98kf-6Q&s' },
  { name: 'Denize Sıfır Oteller', image: 'https://images.etstur.com/imgproxy/files/images/hotelImages/TR/50048/l/Azura-Deluxe-Resort---Spa-Genel-251788.jpg' },
  { name: 'Kayak Otelleri', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScunobpQHwE5wDwB36iZSweo30b5zbC01uPQ&s' },
  { name: 'Disneyland', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/571810091.jpg?k=d5c668f695a04853b9b681f6310711cc8b817c5c074e1ec94cdad9e6c3a8420c&o=&hp=1' },
];

const hotels = [
  { name: 'Antalya Hilton', location: 'Antalya, Türkiye', price: '₺1.500 / gece', image: 'https://assets.hiltonstatic.com/.../Hilton-Istanbul-Otel-Giris-Aksam-02.jpg' },
  { name: 'Deluxe Resort', location: 'Muğla, Türkiye', price: '₺2.000 / gece', image: 'https://assets.kerzner.com/api/public/content/...t=w2880' },
  { name: 'Lake View Hotel', location: 'İzmir, Türkiye', price: '₺1.250 / gece', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/37/40/eb/ja-lake-view-hotel.jpg?w=1200&h=-1&s=1' },
  { name: 'Cappadocia Cave Suites', location: 'Nevşehir, Türkiye', price: '₺1.800 / gece', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSA37mJ4WAOnDu-g7ecoWjQLQMURYh7DDsctA&s' },
  { name: 'Palazzo Cordusio Gran Melia', location: 'Milano, İtalya', price: '₺46.800 / gece', image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/692515919.jpg?...' },
  { name: 'The Dilly', location: 'Londra, Birleşik Krallık', price: '₺15.000 / gece', image: 'https://www.globalmousetravels.com/wp-content/uploads/2021/08/The-Dilly-Hotel-London-28.jpg' },
];

const HomePage = ({ onSearch }) => {
  const scrollRef = useRef(null);
  const scroll = (offset) => {
    scrollRef.current.scrollLeft += offset;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafc]">
      <section
        className="relative bg-cover bg-center min-h-[60vh] flex items-center justify-center p-4 w-full"
        style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8gB0U3PRsd4pV5B6MSowCDw-NVKjfWhkj1A&s')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
        <div className="relative z-10 w-full text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-300 animate-pulse" size={24} />
            <span className="text-yellow-300">Mükemmel Konaklamanızı Bulun</span>
            <Sparkles className="text-yellow-300 animate-pulse" size={24} />
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Dünya genelinde lüks otelleri en iyi fiyatlarla keşfedin.</p>
          <div className="w-full max-w-4xl mx-auto bg-[#1f1f1fcc] backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
            <SearchForm onSearch={onSearch} />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-extrabold text-center text-[#3e3c61] mb-10">Popüler Tatil Temaları</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {holidayThemes.map((hotel, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl shadow-lg border border-[#d4c1ec] hover:scale-105 transition-transform duration-300">
              <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
              <div className="p-4 text-center bg-white">
                <h3 className="font-semibold text-[#3e3c61] text-lg">{hotel.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#3e3c61]">Popüler Oteller</h2>
          <p className="text-sm text-gray-500 mt-1">Sizin için seçilen popüler oteller</p>
        </div>
        <button onClick={() => scroll(-300)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#3e3c61] p-2 rounded-full shadow hidden md:flex">
          <MdArrowBackIos />
        </button>
        <button onClick={() => scroll(300)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#3e3c61] p-2 rounded-full shadow hidden md:flex">
          <MdArrowForwardIos />
        </button>
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide">
          {hotels.map((hotel, index) => (
            <div key={index} className="min-w-[250px] max-w-sm bg-white border border-[#d4c1ec] rounded-2xl shadow hover:shadow-xl hover:scale-[1.03] transition-all duration-300 snap-center">
              <img src={hotel.image} alt={hotel.name} loading="lazy" className="w-full h-40 object-cover rounded-t-2xl" />
              <div className="p-4">
                <h3 className="font-bold text-lg text-[#3e3c61]">{hotel.name}</h3>
                <p className="text-gray-500">{hotel.location}</p>
                <p className="font-semibold text-[#3e3c61] mt-2">{hotel.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

     
    </div>
  );
};

export default HomePage;
