import { Check, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { permissionMatrix, permissionRoles } from "@/config/settings";

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
                  {role}
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
      </CardContent>
    </Card>
  );
}

export { PermissionTable };
