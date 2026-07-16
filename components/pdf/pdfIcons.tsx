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

export function IconNit({ color, size = 9 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M2 5h20v14H2V5Z" fill="none" stroke={color} strokeWidth={2} />
      <Circle cx={7.5} cy={11} r={2} fill="none" stroke={color} strokeWidth={1.5} />
      <Path d="M4.5 16.5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" fill="none" stroke={color} strokeWidth={1.5} />
      <Path d="M13.5 9.5h6M13.5 12.5h6M13.5 15.5h4" fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function IconFabricacion({ color, size = 16 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Circle cx={7} cy={7} r={2.2} fill="none" stroke={color} strokeWidth={1.6} />
      <Circle cx={17} cy={7} r={2.2} fill="none" stroke={color} strokeWidth={1.6} />
      <Circle cx={12} cy={17} r={2.2} fill="none" stroke={color} strokeWidth={1.6} />
      <Path d="M8.7 8.3 11 15M15.3 8.3 13 15M9 7h6" fill="none" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconInstalacion({ color, size = 16 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Circle cx={12} cy={9} r={3} fill="none" stroke={color} strokeWidth={1.6} />
      <Path
        d="M12 2v2.2M12 13.8V16M5.6 5.6l1.6 1.6M15.8 7.2l1.6-1.6M5.6 12.4l1.6-1.6M15.8 10.8l1.6 1.6"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
      <Path d="M8 20c1.3-1.3 2.7-2 4-2s2.7.7 4 2" fill="none" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconMantenimiento({ color, size = 16 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M14.7 6.3a4 4 0 0 1-5.4 5.2L4 16.8l2 2 5.3-5.3a4 4 0 0 1 5.2-5.4l-2.6 2.6-1.9-1.9 2.7-2.5Z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
    </Svg>
  );
}

export function IconEstructuras({ color, size = 16 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M4 20V9l8-5 8 5v11H4Z" fill="none" stroke={color} strokeWidth={1.6} />
      <Path d="M4 9h16M12 4v16M8 9v11M16 9v11" fill="none" stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}

export function IconEscudo({ color, size = 9 }: PdfIconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M12 2 20 5v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3Z"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M8.5 12 11 14.5 15.5 9" fill="none" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
