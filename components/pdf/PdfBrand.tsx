import { View, Text, Svg, Path, Image, StyleSheet, Font } from "@react-pdf/renderer";
import {
  PANEL_VIEWBOX_WIDTH,
  PANEL_BASELINE_X,
  PANEL_DIAGONAL_SKEW,
  buildLeftPanelPath,
  buildRightPanelPath,
  buildPanelDividerStrokePath,
  buildWaveRibbonPath,
  buildBelowRibbonMaskPath,
} from "./pdfWave";
import {
  IconDireccion,
  IconTelefono,
  IconCorreo,
  IconFecha,
  IconFabricacion,
  IconInstalacion,
  IconMantenimiento,
  IconEstructuras,
  IconEscudo,
} from "./pdfIcons";

// Evita que @react-pdf/renderer parta palabras largas con un guion a mitad
// de línea (ej. "ERICK JU-LIAN"); solo se ajusta por espacios.
Font.registerHyphenationCallback((word) => [word]);

export const HEADER_ZONE_HEIGHT = 150;

export const COLORS = {
  dark: "#1b2a31",
  accent: "#215866",
  yellow: "#f2b705",
  textMuted: "#4b5b62",
  metal: "#e8e9ea",
};

export const TABLE_ROW_LIGHT = "#fefefe";
export const TABLE_ROW_ALT = "#edeef0";

export function tableRowBackground(index: number): string {
  return index % 2 === 0 ? TABLE_ROW_LIGHT : TABLE_ROW_ALT;
}

export const EMPRESA = {
  nombre: "EL TALLER DEL SOLDADOR",
  taglineLinea1: "SOLUCIONES METÁLICAS",
  taglineLinea2: "CON CALIDAD, FUERZA Y COMPROMISO",
  taglineFooter: "CALIDAD EN CADA UNIÓN, COMPROMISO EN CADA PROYECTO",
  direccion: "Calle 75 N° 78-56, Bogotá DC – Colombia",
  telefono: "322 200 3921",
  correo: "erickjulian.for@gmail.com",
  titular: "ERICK JULIAN DUEÑAS FORERO",
};

const SERVICIOS = [
  { Icon: IconFabricacion, texto: "FABRICACIÓN\nA MEDIDA" },
  { Icon: IconInstalacion, texto: "INSTALACIÓN\nPROFESIONAL" },
  { Icon: IconMantenimiento, texto: "MANTENIMIENTO\nINDUSTRIAL" },
  { Icon: IconEstructuras, texto: "ESTRUCTURAS\nMETÁLICAS" },
] as const;

export function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(fecha)
    .toUpperCase();
}

const LEFT_PANEL_PATH_D = buildLeftPanelPath(HEADER_ZONE_HEIGHT, PANEL_BASELINE_X, PANEL_DIAGONAL_SKEW);
const RIGHT_PANEL_PATH_D = buildRightPanelPath(
  PANEL_VIEWBOX_WIDTH,
  HEADER_ZONE_HEIGHT,
  PANEL_BASELINE_X,
  PANEL_DIAGONAL_SKEW
);
const DIVIDER_STROKE_PATH_D = buildPanelDividerStrokePath(
  HEADER_ZONE_HEIGHT,
  PANEL_BASELINE_X,
  PANEL_DIAGONAL_SKEW
);

const HEADER_WAVE_BASELINE = HEADER_ZONE_HEIGHT - 13;
const HEADER_WAVE_THICKNESS = 7;
const HEADER_WAVE_AMPLITUDE = 4;
const HEADER_WAVE_RIBBON_PATH_D = buildWaveRibbonPath(
  PANEL_VIEWBOX_WIDTH,
  HEADER_WAVE_BASELINE,
  HEADER_WAVE_THICKNESS,
  HEADER_WAVE_AMPLITUDE,
  1
);
const HEADER_WAVE_MASK_PATH_D = buildBelowRibbonMaskPath(
  PANEL_VIEWBOX_WIDTH,
  HEADER_ZONE_HEIGHT,
  HEADER_WAVE_BASELINE + HEADER_WAVE_THICKNESS,
  HEADER_WAVE_AMPLITUDE,
  1
);

