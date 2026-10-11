/**
 * Taxi Quảng Trị - Universal Conversion Tracking & Customer Analytics Engine
 * Hỗ trợ đồng thời: Google Analytics 4 (GA4), Google Ads Conversion, Meta (Facebook) Pixel, TikTok Pixel
 * và Hệ thống phân tích nội bộ (In-House Persona Analytics).
 */

export interface ConversionEventParams {
  category?: string;
  label?: string;
  value?: number;
  currency?: string;
  source?: string;
  position?: string;
  carType?: string;
  route?: string;
  price?: string | number;
  phone?: string;
  [key: string]: any;
}

// Cấu hình mã đo lường (Được lưu trong localStorage hoặc biến môi trường)
export interface AnalyticsConfig {
  gaId?: string; // Google Analytics 4 (VD: G-XXXXXXXXXX)
  googleAdsId?: string; // Google Ads Conversion ID (VD: AW-XXXXXXXXX)
  googleAdsLabel?: string; // Google Ads Conversion Label
  metaPixelId?: string; // Facebook Pixel ID (VD: 123456789012345)
  tiktokPixelId?: string; // TikTok Pixel ID
}

export function getAnalyticsConfig(): AnalyticsConfig {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("site_analytics_config");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18493093047",
    googleAdsLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
  };
}

export function saveAnalyticsConfig(config: AnalyticsConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("site_analytics_config", JSON.stringify(config));
  } catch (e) {}
}

/**
 * Bắn sự kiện chuyển đổi đa kênh (Universal Conversion Dispatcher)
 */
export function trackConversionEvent(
  eventName:
    | "call_hotline"
    | "click_zalo"
    | "submit_booking_form"
    | "calculate_route"
    | "select_car_type"
    | "view_popular_route"
    | "view_pricing"
    | "page_view",
  params: ConversionEventParams = {}
) {
  if (typeof window === "undefined") return;

  const timestamp = new Date().toISOString();
  const pageUrl = window.location.href;
  const referrer = document.referrer || "Direct";
  const userAgent = navigator.userAgent;

  // Thu thập thông tin chiến dịch từ URL (UTM Parameters)
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || (referrer.includes("google") ? "Google" : referrer.includes("facebook") || referrer.includes("fb") ? "Facebook" : referrer.includes("zalo") ? "Zalo" : "Direct");
  const utmMedium = urlParams.get("utm_medium") || "organic";
  const utmCampaign = urlParams.get("utm_campaign") || "default";

  const enrichedParams = {
    ...params,
    page_location: pageUrl,
    page_referrer: referrer,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    timestamp,
  };

  // 1. GỬI SANG GOOGLE ANALYTICS 4 (GA4)
  try {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, enrichedParams);

      // Nếu là sự kiện gửi đơn hoặc gọi điện -> Bắn conversion chuẩn Google
      if (eventName === "submit_booking_form") {
        (window as any).gtag("event", "generate_lead", {
          currency: "VND",
          value: params.value || 0,
          lead_type: "taxi_booking",
        });
      } else if (eventName === "call_hotline" || eventName === "click_zalo") {
        (window as any).gtag("event", "contact", {
          method: eventName === "call_hotline" ? "Phone Call" : "Zalo Chat",
        });
      }
    }
  } catch (e) {}

  // 2. GỬI SANG GOOGLE ADS CONVERSION
  try {
    const config = getAnalyticsConfig();
    if (config.googleAdsId && typeof (window as any).gtag === "function") {
      if (eventName === "call_hotline" || eventName === "submit_booking_form" || eventName === "click_zalo") {
        (window as any).gtag("event", "conversion", {
          send_to: config.googleAdsLabel ? `${config.googleAdsId}/${config.googleAdsLabel}` : config.googleAdsId,
          value: params.value || 0,
          currency: "VND",
        });
      }
    }
  } catch (e) {}

  // 3. GỬI SANG FACEBOOK / META PIXEL
  try {
    if (typeof (window as any).fbq === "function") {
      if (eventName === "submit_booking_form") {
        (window as any).fbq("track", "Lead", {
          content_name: params.route || "Đặt xe Taxi Quảng Trị",
          currency: "VND",
          value: params.value || 0,
        });
      } else if (eventName === "call_hotline" || eventName === "click_zalo") {
        (window as any).fbq("track", "Contact", {
          content_category: eventName,
          content_name: params.position || "Nút liên hệ",
        });
      } else {
        (window as any).fbq("trackCustom", eventName, enrichedParams);
      }
    }
  } catch (e) {}

  // 4. GỬI SANG TIKTOK PIXEL
  try {
    if (typeof (window as any).ttq?.track === "function") {
      if (eventName === "submit_booking_form") {
        (window as any).ttq.track("SubmitForm", {
          contents: [{ content_name: params.route || "Taxi Booking" }],
          value: params.value || 0,
          currency: "VND",
        });
      } else if (eventName === "call_hotline" || eventName === "click_zalo") {
        (window as any).ttq.track("Contact");
      }
    }
  } catch (e) {}

  // 5. LƯU VÀO HỆ THỐNG PHÂN TÍCH NỘI BỘ (IN-HOUSE ANALYTICS ENGINE)
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        params: enrichedParams,
        userAgent,
      }),
    }).catch(() => {});
  } catch (e) {}
}
