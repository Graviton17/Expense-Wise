"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Mail,
  Edit,
  UserX,
  UserCheck,
  Shield,
  Users,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

// (Interfaces remain the same)
export interface UserData {
  id: string; name: string; email: string; role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  managerId: string | null; status: "active" | "inactive"; avatarUrl?: string;
  initials: string; createdAt: string;
}
export interface ManagerData { id: string; name: string; }
export type UserAction = "sendPasswordReset" | "editUser" | "toggleStatus";
interface UserManagementTableProps {
  users: UserData[]; managers: ManagerData[]; currentUserId: string;
  onRoleChange: (userId: string, newRole: UserData["role"]) => void;
  onManagerChange: (userId: string, managerId: string) => void;
  onAction: (userId: string, action: UserAction) => void;
}

export function UserManagementTable({
  users, managers, currentUserId, onRoleChange, onManagerChange, onAction,
}: UserManagementTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          {/* Improved Header Styling */}
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[300px]">User</TableHead>
            <TableHead className="w-[180px]">Role</TableHead>
            <TableHead className="w-[220px]">Manager</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-accent">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    {/* Improved Avatar Fallback */}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div suppressHydrationWarning={true} className="text-sm text-muted-foreground">
                      Joined on {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(newRole: UserData["role"]) => onRoleChange(user.id, newRole)}
                  disabled={user.id === currentUserId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2 font-medium text-destructive">
                        <Shield className="h-4 w-4" /> Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="MANAGER">
                      <div className="flex items-center gap-2 font-medium text-primary">
                        <Users className="h-4 w-4" /> Manager
                      </div>
                    </SelectItem>
                    <SelectItem value="EMPLOYEE">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" /> Employee
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={user.managerId || "none"}
                  onValueChange={(value) => { onManagerChange(user.id, value === "none" ? "" : value); }}
                  disabled={user.role === "ADMIN"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No manager</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                {/* Improved, Theme-Aware Badge Styling */}
                <Badge
                  variant="outline"
                  className={
                    user.status === "active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-secondary text-secondary-foreground border-border"
                  } >
                  {user.status === "active" ? ( <CheckCircle className="h-3 w-3 mr-1.5" /> ) : ( <XCircle className="h-3 w-3 mr-1.5" /> )}
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Send Password Reset</DropdownMenuItem>
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit User</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onAction(user.id, "toggleStatus")}
                      className={user.status === "active" ? "text-destructive focus:text-destructive" : "text-emerald-600 focus:text-emerald-600"} >
                      {user.status === "active" ? ( <><UserX className="h-4 w-4 mr-2" /> Deactivate User</> ) : ( <><UserCheck className="h-4 w-4 mr-2" /> Activate User</> )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}