import { View, Text, Svg, Path, Image, StyleSheet, Font } from "@react-pdf/renderer";
import {
  PANEL_VIEWBOX_WIDTH,
  PANEL_BASELINE_X,
  PANEL_WAVE_AMPLITUDE,
  PANEL_WAVE_PERIODS,
  buildLeftPanelPath,
  buildRightPanelPath,
  buildPanelDividerStrokePath,
} from "./pdfWave";
import {
  IconDireccion,
  IconTelefono,
  IconCorreo,
  IconNit,
  IconFabricacion,
  IconInstalacion,
  IconMantenimiento,
  IconEstructuras,
  IconEscudo,
} from "./pdfIcons";

// Evita que @react-pdf/renderer parta palabras largas con un guion a mitad
// de línea (ej. "ERICK JU-LIAN"); solo se ajusta por espacios.
Font.registerHyphenationCallback((word) => [word]);

export const HEADER_ZONE_HEIGHT = 132;

export const COLORS = {
  dark: "#1b2a31",
  accent: "#215866",
  yellow: "#f2b705",
  textMuted: "#4b5b62",
  panelDark: "#00293b",
  panelLight: "#cdcdcf",
};

export const TABLE_HEADER = "#023145";
export const TABLE_HIGHLIGHT = "#04445d";
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
  nit: "Pendiente",
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

const LEFT_PANEL_PATH_D = buildLeftPanelPath(
  HEADER_ZONE_HEIGHT,
  PANEL_BASELINE_X,
  PANEL_WAVE_AMPLITUDE,
  PANEL_WAVE_PERIODS
);
const RIGHT_PANEL_PATH_D = buildRightPanelPath(
  PANEL_VIEWBOX_WIDTH,
  HEADER_ZONE_HEIGHT,
  PANEL_BASELINE_X,
  PANEL_WAVE_AMPLITUDE,
  PANEL_WAVE_PERIODS
);
const DIVIDER_STROKE_PATH_D = buildPanelDividerStrokePath(
  HEADER_ZONE_HEIGHT,
  PANEL_BASELINE_X,
  PANEL_WAVE_AMPLITUDE,
  PANEL_WAVE_PERIODS
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
    width: "58%",
    paddingLeft: 20,
    paddingRight: 26,
    color: "#ffffff",
  },
  companyBlock: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10 },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  companyTaglineLinea1: { fontSize: 7, color: "#ffffff", marginTop: 3, fontFamily: "Helvetica-Bold" },
  companyTaglineLinea2: { fontSize: 6.5, color: "#8fb7c9", marginTop: 1, maxWidth: 190 },
  rightPanel: {
    width: "42%",
    paddingLeft: 26,
    paddingRight: 18,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 5,
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#a9a9ac",
  },
  contactRowLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  contactBadge: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: COLORS.panelDark,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: { fontSize: 7.5, color: COLORS.panelDark },
  footer: {
    marginTop: "auto",
    backgroundColor: COLORS.panelDark,
    color: "#ffffff",
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
    color: COLORS.panelDark,
    textAlign: "center",
  },
});

export function PdfHeader() {
  return (
    <View style={styles.headerZone}>
      <Svg
        style={styles.headerSvg}
        viewBox={`0 0 ${PANEL_VIEWBOX_WIDTH} ${HEADER_ZONE_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Path d={LEFT_PANEL_PATH_D} fill={COLORS.panelDark} />
        <Path d={RIGHT_PANEL_PATH_D} fill={COLORS.panelLight} />
        <Path d={DIVIDER_STROKE_PATH_D} fill="none" stroke="#f4f4f5" strokeWidth={1.5} />
      </Svg>

      <View style={styles.headerContent}>
        <View style={[styles.leftPanel, styles.companyBlock]}>
          <Image src="/logo.png" style={styles.logo} />
          <View>
            <Text style={styles.companyName}>{EMPRESA.nombre}</Text>
            <Text style={styles.companyTaglineLinea1}>{EMPRESA.taglineLinea1}</Text>
            <Text style={styles.companyTaglineLinea2}>{EMPRESA.taglineLinea2}</Text>
          </View>
        </View>
        <View style={styles.rightPanel}>
          <View style={styles.contactRow}>
            <View style={styles.contactBadge}>
              <IconTelefono color="#ffffff" size={8} />
            </View>
            <Text style={styles.contactText}>{EMPRESA.telefono}</Text>
          </View>
          <View style={styles.contactRow}>
            <View style={styles.contactBadge}>
              <IconCorreo color="#ffffff" size={8} />
            </View>
            <Text style={styles.contactText}>{EMPRESA.correo}</Text>
          </View>
          <View style={styles.contactRow}>
            <View style={styles.contactBadge}>
              <IconDireccion color="#ffffff" size={8} />
            </View>
            <Text style={styles.contactText}>{EMPRESA.direccion}</Text>
          </View>
          <View style={[styles.contactRow, styles.contactRowLast]}>
            <View style={styles.contactBadge}>
              <IconNit color="#ffffff" size={8} />
            </View>
            <Text style={styles.contactText}>NIT: {EMPRESA.nit}</Text>
          </View>
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
            <Icon color={COLORS.panelDark} />
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
