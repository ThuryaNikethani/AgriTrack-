import { existsSync, readFileSync } from "fs";
import path from "path";
import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatCell, isNumericFormat, type Report, type ReportSection } from "@/lib/report-format";

const GREEN = "#1d632d";

/** Company logo from /public, embedded as a data URI (null if the file is missing). */
function loadLogo(): string | null {
  const file = path.join(process.cwd(), "public", "athukorala-logo.png");
  if (!existsSync(file)) return null;
  return `data:image/png;base64,${readFileSync(file).toString("base64")}`;
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8.5, fontFamily: "Helvetica", color: "#1f2937" },
  // Letterhead: logo left, centred company / report / print lines, thick dark rule.
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 10 },
  logo: { width: 72, height: 72 },
  headerText: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  headerSpacer: { width: 72 },
  company: { fontSize: 22, color: GREEN, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#111827", marginTop: 6 },
  printed: { fontSize: 9, color: "#4b5563", marginTop: 5 },
  rule: { height: 3.5, backgroundColor: "#082410", marginBottom: 8 },
  filters: { fontSize: 9, textAlign: "center", color: "#374151", marginBottom: 8 },
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
          {logo ? <Image src={logo} style={styles.logo} /> : <View style={styles.headerSpacer} />}
          <View style={styles.headerText}>
            <Text style={styles.company}>ATHUKORALA GROUP (PVT) LTD</Text>
            <Text style={styles.title}>
              {report.title} · {report.period}
            </Text>
            <Text style={styles.printed}>
              Printed on: {report.generatedAt}
              {report.printedBy ? ` | Printed by: ${report.printedBy}` : ""}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.rule} />
        {report.filters.length > 0 && <Text style={styles.filters}>{report.filters.join(" | ")}</Text>}

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
          <Text>Athukorala Group (Pvt) Ltd · AgriTrack · {report.title}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(report: Report): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} logo={loadLogo()} />);
}