const styles = StyleSheet.create({
  headerZone: {
    height: HEADER_ZONE_HEIGHT,
    position: "relative",
  },
  headerSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: HEADER_ZONE_HEIGHT,
  },
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: HEADER_ZONE_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  leftPanel: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 10,
  },
  logo: { width: 108, height: 108, marginRight: 8 },
  companyName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: COLORS.dark },
  companyTaglineLinea1: { fontSize: 6.5, color: COLORS.accent, marginTop: 3, fontFamily: "Helvetica-Bold" },
  companyTaglineLinea2: { fontSize: 6, color: COLORS.textMuted, marginTop: 1, maxWidth: 140 },
  rightPanel: {
    width: "52%",
    paddingLeft: 44,
    paddingRight: 18,
    color: "#ffffff",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  contactText: { fontSize: 7.5, color: "#ffffff" },
  footer: {
    backgroundColor: COLORS.dark,
    color: COLORS.yellow,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  serviceBoxes: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: TABLE_ROW_ALT,
    paddingVertical: 10,
  },
  serviceBox: { alignItems: "center", maxWidth: 90 },
  serviceIcon: { marginBottom: 4 },
  serviceText: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.dark,
    textAlign: "center",
  },
});

interface PdfHeaderProps {
  fecha?: Date;
}

export function PdfHeader({ fecha }: PdfHeaderProps = {}) {
  return (
    <View style={styles.headerZone}>
      <Svg
        style={styles.headerSvg}
        viewBox={`0 0 ${PANEL_VIEWBOX_WIDTH} ${HEADER_ZONE_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Path d={LEFT_PANEL_PATH_D} fill={COLORS.metal} />
        <Path d={RIGHT_PANEL_PATH_D} fill={COLORS.dark} />
        <Path d={DIVIDER_STROKE_PATH_D} fill="none" stroke="#c7c9ca" strokeWidth={1.5} />
        <Path d={HEADER_WAVE_RIBBON_PATH_D} fill={COLORS.yellow} />
        <Path d={HEADER_WAVE_MASK_PATH_D} fill="#ffffff" />
      </Svg>

      <View style={styles.headerContent}>
        <View style={styles.leftPanel}>
          <Image src="/logo.png" style={styles.logo} />
          <View>
            <Text style={styles.companyName}>{EMPRESA.nombre}</Text>
            <Text style={styles.companyTaglineLinea1}>{EMPRESA.taglineLinea1}</Text>
            <Text style={styles.companyTaglineLinea2}>{EMPRESA.taglineLinea2}</Text>
          </View>
        </View>
        <View style={styles.rightPanel}>
          <View style={styles.contactRow}>
            <IconTelefono color="#ffffff" size={8} />
            <Text style={styles.contactText}>{EMPRESA.telefono}</Text>
          </View>
          <View style={styles.contactRow}>
            <IconCorreo color="#ffffff" size={8} />
            <Text style={styles.contactText}>{EMPRESA.correo}</Text>
          </View>
          <View style={styles.contactRow}>
            <IconDireccion color="#ffffff" size={8} />
            <Text style={styles.contactText}>{EMPRESA.direccion}</Text>
          </View>
          {fecha && (
            <View style={styles.contactRow}>
              <IconFecha color="#ffffff" size={8} />
              <Text style={styles.contactText}>{formatFecha(fecha)}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function PdfServiceBoxes() {
  return (
    <View style={styles.serviceBoxes}>
      {SERVICIOS.map(({ Icon, texto }) => (
        <View key={texto} style={styles.serviceBox}>
          <View style={styles.serviceIcon}>
            <Icon color={COLORS.dark} />
          </View>
          <Text style={styles.serviceText}>{texto}</Text>
        </View>
      ))}
    </View>
  );
}

export function PdfFooter() {
  return (
    <View style={styles.footer}>
      <IconEscudo color="#ffffff" />
      <Text>{EMPRESA.taglineFooter}</Text>
    </View>
  );
}
