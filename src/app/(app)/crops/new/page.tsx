import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CropForm } from "../crop-form";

export const metadata = { title: "Add crop" };

export default function NewCropPage() {
  return (
    <>
      <PageHeader
        title="Add crop"
        description="Register a new crop cycle. The first harvest is scheduled automatically."
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-5">
          <CropForm />
        </CardContent>
      </Card>
    </>
  );
}
