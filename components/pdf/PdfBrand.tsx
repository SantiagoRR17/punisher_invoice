import { View, Text, Svg, Path, Image, StyleSheet } from "@react-pdf/renderer";
import {
  HEADER_CAP_PATH_D,
  WAVE_RIBBON_PATH_D,
  WAVE_VIEWBOX_WIDTH,
  HEADER_ZONE_HEIGHT,
} from "./pdfWave";
import { IconDireccion, IconTelefono, IconCorreo, IconFecha } from "./pdfIcons";

export const COLORS = {
  dark: "#1b2a31",
  accent: "#215866",
  yellow: "#f2b705",
  textMuted: "#4b5b62",
};

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
  logo: { width: 40, height: 40, marginRight: 10 },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  companyTagline: { fontSize: 7, color: COLORS.yellow, marginTop: 2, maxWidth: 180 },
  contactBlock: { alignItems: "flex-end" },
  contactLine: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 },
  contactText: { fontSize: 8 },
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
          <Image src="/logo.png" style={styles.logo} />
          <View>
            <Text style={styles.companyName}>{EMPRESA.nombre}</Text>
            <Text style={styles.companyTagline}>{EMPRESA.tagline}</Text>
          </View>
        </View>
        <View style={styles.contactBlock}>
          <View style={styles.contactLine}>
            <IconDireccion color="#ffffff" />
            <Text style={styles.contactText}>{EMPRESA.direccion}</Text>
          </View>
          <View style={styles.contactLine}>
            <IconTelefono color="#ffffff" />
            <Text style={styles.contactText}>{EMPRESA.telefono}</Text>
          </View>
          <View style={styles.contactLine}>
            <IconCorreo color="#ffffff" />
            <Text style={styles.contactText}>{EMPRESA.correo}</Text>
          </View>
          <View style={styles.contactLine}>
            <IconFecha color="#ffffff" />
            <Text style={styles.contactText}>{formatFecha(fecha)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function PdfFooter() {
  return <Text style={styles.footer}>{EMPRESA.tagline}</Text>;
}
