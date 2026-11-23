import Link from "next/link";
import { AlertTriangle, FlaskConical, PackageX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { CropCell } from "@/components/crop-avatar";
import { ReportMenu } from "@/components/report-menu";
import { StatCard } from "@/components/stat-card";
import { StockBadge } from "@/components/stock-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getStockStatus, stockRowClass } from "@/lib/stock";
import { enumLabel, formatDate, formatNumber } from "@/lib/utils";
import { FertilizerForm } from "./fertilizer-forms";

export const metadata = { title: "Fertilizers" };

export default async function FertilizersPage() {
  const [fertilizers, recentUsage] = await Promise.all([
    prisma.fertilizer.findMany({ orderBy: { name: "asc" } }),
    prisma.fertilizerUsage.findMany({
      take: 10,
      orderBy: { date: "desc" },
      include: { fertilizer: true, crop: { select: { id: true, name: true, bedLocation: true } } },
    }),
  ]);

  const low = fertilizers.filter((f) => getStockStatus(f.currentStock, f.reorderLevel) === "LOW");
  const out = fertilizers.filter((f) => getStockStatus(f.currentStock, f.reorderLevel) === "OUT");

  return (
    <>
      <PageHeader
        title="Fertilizer Management"
        description="Fertilizer types, usage per crop and remaining stock."
        actions={<ReportMenu module="Fertilizers" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Fertilizer types" value={fertilizers.length} icon={FlaskConical} />
        <StatCard label="Low stock" value={low.length} icon={AlertTriangle} tone="amber" hint="At or below reorder level" />
        <StatCard label="Out of stock" value={out.length} icon={PackageX} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Stock levels</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Fertilizer</TH>
                  <TH>Type</TH>
                  <TH className="text-right">In stock</TH>
                  <TH className="text-right">Reorder level</TH>
                  <TH>Status</TH>
                  <TH>Supplier</TH>
                </tr>
              </THead>
              <TBody>
                {fertilizers.length === 0 && <EmptyRow colSpan={6} message="No fertilizers added yet." />}
                {fertilizers.map((f) => (
                  <TR key={f.id} className={stockRowClass(getStockStatus(f.currentStock, f.reorderLevel))}>
                    <TD>
                      <Link href={`/fertilizers/${f.id}`} className="font-medium text-green-700 hover:underline">
                        {f.name}
                      </Link>
                    </TD>
                    <TD>{enumLabel(f.type)}</TD>
                    <TD className="text-right">
                      {formatNumber(f.currentStock)} {f.unit}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(f.reorderLevel)} {f.unit}
                    </TD>
                    <TD>
                      <StockBadge quantity={f.currentStock} reorderLevel={f.reorderLevel} />
                    </TD>
                    <TD>{f.supplier ?? "-"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent usage</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Fertilizer</TH>
                  <TH>Crop</TH>
                  <TH className="text-right">Quantity</TH>
                </tr>
              </THead>
              <TBody>
                {recentUsage.length === 0 && <EmptyRow colSpan={4} />}
                {recentUsage.map((u) => (
                  <TR key={u.id}>
                    <TD>{formatDate(u.date)}</TD>
                    <TD>{u.fertilizer.name}</TD>
                    <TD>
                      <CropCell id={u.crop.id} name={u.crop.name} sub={u.crop.bedLocation} />
                    </TD>
                    <TD className="text-right">
                      {formatNumber(u.quantity)} {u.fertilizer.unit}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add fertilizer</CardTitle>
          </CardHeader>
          <CardContent>
            <FertilizerForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
