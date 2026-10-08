"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Navigation, Check, Crosshair, Sparkles } from "lucide-react";

export interface PlaceItem {
  name: string;
  address: string;
  shortName?: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPlace?: (place: PlaceItem) => void;
  placeholder: string;
  labelIconColor?: string;
  required?: boolean;
  showGpsButton?: boolean;
}

export default function AddressAutocompleteInput({
  value,
  onChange,
  onSelectPlace,
  placeholder,
  labelIconColor = "text-emerald-400",
  required = false,
  showGpsButton = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setIsOpen(true);
      }
    } catch (e) {
      // Ignore network errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length >= 1) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(text);
      }, 250);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (value.trim().length >= 1) {
      fetchSuggestions(value);
    } else {
      fetchSuggestions(""); // show default popular places
    }
  };

  const handleSelect = (item: PlaceItem) => {
    const chosenAddress = item.name || item.address;
    onChange(chosenAddress);
    if (onSelectPlace) {
      onSelectPlace({ ...item, name: chosenAddress });
    }
    setIsOpen(false);
  };

  const handleSelectCustomTypedAddress = () => {
    if (!value.trim()) return;
    if (onSelectPlace) {
      onSelectPlace({
        name: value.trim(),
        address: value.trim(),
      });
    }
    setIsOpen(false);
  };

  // GPS 1-Chạm: Lấy tọa độ GPS và dịch thành số nhà / tên đường chi tiết
  const handleGpsLocate = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Thiết bị hoặc trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }

    setIsGpsLocating(true);
    setGpsSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/places?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.place) {
              const fullAddr = data.place.name || data.place.address;
              onChange(fullAddr);
              if (onSelectPlace) {
                onSelectPlace(data.place);
              }
              setIsOpen(false);
              setGpsSuccessMsg("Đã định vị chính xác vị trí của bạn!");
              setTimeout(() => setGpsSuccessMsg(null), 4000);
            }
          }
        } catch (err) {
          console.error("GPS Reverse Geocoding Error:", err);
          alert("Lỗi khi chuyển đổi tọa độ GPS sang địa chỉ. Bạn hãy nhập tay số nhà nhé!");
        } finally {
          setIsGpsLocating(false);
        }
      },
      (error) => {
        setIsGpsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("Vui lòng cho phép truy cập 'Vị trí' (Location) trên trình duyệt để tự động lấy địa chỉ điểm đón!");
        } else {
          alert("Không thể dò được vị trí GPS. Vui lòng nhập địa chỉ của bạn bằng tay.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${labelIconColor}`}>
          <MapPin className="w-4 h-4" />
        </div>

        <input
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full bg-[#040E1C] border border-[#133863] focus:border-amber-400 rounded-xl pl-10 ${
            showGpsButton ? "pr-24" : "pr-9"
          } py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner font-medium`}
          autoComplete="off"
        />

        {/* Action icons on right: Loading & GPS 1-Touch Button */}
        <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-1">
          {isLoading && (
            <div className="text-amber-400 pr-1">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}

          {showGpsButton && (
            <button
              type="button"
              onClick={handleGpsLocate}
              disabled={isGpsLocating}
              title="Bấm để tự động lấy vị trí GPS chính xác nơi bạn đang đứng"
              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 hover:text-white"
            >
              {isGpsLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Đang dò...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vị trí</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* GPS Success Feedback Toast */}
      {gpsSuccessMsg && (
        <div className="mt-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{gpsSuccessMsg}</span>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (suggestions.length > 0 || value.trim().length >= 2) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0B2240] border border-[#133863] rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-[#133863]/60 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 bg-[#07172C] text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Gợi ý địa chỉ bản đồ</span>
            <span className="text-amber-400 font-semibold">Tọa độ GPS chuẩn</span>
          </div>

          {/* Option 1: Dùng chính xác địa chỉ khách tự gõ */}
          {value.trim().length >= 2 && (
            <button
              type="button"
              onClick={handleSelectCustomTypedAddress}
              className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 bg-amber-950/30 hover:bg-amber-900/50 transition group cursor-pointer border-b border-amber-500/30"
            >
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-amber-300 group-hover:text-amber-200">
                  Dùng địa chỉ đã nhập: &quot;{value}&quot;
                </div>
                <div className="text-[11px] text-amber-400/80 mt-0.5">
                  ✓ Bác tài sẽ đến đón tận nơi đúng theo số nhà / vị trí này
                </div>
              </div>
            </button>
          )}

          {/* Option 2: Danh sách địa chỉ gợi ý từ bản đồ */}
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-[#133863] transition group cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300">
                  {item.name}
                </div>
                {item.address && item.address !== item.name && (
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.address}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
