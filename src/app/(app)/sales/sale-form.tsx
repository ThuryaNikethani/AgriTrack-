"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSale } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormMessage, SubmitButton, initialActionState } from "@/components/form-helpers";
import { formatCurrency, toDateInput } from "@/lib/utils";

type CropOption = { id: string; label: string; availableKg: number };

export function SaleForm({ crops }: { crops: CropOption[] }) {
  const [state, formAction] = useActionState(createSale, initialActionState);
  const ref = useRef<HTMLFormElement>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"KG" | "G">("KG");
  const [price, setPrice] = useState("");
  const [cropId, setCropId] = useState("");

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setQuantity("");
      setPrice("");
      setCropId("");
    }
  }, [state]);

  const e = state.errors ?? {};
  const qtyKg = (Number(quantity) || 0) / (unit === "G" ? 1000 : 1);
  const total = qtyKg * (Number(price) || 0);
  const selected = crops.find((c) => c.id === cropId);

  return (
    <form ref={ref} action={formAction} className="grid gap-3">
      <FormMessage state={state} />
      <Field label="Vegetable / crop" htmlFor="sale-crop" error={e.cropId}>
        <Select id="sale-crop" name="cropId" value={cropId} onChange={(ev) => setCropId(ev.target.value)} required>
          <option value="" disabled>
            Select a crop
          </option>
          {crops.map((c) => (
            <option key={c.id} value={c.id} disabled={c.availableKg <= 0}>
              {c.label} - {c.availableKg} kg available
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Sale date" htmlFor="sale-date" error={e.saleDate}>
        <Input id="sale-date" name="saleDate" type="date" defaultValue={toDateInput(new Date())} required />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Quantity" htmlFor="sale-qty" error={e.quantity} className="col-span-2">
          <Input
            id="sale-qty"
            name="quantity"
            type="number"
            step="0.001"
            min={0}
            value={quantity}
            onChange={(ev) => setQuantity(ev.target.value)}
            required
          />
        </Field>
        <Field label="Unit" htmlFor="sale-unit">
          <Select
            id="sale-unit"
            name="quantityUnit"
            value={unit}
            onChange={(ev) => setUnit(ev.target.value as "KG" | "G")}
          >
            <option value="KG">kg</option>
            <option value="G">g</option>
          </Select>
        </Field>
      </div>
      {selected && qtyKg > selected.availableKg && (
        <p className="text-xs text-red-600">Only {selected.availableKg} kg available.</p>
      )}
      <Field label="Unit price (LKR per kg)" htmlFor="sale-price" error={e.unitPrice}>
        <Input
          id="sale-price"
          name="unitPrice"
          type="number"
          step="0.01"
          min={0}
          value={price}
          onChange={(ev) => setPrice(ev.target.value)}
          required
        />
      </Field>
      <div className="rounded-md bg-green-50 px-3 py-2 text-sm">
        Total: <strong>{formatCurrency(total)}</strong>
      </div>
      <Field label="Sold to" htmlFor="sale-customer" error={e.customerType}>
        <Select id="sale-customer" name="customerType" defaultValue="VILLA">
          <option value="VILLA">Kurunduwatta Villa</option>
          <option value="TEA_FACTORY">Tea Factory</option>
          <option value="EXTERNAL">External customer</option>
        </Select>
      </Field>
      <Field label="Customer name (optional)" htmlFor="sale-name" error={e.customerName}>
        <Input id="sale-name" name="customerName" />
      </Field>
      <Field label="Notes" htmlFor="sale-notes" error={e.notes}>
        <Textarea id="sale-notes" name="notes" />
      </Field>
      <SubmitButton>Record sale</SubmitButton>
    </form>
  );
}
