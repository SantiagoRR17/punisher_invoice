import { Svg, Path, Circle } from "@react-pdf/renderer";

interface PdfIconProps {
  color: string;
  size?: number;
}

export function IconDireccion({ color, size = 9 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx={12} cy={10} r={2.5} fill={color} />
    </Svg>
  );
}

export function IconTelefono({ color, size = 9 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M4 4c0-1.1.9-2 2-2h2.5c.5 0 .9.3 1 .8l1 4c.1.5-.1 1-.5 1.3L8.3 9.4c1.2 2.6 3.3 4.7 5.9 5.9l1.3-1.7c.3-.4.8-.6 1.3-.5l4 1c.5.1.8.5.8 1V18c0 1.1-.9 2-2 2h-1C10.6 20 4 13.4 4 5V4Z"
        fill={color}
      />
    </Svg>
  );
}

export function IconCorreo({ color, size = 9 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M3 5h18v14H3V5Z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Path d="M3.5 5.5 12 12l8.5-6.5" fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function IconFecha({ color, size = 9 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M4 5h16v15H4V5Z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Path d="M4 9.5h16" fill="none" stroke={color} strokeWidth={2} />
      <Path d="M8 2.5v4M16 2.5v4" fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
