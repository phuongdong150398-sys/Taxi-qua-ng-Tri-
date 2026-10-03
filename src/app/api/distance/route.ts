import { NextResponse } from "next/server";

// Fallback Haversine formula
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;
  // Nhân hệ số uốn khúc đường bộ thực tế ~1.25
  return Math.round(directDistance * 1.25 * 10) / 10;
}

// Geocode string address if coordinates are not supplied
async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const encoded = encodeURIComponent(query + ", Việt Nam");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=vn&limit=1`,
      {
        headers: {
          "User-Agent": "TaxiQuangTriApp/1.0",
        },
        next: { revalidate: 3600 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
    }
  } catch (e) {
    // Ignore geocoding failure
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, originCoords, destCoords } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { success: false, message: "Thiếu điểm đi hoặc điểm đến" },
        { status: 400 }
      );
    }

    let startLat = originCoords?.lat;
    let startLng = originCoords?.lng;
    let endLat = destCoords?.lat;
    let endLng = destCoords?.lng;

    // Geocode if coordinates not present
    if (!startLat || !startLng) {
      const geoOrigin = await geocodeAddress(origin);
      if (geoOrigin) {
        startLat = geoOrigin.lat;
        startLng = geoOrigin.lng;
      }
    }

    if (!endLat || !endLng) {
      const geoDest = await geocodeAddress(destination);
      if (geoDest) {
        endLat = geoDest.lat;
        endLng = geoDest.lng;
      }
    }

    let distanceKm = 0;
    let durationMinutes = 0;
    let routingMethod = "standard";

    if (startLat && startLng && endLat && endLng) {
      // Query OSRM Driving Router for exact road distance & time
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
        const osrmRes = await fetch(osrmUrl, { next: { revalidate: 300 } });
        if (osrmRes.ok) {
          const osrmData = await osrmRes.json();
          if (osrmData.code === "Ok" && osrmData.routes && osrmData.routes.length > 0) {
            const route = osrmData.routes[0];
            distanceKm = Math.round((route.distance / 1000) * 10) / 10;
            durationMinutes = Math.round(route.duration / 60);
            routingMethod = "osrm_realtime";
          }
        }
      } catch (err) {
        // Fallback to Haversine
      }

      // If OSRM was unavailable or returned 0, use Haversine road estimation
      if (distanceKm === 0) {
        distanceKm = calculateHaversineDistanceKm(startLat, startLng, endLat, endLng);
        durationMinutes = Math.round((distanceKm / 45) * 60); // trung bình 45 km/h
        routingMethod = "haversine_road";
      }
    }

    // Nếu không tìm thấy tọa độ, ước lượng mặc định tối thiểu
    if (distanceKm <= 0) {
      distanceKm = 10;
      durationMinutes = 15;
    }

    // Tính giá cước theo bảng giá mới:
    // Mở cửa 20k (cho km đầu), mỗi km tiếp theo: 4 chỗ 12k/km, 6 chỗ 15k/km
    const calcPrice4 = (km: number) => {
      const base = km <= 1 ? 20000 : 20000 + (km - 1) * 12000;
      return Math.round(base / 1000) * 1000;
    };

    const calcPrice6 = (km: number) => {
      const base = km <= 1 ? 20000 : 20000 + (km - 1) * 15000;
      return Math.round(base / 1000) * 1000;
    };

    const price4SeatsOneWay = calcPrice4(distanceKm);
    const price6SeatsOneWay = calcPrice6(distanceKm);

    // Giá 2 chiều (giảm 50% chiều về)
    const price4SeatsRoundTrip = Math.round((price4SeatsOneWay * 1.5) / 1000) * 1000;
    const price6SeatsRoundTrip = Math.round((price6SeatsOneWay * 1.5) / 1000) * 1000;

    return NextResponse.json({
      success: true,
      data: {
        distanceKm,
        durationMinutes,
        routingMethod,
        origin,
        destination,
        pricing: {
          "4-seats": {
            oneWay: price4SeatsOneWay,
            roundTrip: price4SeatsRoundTrip,
            formattedOneWay: price4SeatsOneWay.toLocaleString("vi-VN") + " VNĐ",
            formattedRoundTrip: price4SeatsRoundTrip.toLocaleString("vi-VN") + " VNĐ",
          },
          "6-seats": {
            oneWay: price6SeatsOneWay,
            roundTrip: price6SeatsRoundTrip,
            formattedOneWay: price6SeatsOneWay.toLocaleString("vi-VN") + " VNĐ",
            formattedRoundTrip: price6SeatsRoundTrip.toLocaleString("vi-VN") + " VNĐ",
          },
          "16-seats": {
            oneWay: null,
            roundTrip: null,
            formattedOneWay: "Liên hệ Hotline để nhận báo giá",
            formattedRoundTrip: "Liên hệ Hotline để nhận báo giá",
          },
          "32-seats": {
            oneWay: null,
            roundTrip: null,
            formattedOneWay: "Liên hệ Hotline để nhận báo giá",
            formattedRoundTrip: "Liên hệ Hotline để nhận báo giá",
          },
          "vip-limousine": {
            oneWay: null,
            roundTrip: null,
            formattedOneWay: "Liên hệ Hotline để nhận báo giá VIP",
            formattedRoundTrip: "Liên hệ Hotline để nhận báo giá VIP",
          },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi tính khoảng cách" },
      { status: 500 }
    );
  }
}
