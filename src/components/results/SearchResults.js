import React from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { StarRating } from '../common/StarRating';

export const SearchResults = ({ results, onHotelSelect, currency }) => (
  <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-[#1a1b3e] via-[#2d2f5f] to-[#3e3c61] min-h-screen font-inter">
    <div className="mb-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-2">
        Arama Sonuçları
      </h2>
      <p className="text-sm text-gray-300">
        {results.length > 0
          ? `${results.length} otel bulundu`
          : 'Sonuç bulunamadı'}
      </p>
    </div>

    {results.length === 0 ? (
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 text-center">
        <h3 className="text-xl font-semibold text-[#3e3c61] mb-2">
          Otel Bulunamadı
        </h3>
        <p className="text-gray-600">
          Bu kriterlere uygun otel bulunamadı. Lütfen arama kriterlerinizi
          değiştirerek tekrar deneyin.
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {results.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => onHotelSelect(hotel.id)}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden hover:bg-white/98"
          >
            <div className="flex flex-col md:flex-row">
              {/* Otel Görseli */}
              <div className="md:w-80 w-full h-64 md:h-56 relative overflow-hidden">
                <img
                  src={
                    hotel.thumbnailFull ||
                    'https://placehold.co/800x600/e2e8f0/e2e8f0?text=Otel'
                  }
                  alt={hotel.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/30">
                  {hotel.stars ? (
                    <StarRating stars={hotel.stars} />
                  ) : (
                    <span className="text-xs text-gray-500">Puan yok</span>
                  )}
                </div>
              </div>

              {/* Otel Bilgileri */}
              <div className="flex-grow p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3e3c61] via-[#5a4fcf] to-[#6b5ce7] bg-clip-text text-transparent mb-2 hover:from-[#5a4fcf] hover:via-[#6b5ce7] hover:to-[#7c6bff] transition-all duration-300">
                    {hotel.name}
                  </h3>

                  <div className="flex items-center text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {hotel.city?.name
                        ? `${hotel.city.name}, `
                        : ''}
                      {hotel.country?.name || 'Konum belirtilmemiş'}
                    </span>
                  </div>

                  {/* Otel Özellikleri */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-[#f0f0ff] to-[#e6e6ff] text-[#3e3c61] text-xs rounded-full border border-[#d4c1ec] shadow-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full border border-gray-300">
                          +{hotel.amenities.length - 3} diğer
                        </span>
                      )}
                    </div>
                  )}

                  {/* Müsaitlik */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">
                      Müsait
                    </span>
                  </div>
                </div>

                {/* Fiyat ve Detay Butonu */}
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">
                      gecelik en iyi fiyat
                    </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-[#3e3c61] via-[#5a4fcf] to-[#6b5ce7] bg-clip-text text-transparent">
                      {hotel.offers?.[0]?.price?.amount
                        ? hotel.offers[0].price.amount.toFixed(2)
                        : '0.00'}{' '}
                      {currency}
                    </span>
                    <span className="text-xs text-gray-400">
                      vergiler dahil
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="bg-gradient-to-r from-[#3e3c61] via-[#5a4fcf] to-[#6b5ce7] text-white px-6 py-3 rounded-xl hover:from-[#5a4fcf] hover:via-[#6b5ce7] hover:to-[#7c6bff] transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                      <span>Detayları Gör</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
