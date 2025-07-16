import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { FacilityIcon } from '../common/FacilityIcon';

export const HotelDetail = ({ hotel, onBack }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-[#1a1b3e] via-[#2d2f5f] to-[#3e3c61] min-h-screen font-inter text-white">
      <button
        onClick={onBack}
        className="mb-6 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Arama Sonuçlarına Geri Dön
      </button>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <img
            src={
              hotel.seasons?.[0]?.mediaFiles?.[0]?.urlFull ||
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
            }
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex items-center text-lg mb-2">
              <span>{hotel.city?.name ? `${hotel.city.name}, ` : ''}{hotel.country?.name || 'Konum belirtilmemiş'}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 text-[#3e3c61]">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3e3c61] via-[#5a4fcf] to-[#6b5ce7] bg-clip-text text-transparent mb-4">
            Otel Açıklaması
          </h2>

          {/* Otel Açıklamaları */}
          {hotel.seasons?.[0]?.textCategories?.map(cat => (
            <div key={cat.name} className="mb-6">
              <h3 className="text-xl font-bold text-[#3e3c61] mb-2">
                {cat.name}
              </h3>
              <div
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: cat.presentations?.[0]?.text || ''
                }}
              />
            </div>
          ))}

          {/* Fotoğraf Galerisi */}
          {hotel.seasons?.[0]?.mediaFiles?.length > 0 && (
            <>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3e3c61] via-[#5a4fcf] to-[#6b5ce7] bg-clip-text text-transparent mb-4">
                Fotoğraf Galerisi
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {hotel.seasons[0].mediaFiles.slice(0, 8).map((media, index) => (
                  <img
                    key={index}
                    src={media.urlFull}
                    alt={`${hotel.name} ${index + 1}`}
                    className="w-full h-40 object-cover rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                  />
                ))}
              </div>
            </>
          )}

          {/* Olanaklar */}
          {hotel.seasons?.[0]?.facilityCategories?.length > 0 && (
            <>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3e3c61] via-[#5a4fcf] to-[#6b5ce7] bg-clip-text text-transparent mb-4">
                Olanaklar
              </h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {hotel.seasons[0].facilityCategories
                  .flatMap(cat => cat.facilities)
                  .slice(0, 15)
                  .map(facility => (
                    <span
                      key={facility.id}
                      className="px-4 py-2 bg-[#f0f0ff] text-[#3e3c61] text-sm rounded-full border border-[#d4c1ec] flex items-center gap-2"
                    >
                      <FacilityIcon name={facility.name} />
                      {facility.name}
                    </span>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
