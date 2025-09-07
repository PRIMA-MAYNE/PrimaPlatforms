import React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  srcLocal?: string;
  cdnFallbackSmall?: string;
}

export const Logo: React.FC<LogoProps> = ({
  srcLocal = "/catalyst-logo.svg",
  cdnFallbackSmall = "https://cdn.builder.io/api/v1/image/assets%2Fb0ce78c613014eb194e6c86c886e717d%2F8a8e0cb23614495a9f5637c129cc7c00?format=webp&width=192",
  alt = "Catalyst",
  className,
  ...props
}) => {
  const [src, setSrc] = React.useState<string>(srcLocal);
  const triedFallback = React.useRef(false);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (!triedFallback.current) {
          triedFallback.current = true;
          setSrc(cdnFallbackSmall);
        }
      }}
      {...props}
    />
  );
};

export default Logo;
