import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CropForm } from "../../crop-form";

export const metadata = { title: "Edit crop" };

export default async function EditCropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crop = await prisma.crop.findUnique({ where: { id } });
  if (!crop) notFound();

  return (
    <>
      <PageHeader title={`Edit ${crop.name}`} />
      <Card className="max-w-3xl">
        <CardContent className="pt-5">
          <CropForm crop={crop} />
        </CardContent>
      </Card>
    </>
  );
}
