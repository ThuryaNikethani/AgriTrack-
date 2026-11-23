import Link from "next/link";
import { AlertTriangle, Boxes, PackageX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StockBadge } from "@/components/stock-badge";
import { DeleteButton } from "@/components/form-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyRow, TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getStockStatus, stockRowClass } from "@/lib/stock";
import { enumLabel, formatDate, formatNumber } from "@/lib/utils";
import { deleteItem } from "./actions";
import { ItemForm, MovementForm } from "./inventory-forms";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const [items, fertilizers, movements] = await Promise.all([
    prisma.inventoryItem.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.fertilizer.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryMovement.findMany({ take: 10, orderBy: { date: "desc" }, include: { item: true } }),
  ]);

  const all = [
    ...items.map((i) => getStockStatus(i.quantity, i.reorderLevel)),
    ...fertilizers.map((f) => getStockStatus(f.currentStock, f.reorderLevel)),
  ];

  return (
    <>
      <PageHeader
        title="Inventory Management"
        description="Seeds, supplies, equipment and fertilizer stock in one place."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Stock items" value={items.length + fertilizers.length} icon={Boxes} />
        <StatCard label="Low stock" value={all.filter((s) => s === "LOW").length} icon={AlertTriangle} tone="amber" />
        <StatCard label="Out of stock" value={all.filter((s) => s === "OUT").length} icon={PackageX} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seeds, supplies &amp; equipment</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Item</TH>
                  <TH>Category</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH className="text-right">Reorder level</TH>
                  <TH>Status</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {items.length === 0 && <EmptyRow colSpan={6} />}
                {items.map((i) => (
                  <TR key={i.id} className={stockRowClass(getStockStatus(i.quantity, i.reorderLevel))}>
                    <TD className="font-medium">{i.name}</TD>
                    <TD>{enumLabel(i.category)}</TD>
                    <TD className="text-right">
                      {formatNumber(i.quantity)} {i.unit}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(i.reorderLevel)} {i.unit}
                    </TD>
                    <TD>
                      <StockBadge quantity={i.quantity} reorderLevel={i.reorderLevel} />
                    </TD>
                    <TD>
                      <DeleteButton action={deleteItem} id={i.id} confirmText={`Delete ${i.name}?`} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fertilizers</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Fertilizer</TH>
                  <TH className="text-right">In stock</TH>
                  <TH className="text-right">Reorder level</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {fertilizers.length === 0 && <EmptyRow colSpan={4} />}
                {fertilizers.map((f) => (
                  <TR key={f.id} className={stockRowClass(getStockStatus(f.currentStock, f.reorderLevel))}>
                    <TD>
                      <Link href={`/fertilizers/${f.id}`} className="font-medium text-green-700 hover:underline">
                        {f.name}
                      </Link>
                    </TD>
                    <TD className="text-right">
                      {formatNumber(f.currentStock)} {f.unit}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(f.reorderLevel)} {f.unit}
                    </TD>
                    <TD>
                      <StockBadge quantity={f.currentStock} reorderLevel={f.reorderLevel} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent stock movements</CardTitle>
            </CardHeader>
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Item</TH>
                  <TH>Movement</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH>Note</TH>
                </tr>
              </THead>
              <TBody>
                {movements.length === 0 && <EmptyRow colSpan={5} />}
                {movements.map((m) => (
                  <TR key={m.id}>
                    <TD>{formatDate(m.date)}</TD>
                    <TD>{m.item.name}</TD>
                    <TD className={m.type === "IN" ? "text-green-700" : "text-red-600"}>
                      {m.type === "IN" ? "Stock in" : "Stock out"}
                    </TD>
                    <TD className="text-right">
                      {formatNumber(m.quantity)} {m.item.unit}
                    </TD>
                    <TD>{m.note ?? "-"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock in / out</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementForm items={items.map((i) => ({ id: i.id, label: `${i.name} (${i.unit})` }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add item</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
