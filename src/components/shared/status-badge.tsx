import { FC } from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  size?: "sm" | "md" | "lg";
}

const StatusBadge: FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return { variant: "secondary", text: "Pending" };
      case "APPROVED":
        return { variant: "default", text: "Approved" };
      case "REJECTED":
        return { variant: "destructive", text: "Rejected" };
      case "PAID":
        return { variant: "default", text: "Paid" };
      default:
        return { variant: "secondary", text: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant as any}
      className={`${
        size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"
      }`}
    >
      {config.text}
    </Badge>
  );
};

export default StatusBadge;
