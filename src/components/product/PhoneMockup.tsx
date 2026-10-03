import type { TouchEventHandler } from "react";

type PhoneMockupProps = {
  alt: string;
  direction: "next" | "previous";
  label: string;
  onImageLoad: () => void;
  onTouchEnd: TouchEventHandler<HTMLDivElement>;
  onTouchStart: TouchEventHandler<HTMLDivElement>;
  priority: boolean;
  src: string;
};

export function PhoneMockup({
  alt,
  direction,
  label,
  onImageLoad,
  onTouchEnd,
  onTouchStart,
  priority,
  src,
}: PhoneMockupProps) {
  return (
    <figure className="phone-shell" aria-label={`${label} app preview`}>
      <div
        className="phone-screen"
        onTouchEnd={onTouchEnd}
        onTouchStart={onTouchStart}
      >
        <img
          key={src}
          className="phone-screen-image"
          data-direction={direction}
          src={src}
          alt={alt}
          width={944}
          height={2048}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable="false"
          onLoad={onImageLoad}
        />
      </div>
    </figure>
  );
}
