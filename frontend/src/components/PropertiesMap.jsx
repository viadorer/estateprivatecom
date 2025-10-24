import { useEffect, useRef, useState } from 'react'
import { MapPin, X } from 'lucide-react'

const MAPY_API_KEY = 'MTIdGpXVtxteHwipIwRw1MyH8f4IWYNgTyppp75Vp54'

export default function PropertiesMap({ properties, onPropertyClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [selectedProperty, setSelectedProperty] = useState(null)

  useEffect(() => {
    // Globální funkce pro otevření detailu z popup
    window.openPropertyDetail = (propertyId) => {
      const property = properties.find(p => p.id === propertyId)
      if (property && onPropertyClick) {
        onPropertyClick(property)
      }
    }

    // Načíst Leaflet.js
    if (!window.L) {
      // Přidat CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      // Přidat JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && properties.length > 0) {
      updateMarkers()
    }
  }, [properties])

  const initMap = () => {
    if (!mapRef.current || !window.L) return

    // Vytvořit Leaflet mapu
    const map = window.L.map(mapRef.current).setView([50.0755, 14.4378], 11)

    // Přidat Mapy.cz dlaždice přes REST API
    window.L.tileLayer(`https://api.mapy.cz/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${MAPY_API_KEY}`, {
      minZoom: 0,
      maxZoom: 19,
      attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    }).addTo(map)

    mapInstanceRef.current = map

    // Přidat markery pokud už jsou properties
    if (properties.length > 0) {
      updateMarkers()
    }
  }

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return

    const map = mapInstanceRef.current

    // Odstranit staré markery
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const bounds = []

    // Přidat markery pro každou nemovitost
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return

      const latLng = [property.latitude, property.longitude]
      bounds.push(latLng)

      // Vytvořit marker - jednoduchý pin
      const priceIcon = window.L.divIcon({
        className: 'custom-price-marker',
        html: `
          <div style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 600;
            color: #667eea;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
            white-space: nowrap;
            cursor: pointer;
          ">
            ${formatPrice(property.price)} Kč
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      })

      // Vytvořit popup kartičku - glass morphism styl
      const popupContent = `
        <div style="
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px;
          min-width: 280px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        ">
          <h3 style="
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">
            ${property.title || 'Nemovitost'}
          </h3>
          <div style="margin-bottom: 12px; color: #6b7280; font-size: 14px;">
            ${property.city}${property.district ? ', ' + property.district : ''}
          </div>
          <div style="
            margin-bottom: 16px;
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">
            ${new Intl.NumberFormat('cs-CZ').format(property.price)} Kč
          </div>
          <div style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 16px;
            font-size: 13px;
          ">
            <div style="
              background: rgba(102, 126, 234, 0.1);
              padding: 8px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="color: #667eea; font-weight: 600;">${property.area} m²</div>
              <div style="color: #9ca3af; font-size: 11px;">Plocha</div>
            </div>
            <div style="
              background: rgba(102, 126, 234, 0.1);
              padding: 8px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="color: #667eea; font-weight: 600;">${property.rooms}</div>
              <div style="color: #9ca3af; font-size: 11px;">Pokoje</div>
            </div>
          </div>
          <button onclick="window.openPropertyDetail(${property.id})" style="
            width: 100%;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
            backdrop-filter: blur(10px);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px 16px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            Zobrazit detail
          </button>
        </div>
      `

      // Vytvořit marker
      const marker = window.L.marker(latLng, { icon: priceIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        })
        .on('click', () => {
          setSelectedProperty(property)
        })

      markersRef.current.push(marker)
    })

    // Přizpůsobit zoom aby byly vidět všechny markery
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + ' mil'
    }
    return new Intl.NumberFormat('cs-CZ', { 
      maximumFractionDigits: 0 
    }).format(price)
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Info popup při výběru nemovitosti */}
      {selectedProperty && (
        <div className="absolute top-4 right-4 glass-card p-4 max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900">{selectedProperty.title}</h3>
            <button
              onClick={() => setSelectedProperty(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>{selectedProperty.city}</span>
            </div>
            <div className="font-bold text-primary-600">
              {new Intl.NumberFormat('cs-CZ').format(selectedProperty.price)} Kč
            </div>
            <div className="text-gray-600">
              {selectedProperty.area} m² • {selectedProperty.rooms} pokoje
            </div>
          </div>
          <button
            onClick={() => onPropertyClick && onPropertyClick(selectedProperty)}
            className="mt-3 w-full glass-button rounded-full text-sm py-2"
          >
            Zobrazit detail
          </button>
        </div>
      )}

      {/* Info o počtu nemovitostí */}
      <div className="absolute bottom-4 left-4 glass-card px-4 py-2 z-10">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary-600" />
          <span className="font-semibold">{properties.length} nemovitostí</span>
        </div>
      </div>
    </div>
  )
}
