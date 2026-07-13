import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyCOP } from "@/lib/currency";
import type { CuentaCobro } from "@/models/CuentaCobro";
import { COLORS, PdfHeader, PdfFooter, formatFecha } from "./PdfBrand";

const FORMA_PAGO = [
  "DAVIVIENDA: 0570 4518 7009 3346 – Ahorros – ERICK JULIAN DUEÑAS FORERO",
  "NEQUI: 322 200 3921",
  "Bre-B: 322 200 3921",
];

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.dark,
    backgroundColor: "#ffffff",
  },
  body: { padding: 20 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  clienteBlock: { maxWidth: 220 },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    marginBottom: 4,
  },
  clienteText: { fontSize: 9, marginBottom: 2 },
  clienteNombre: { fontFamily: "Helvetica-Bold" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "right", marginBottom: 8 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginBottom: 2 },
  metaLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.accent },
  metaValue: { fontSize: 8 },
  table: { marginTop: 8, borderWidth: 1, borderColor: COLORS.dark },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.dark },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    padding: 6,
  },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dddddd" },
  tableCell: { fontSize: 8, padding: 6 },
  colDescripcion: { width: "50%" },
  colCantidad: { width: "16%", textAlign: "center" },
  colValorUnitario: { width: "17%", textAlign: "right" },
  colValorTotal: { width: "17%", textAlign: "right" },
  summaryRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dddddd" },
  summaryLabel: {
    width: "83%",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 6,
    textAlign: "right",
  },
  summaryValue: {
    width: "17%",
    fontSize: 9,
    padding: 6,
    textAlign: "right",
  },
  saldoRow: { flexDirection: "row", backgroundColor: COLORS.dark },
  saldoLabel: {
    width: "83%",
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 6,
    textAlign: "right",
  },
  saldoValue: {
    width: "17%",
    backgroundColor: COLORS.yellow,
    color: COLORS.dark,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 6,
    textAlign: "right",
  },
  formaPago: { marginTop: 16 },
  formaPagoTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    marginBottom: 4,
  },
  formaPagoLine: { fontSize: 8, marginBottom: 3 },
  signatureBlock: { marginTop: 24, alignItems: "flex-end" },
  signaturePlaceholder: {
    width: 160,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark,
    paddingTop: 4,
    textAlign: "center",
  },
  signatureText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
});

interface CuentaCobroPdfProps {
  cuenta: Pick<CuentaCobro, "cliente" | "items" | "consecutivo" | "fecha" | "total" | "abonos" | "saldo">;
}

export default function CuentaCobroPdf({ cuenta }: CuentaCobroPdfProps) {
  const { cliente, items, consecutivo, fecha, total, abonos, saldo } = cuenta;
  const abonoTotal = abonos.reduce((sum, abono) => sum + abono.valor, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader fecha={fecha} />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.clienteBlock}>
              <Text style={styles.sectionLabel}>DATOS DEL CLIENTE</Text>
              <Text style={styles.clienteText}>{cliente.tratamiento}:</Text>
              <Text style={[styles.clienteText, styles.clienteNombre]}>{cliente.nombre}</Text>
              <Text style={styles.clienteText}>CC {cliente.cedula}</Text>
              <Text style={styles.clienteText}>{cliente.direccion}</Text>
              <Text style={styles.clienteText}>Barrio {cliente.barrio}</Text>
            </View>
            <View>
              <Text style={styles.title}>CUENTA DE COBRO</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>N° CUENTA:</Text>
                <Text style={styles.metaValue}>{consecutivo}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>FECHA:</Text>
                <Text style={styles.metaValue}>{formatFecha(fecha)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colDescripcion]}>DESCRIPCIÓN</Text>
              <Text style={[styles.tableHeaderCell, styles.colCantidad]}>CANTIDAD</Text>
              <Text style={[styles.tableHeaderCell, styles.colValorUnitario]}>
                VALOR UNITARIO
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colValorTotal]}>VALOR TOTAL</Text>
            </View>

            {items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDescripcion]}>{item.descripcion}</Text>
                <Text style={[styles.tableCell, styles.colCantidad]}>{item.cantidad}</Text>
                <Text style={[styles.tableCell, styles.colValorUnitario]}>
                  {formatCurrencyCOP(item.valorUnitario)}
                </Text>
                <Text style={[styles.tableCell, styles.colValorTotal]}>
                  {formatCurrencyCOP(item.cantidad * item.valorUnitario)}
                </Text>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TOTAL</Text>
              <Text style={styles.summaryValue}>{formatCurrencyCOP(total)}</Text>
            </View>

            {abonoTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ABONO</Text>
                <Text style={styles.summaryValue}>{formatCurrencyCOP(abonoTotal)}</Text>
              </View>
            )}

            <View style={styles.saldoRow}>
              <Text style={styles.saldoLabel}>SALDO PENDIENTE</Text>
              <Text style={styles.saldoValue}>{formatCurrencyCOP(saldo)}</Text>
            </View>
          </View>

          <View style={styles.formaPago}>
            <Text style={styles.formaPagoTitle}>FORMA DE PAGO</Text>
            {FORMA_PAGO.map((linea) => (
              <Text key={linea} style={styles.formaPagoLine}>
                {linea}
              </Text>
            ))}
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signaturePlaceholder}>
              <Text style={styles.signatureText}>EL TALLER DEL SOLDADOR</Text>
            </View>
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
