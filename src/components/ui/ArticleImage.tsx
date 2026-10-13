"use client";

import { useState, useEffect } from "react";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/verifiedImages";

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
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
}: ArticleImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <img
      src={currentSrc || fallbackSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
