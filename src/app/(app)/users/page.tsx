import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/form-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { enumLabel, formatDate } from "@/lib/utils";
import { changeRole, deleteUser, toggleActive } from "./actions";
import { CreateUserForm, ResetPasswordForm } from "./user-forms";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  return (
    <>
      <PageHeader title="User Management" description="Admin and staff accounts for AgriTrack." />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {users.map((u) => {
                const self = u.id === admin.id;
                return (
                  <TR key={u.id} className={u.active ? "" : "opacity-60"}>
                    <TD className="font-medium">
                      {u.name}
                      {self && <span className="ml-1 text-xs text-gray-500">(you)</span>}
                    </TD>
                    <TD>{u.email}</TD>
                    <TD>
                      <Badge variant={u.role === "ADMIN" ? "info" : "default"}>{enumLabel(u.role)}</Badge>
                    </TD>
                    <TD>
                      <Badge variant={u.active ? "success" : "danger"}>{u.active ? "Active" : "Disabled"}</Badge>
                    </TD>
                    <TD>{formatDate(u.createdAt)}</TD>
                    <TD>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <ResetPasswordForm userId={u.id} />
                        {!self && (
                          <>
                            <form action={changeRole}>
                              <input type="hidden" name="id" value={u.id} />
                              <input type="hidden" name="role" value={u.role === "ADMIN" ? "STAFF" : "ADMIN"} />
                              <Button variant="ghost" size="sm" type="submit">
                                Make {u.role === "ADMIN" ? "staff" : "admin"}
                              </Button>
                            </form>
                            <form action={toggleActive}>
                              <input type="hidden" name="id" value={u.id} />
                              <Button variant="ghost" size="sm" type="submit">
                                {u.active ? "Disable" : "Enable"}
                              </Button>
                            </form>
                            <DeleteButton action={deleteUser} id={u.id} confirmText={`Delete ${u.name}'s account?`} />
                          </>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>New account</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
