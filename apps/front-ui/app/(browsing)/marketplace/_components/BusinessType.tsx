import { getBusinessTypeLabel } from "@/config/business-types";

export function GetBusinessType({ businessType }: { businessType: string }) {
  return getBusinessTypeLabel(businessType);
}
