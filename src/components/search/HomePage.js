// src/components/search/HomePage.jsx
import React from 'react';
import SearchForm from './SearchForm';

const HomePage = () => {
  const themes = [
    {
      name: "Butik Oteller",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Balayı Otelleri",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Sahil Otelleri",
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop"
    },
  ];

  return (
    <div>
      {/* === HERO ALANI === */}
      <div
        className="relative bg-cover bg-center rounded-2xl overflow-visible min-h-[600px] flex items-center justify-center p-4"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1920&auto=format&fit=crop')"
        }}
      >
        {/* Karartma efekti */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* İçerik */}
        <div className="relative z-10 w-full max-w-5xl text-center text-white overflow-visible">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Seyahat Etmeye Hazır Mısın?
          </h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow-md">
            Hayalini kurduğun tatil burada başlıyor! En düşük fiyatlarla otel rezervasyonunu yap.
          </p>

          {/* Arama Formu */}
          <div className="w-full px-4 md:px-0 relative z-50 overflow-visible">
            <SearchForm />
          </div>
        </div>
      </div>

      {/* === POPÜLER TEMALAR === */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Popüler Tatil Temaları
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
          {themes.map((theme, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden shadow-lg group transform hover:-translate-y-2 transition-transform duration-300"
            >
              <img
                src={theme.image}
                alt={theme.name}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white">{theme.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
