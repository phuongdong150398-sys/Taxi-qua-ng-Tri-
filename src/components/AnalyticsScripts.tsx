"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getAnalyticsConfig, trackConversionEvent } from "@/lib/analytics";

export default function AnalyticsScripts() {
  const [config, setConfig] = useState({
    gaId: "",
    googleAdsId: "",
    metaPixelId: "",
    tiktokPixelId: "",
  });

  useEffect(() => {
    // Lấy cấu hình từ localStorage hoặc env
    const activeConfig = getAnalyticsConfig();
    setConfig({
      gaId: activeConfig.gaId || process.env.NEXT_PUBLIC_GA_ID || "",
      googleAdsId: activeConfig.googleAdsId || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
      metaPixelId: activeConfig.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
      tiktokPixelId: activeConfig.tiktokPixelId || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
    });

    // Bắn sự kiện Page View tự động
    trackConversionEvent("page_view", {
      path: window.location.pathname,
      title: document.title,
    });
  }, []);

  return (
    <>
      {/* 1. GOOGLE ANALYTICS 4 (GA4) & GOOGLE ADS */}
      {config.gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${config.gaId}`}
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.gaId}', {
                  page_path: window.location.pathname,
                });
                ${config.googleAdsId && config.googleAdsId !== "AW-18493093047" ? `gtag('config', '${config.googleAdsId}');` : ""}
              `,
            }}
          />
        </>
      )}

      {/* 2. FACEBOOK / META PIXEL */}
      {config.metaPixelId && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${config.metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* 3. TIKTOK PIXEL */}
      {config.tiktokPixelId && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${config.tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
