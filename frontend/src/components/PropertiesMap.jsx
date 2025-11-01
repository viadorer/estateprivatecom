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
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 600;
            color: #3182ce;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            white-space: nowrap;
            cursor: pointer;
          ">
            ${property.presentation?.priceLabel || formatPrice(property.price)}
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      })

      const getTransactionLabel = (type) => {
        return type === 'sale' ? 'Prodej' : 'Pronájem'
      }

      const getPropertyTypeLabel = (type) => {
        const labels = {
          'flat': 'Byt',
          'house': 'Dům',
          'land': 'Pozemek',
          'commercial': 'Komerční'
        }
        return labels[type] || 'Nemovitost'
      }

      const getTransactionIconSVG = (type) => {
        if (type === 'sale') {
          return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><polyline points="17 5 12 1 7 5"></polyline><polyline points="7 19 12 23 17 19"></polyline></svg>'
        } else {
          return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
        }
      }

      const getPropertyIconSVG = (type) => {
        switch(type) {
          case 'flat':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>'
          case 'house':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
          case 'land':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>'
          case 'commercial':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>'
          default:
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'
        }
      }

      // Vytvořit popup kartičku - minimalistický styl
      const popupContent = `
        <div style="
          background: white;
          border-radius: 12px;
          padding: 16px;
          min-width: 260px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        ">
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            line-height: 1.3;
          ">
            ${property.presentation?.headline || property.title || 'Nemovitost'}
          </h3>
          <div style="
            margin-bottom: 12px;
            color: #6b7280;
            font-size: 13px;
          ">
            ${property.presentation?.secondary || [property.city, property.district].filter(Boolean).join(', ')}
          </div>
          <div style="
            margin-bottom: 12px;
            font-size: 20px;
            font-weight: 700;
            color: #3182ce;
          ">
            ${property.presentation?.priceLabel || new Intl.NumberFormat('cs-CZ').format(property.price) + ' Kč'}
          </div>
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 14px;
          ">
            ${[...(property.presentation?.list?.highlights || []), ...(property.presentation?.gridBadges || [])]
              .slice(0, 4)
              .map(badge => `
                <span style="
                  background: #ede9fe;
                  color: #5b21b6;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 500;
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                ">${badge}</span>
              `)
              .join('')}
            ${property.presentation?.gridFacts?.slice(0, 2)?.map(fact => `
              <span style="
                background: #dbeafe;
                color: #1e40af;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
              ">${fact}</span>
            `).join('')}
          </div>
          <button onclick="window.openPropertyDetail(${property.id})" style="
            width: 100%;
            background: #7c3aed;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-weight: 500;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
          " onmouseover="this.style.background='#6d28d9'" onmouseout="this.style.background='#7c3aed'">
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
      
      {/* Info o počtu nemovitostí */}
      <div className="absolute bottom-4 left-4 z-10">
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '10px 16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin className="w-5 h-5" style={{ color: '#7c3aed' }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827'
          }}>{properties.length} nemovitostí</span>
        </div>
      </div>
    </div>
  )
}
