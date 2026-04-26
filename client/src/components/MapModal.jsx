import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Navigation, Loader2, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom modern marker icon
const customIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class='marker-pin'></div><div class='marker-pulse'></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
});

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapModal = ({ isOpen, onClose, onSelect, initialLocation = {} }) => {
    const [mapSearchText, setMapSearchText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [mapResults, setMapResults] = useState([]);
    const [isLocating, setIsLocating] = useState(false);
    const [currentLocation, setCurrentLocation] = useState({
        lat: initialLocation.lat || 20.5937,
        lng: initialLocation.lng || 78.9629,
        address: initialLocation.address || ''
    });

    useEffect(() => {
        if (initialLocation.lat && initialLocation.lng) {
            setCurrentLocation({
                lat: initialLocation.lat,
                lng: initialLocation.lng,
                address: initialLocation.address || ''
            });
        }
    }, [initialLocation]);

    const handleMapSearch = async (e) => {
        if (e) e.preventDefault();
        if (!mapSearchText.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchText)}&limit=5`);
            const data = await res.json();
            setMapResults(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        updateLocation(lat, lon, result.display_name);
        setMapResults([]);
        setMapSearchText(result.display_name);
    };

    const updateLocation = async (lat, lng, address = null) => {
        let finalAddress = address;
        let town = '';

        if (!finalAddress) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                const data = await response.json();
                finalAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                town = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.municipality || finalAddress.split(',')[0];
            } catch (error) {
                console.error('Error reverse geocoding:', error);
                finalAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            }
        } else {
            // Try to extract town even if address is provided
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                const data = await response.json();
                town = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.municipality || finalAddress.split(',')[0];
            } catch (e) {}
        }

        setCurrentLocation({ lat, lng, address: finalAddress, town });
    };

    const handleLocateMe = async () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await updateLocation(latitude, longitude);
                setIsLocating(false);
            },
            () => {
                alert('Unable to retrieve your location');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
    };

    const LocationPicker = () => {
        const map = useMap();
        useMapEvents({
            click(e) {
                updateLocation(e.latlng.lat, e.latlng.lng);
            },
        });

        useEffect(() => {
            if (currentLocation.lat && currentLocation.lng) {
                map.flyTo([currentLocation.lat, currentLocation.lng], map.getZoom());
            }
        }, [currentLocation.lat, currentLocation.lng, map]);

        return currentLocation.lat && currentLocation.lng ? (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={customIcon} />
        ) : null;
    };

    const UpdateMapCenter = ({ center }) => {
        const map = useMap();
        useEffect(() => {
            if (center[0] && center[1]) {
                map.setView(center, 16);
            }
        }, [center, map]);
        return null;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl h-[85vh] sm:h-[80vh] max-h-[750px] flex flex-col overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center bg-white shrink-0 z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] relative">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Select Location</h2>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">Where do you need the service?</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-all active:scale-95 border border-slate-100"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Search Section */}
                    <div className="px-6 py-4 bg-white shrink-0 z-20 relative shadow-[0_10px_20px_-15px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-4 focus-within:ring-blue-500/15 focus-within:border-blue-500 focus-within:bg-white transition-all h-[50px] group">
                                <div className="pl-4 pr-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={mapSearchText}
                                    onChange={(e) => setMapSearchText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleMapSearch(e)}
                                    placeholder="Search your area or street..."
                                    className="flex-1 w-full bg-transparent border-none text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-400 h-full"
                                />
                                <div className="pr-1.5 flex items-center h-full py-1.5">
                                    <button
                                        type="button"
                                        onClick={handleLocateMe}
                                        disabled={isLocating}
                                        title="Use Current Location"
                                        className="h-full px-3 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 rounded-lg transition-all"
                                    >
                                        {isLocating ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Target size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleMapSearch}
                                disabled={isSearching}
                                className="h-[50px] px-8 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center shadow-lg shadow-blue-600/20"
                            >
                                {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
                            </button>

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {mapResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-6 right-6 sm:right-[115px] mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] z-[1001] overflow-hidden max-h-60 overflow-y-auto"
                                    >
                                        {mapResults.map((result, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectSearchResult(result)}
                                                className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-none group"
                                            >
                                                <MapPin size={16} className="text-slate-300 group-hover:text-blue-600 shrink-0 transition-colors" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{result.display_name.split(',')[0]}</p>
                                                    <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">{result.display_name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Map Section - Full Bleed */}
                    <div className="flex-1 relative bg-slate-100 w-full z-0">
                        <MapContainer
                            center={[currentLocation.lat, currentLocation.lng]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationPicker />
                            <UpdateMapCenter center={[currentLocation.lat, currentLocation.lng]} />
                            <ZoomControl position="topright" />
                        </MapContainer>

                        {/* Top inner gradient shadow for depth */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-900/5 to-transparent pointer-events-none z-[1000]"></div>

                        {/* Bottom Location Card */}
                        <div className="absolute bottom-6 left-0 right-0 z-[1000] pointer-events-none px-4 flex justify-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white p-5 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] pointer-events-auto w-full max-w-[90%] sm:max-w-md border border-slate-100 flex flex-col gap-4"
                            >
                                <div className="flex flex-row items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                        <MapPin size={22} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Selected Address</p>
                                        <p className="text-sm font-bold text-slate-900 leading-snug truncate">
                                            {currentLocation.address || 'Drop a pin on the map'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onSelect(currentLocation)}
                                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                                >
                                    Confirm Destination
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MapModal;
