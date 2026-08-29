import { Check, Info, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { permissionMatrix, permissionRoleLabels, permissionRoles } from "@/config/settings";

function PermissionTable() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              {permissionRoles.map((role) => (
                <TableHead key={role} className="text-center">
                  {permissionRoleLabels[role]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissionMatrix.map((row) => (
              <TableRow key={row.action}>
                <TableCell className="font-medium text-foreground">{row.action}</TableCell>
                {permissionRoles.map((role) => (
                  <TableCell key={role} className="text-center">
                    {row.allowed[role] ? (
                      <Check className="mx-auto size-4 text-primary" />
                    ) : (
                      <X className="mx-auto size-4 text-muted-foreground/50" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Custom roles you add when creating staff aren&apos;t in this table — they carry no
          permissions of their own yet. Give someone one of the four roles above if they need
          these actions.
        </p>
      </CardContent>
    </Card>
  );
}

export { PermissionTable };
