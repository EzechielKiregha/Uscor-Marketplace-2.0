import { getBusinessTypeConfig } from "@/config/business-types";

interface BusinessTypeIconProps {
  businessType: string;
  className?: string;
}

export default function BusinessTypeIcon({
  businessType,
  className,
}: BusinessTypeIconProps) {
  const config = getBusinessTypeConfig(businessType);
  const Icon = config.icon;
  return <Icon className={className} />;
}
