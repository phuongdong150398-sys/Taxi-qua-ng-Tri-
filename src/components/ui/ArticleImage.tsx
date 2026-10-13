"use client";

import { useState, useEffect, useMemo } from "react";
import { DEFAULT_FALLBACK_IMAGE, getVerifiedImageForTopic } from "@/lib/verifiedImages";

interface ArticleImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function ArticleImage({
  src,
  alt,
  className = "",
  fallbackSrc,
}: ArticleImageProps) {
  // Tự động phân tích nội dung chú thích (alt) để chọn ảnh dự phòng tương ứng (ẩm thực, hang động, taxi...)
  const smartFallback = useMemo(() => {
    if (fallbackSrc && fallbackSrc !== DEFAULT_FALLBACK_IMAGE) {
      return fallbackSrc;
    }
    return getVerifiedImageForTopic("", alt, 0) || DEFAULT_FALLBACK_IMAGE;
  }, [fallbackSrc, alt]);

  const [currentSrc, setCurrentSrc] = useState(src || smartFallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || smartFallback);
    setHasError(false);
  }, [src, smartFallback]);

  return (
    <img
      src={currentSrc || smartFallback}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(smartFallback);
        }
      }}
    />
  );
}
