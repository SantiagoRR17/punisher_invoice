import { View, Text, Svg, Path, StyleSheet } from "@react-pdf/renderer";
import {
  HEADER_CAP_PATH_D,
  WAVE_RIBBON_PATH_D,
  WAVE_VIEWBOX_WIDTH,
  HEADER_ZONE_HEIGHT,
} from "./pdfWave";

export const COLORS = {
  dark: "#1b2a31",
  accent: "#215866",
  yellow: "#f2b705",
  textMuted: "#4b5b62",
};

/**
 * Placeholder de marca: no existen todavía los archivos reales de logo,
 * firma e ícono de soldador en public/ (ver DOCS/003-formulario-cotizacion.md).
 * Reemplazar por Image de @react-pdf/renderer cuando estén disponibles.
 */
export const EMPRESA = {
  nombre: "EL TALLER DEL SOLDADOR",
  tagline: "SOLUCIONES METÁLICAS CON CALIDAD, FUERZA Y COMPROMISO",
  direccion: "Calle 75 N° 78-56, Bogotá DC – Colombia",
  telefono: "322 200 3921",
  correo: "erickjulian.for@gmail.com",
};

export function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(fecha)
    .toUpperCase();
}

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
    color: "#ffffff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyBlock: { flexDirection: "row", alignItems: "center" },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoPlaceholderText: { color: COLORS.yellow, fontSize: 13, fontFamily: "Helvetica-Bold" },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  companyTagline: { fontSize: 7, color: COLORS.yellow, marginTop: 2, maxWidth: 180 },
  contactBlock: { alignItems: "flex-end" },
  contactLine: { fontSize: 8, marginBottom: 3 },
  footer: {
    marginTop: "auto",
    backgroundColor: COLORS.dark,
    color: COLORS.yellow,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    padding: 8,
  },
});

interface PdfHeaderProps {
  fecha: Date;
}

export function PdfHeader({ fecha }: PdfHeaderProps) {
  return (
    <View style={styles.headerZone}>
      <Svg
        style={styles.headerSvg}
        viewBox={`0 0 ${WAVE_VIEWBOX_WIDTH} ${HEADER_ZONE_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Path d={HEADER_CAP_PATH_D} fill={COLORS.dark} />
        <Path d={WAVE_RIBBON_PATH_D} fill={COLORS.yellow} />
      </Svg>

      <View style={styles.headerContent}>
        <View style={styles.companyBlock}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>TF</Text>
          </View>
          <View>
            <Text style={styles.companyName}>{EMPRESA.nombre}</Text>
            <Text style={styles.companyTagline}>{EMPRESA.tagline}</Text>
          </View>
        </View>
        <View style={styles.contactBlock}>
          <Text style={styles.contactLine}>{EMPRESA.direccion}</Text>
          <Text style={styles.contactLine}>{EMPRESA.telefono}</Text>
          <Text style={styles.contactLine}>{EMPRESA.correo}</Text>
          <Text style={styles.contactLine}>{formatFecha(fecha)}</Text>
        </View>
      </View>
    </View>
  );
}

export function PdfFooter() {
  return <Text style={styles.footer}>{EMPRESA.tagline}</Text>;
}
