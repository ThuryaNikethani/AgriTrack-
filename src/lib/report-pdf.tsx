import { existsSync, readFileSync } from "fs";
import path from "path";
import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatCell, isNumericFormat, type Report, type ReportSection } from "@/lib/report-format";

const GREEN = "#1d632d";
const GOLD = "#c9932a";

/** Company logo from /public, embedded as a data URI (null if the file is missing). */
function loadLogo(): string | null {
  const file = path.join(process.cwd(), "public", "athukorala-logo.png");
  if (!existsSync(file)) return null;
  return `data:image/png;base64,${readFileSync(file).toString("base64")}`;
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8.5, fontFamily: "Helvetica", color: "#1f2937" },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 8, marginBottom: 2 },
  logo: { width: 46, height: 46, marginRight: 12 },
  goldRule: { height: 2.5, backgroundColor: GOLD, marginBottom: 10 },
  company: { fontSize: 9, color: GREEN, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  brand: { fontSize: 8, color: GOLD, fontFamily: "Helvetica-Bold", marginTop: 1 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 2 },
  subtitle: { fontSize: 9, color: "#4b5563", marginTop: 2 },
  summary: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  summaryItem: { width: "25%", padding: 4 },
  summaryLabel: { fontSize: 7.5, color: "#6b7280", textTransform: "uppercase" },
  summaryValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 1 },
  sectionTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 },
  table: { borderTop: "0.5pt solid #d1d5db", borderLeft: "0.5pt solid #d1d5db" },
  row: { flexDirection: "row" },
  headCell: {
    flex: 1,
    padding: 4,
    backgroundColor: GREEN,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    borderRight: "0.5pt solid #d1d5db",
    borderBottom: "0.5pt solid #d1d5db",
  },
  cell: { flex: 1, padding: 4, borderRight: "0.5pt solid #d1d5db", borderBottom: "0.5pt solid #d1d5db" },
  totalCell: { fontFamily: "Helvetica-Bold", backgroundColor: "#f3f4f6" },
  danger: { backgroundColor: "#fee2e2" },
  warning: { backgroundColor: "#fef3c7" },
  empty: { padding: 8, color: "#6b7280", borderRight: "0.5pt solid #d1d5db", borderBottom: "0.5pt solid #d1d5db" },
  note: { fontSize: 7.5, color: "#6b7280", marginTop: 6 },
  footer: { position: "absolute", bottom: 14, left: 28, right: 28, fontSize: 7, color: "#9ca3af", flexDirection: "row", justifyContent: "space-between" },
});

function Section({ section }: { section: ReportSection }) {
  return (
    <View wrap>
      {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
      <View style={styles.table}>
        <View style={styles.row} fixed>
          {section.columns.map((c) => (
            <Text key={c.key} style={[styles.headCell, isNumericFormat(c.format) ? { textAlign: "right" } : {}]}>
              {c.header}
            </Text>
          ))}
        </View>
        {section.rows.length === 0 && <Text style={styles.empty}>No records for this period.</Text>}
        {section.rows.map((row, i) => (
          <View
            key={i}
            style={[styles.row, row._highlight === "danger" ? styles.danger : row._highlight === "warning" ? styles.warning : {}]}
            wrap={false}
          >
            {section.columns.map((c) => (
              <Text key={c.key} style={[styles.cell, isNumericFormat(c.format) ? { textAlign: "right" } : {}]}>
                {formatCell(row[c.key], c.format)}
              </Text>
            ))}
          </View>
        ))}
        {section.totals && (
          <View style={styles.row} wrap={false}>
            {section.columns.map((c) => (
              <Text
                key={c.key}
                style={[styles.cell, styles.totalCell, isNumericFormat(c.format) ? { textAlign: "right" } : {}]}
              >
                {section.totals?.[c.key] !== undefined ? formatCell(section.totals[c.key], typeof section.totals[c.key] === "number" ? c.format : "text") : ""}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function ReportDocument({ report, logo }: { report: Report; logo: string | null }) {
  const wide = report.sections.some((s) => s.columns.length > 6);
  return (
    <Document title={report.title} author="Athukorala Group - AgriTrack">
      <Page size="A4" orientation={wide ? "landscape" : "portrait"} style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
          {logo && <Image src={logo} style={styles.logo} />}
          <View>
            <Text style={styles.company}>ATHUKORALA GROUP</Text>
            <Text style={styles.brand}>AgriTrack - Kurunduwatta Villa &amp; Cottages Polytunnel</Text>
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.subtitle}>{report.subtitle}</Text>
          </View>
        </View>
        <View style={styles.goldRule} />

        <View style={styles.summary}>
          {report.summary.map((s) => (
            <View key={s.label} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{s.label}</Text>
              <Text style={styles.summaryValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {report.sections.map((section, i) => (
          <Section key={i} section={section} />
        ))}

        {report.notes?.map((n) => (
          <Text key={n} style={styles.note}>
            {n}
          </Text>
        ))}

        <View style={styles.footer} fixed>
          <Text>Generated {report.generatedAt}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(report: Report): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} logo={loadLogo()} />);
}
