import HouseholdScreen from "@/components/mobile/screens/HouseholdScreen";
import WebMobilePageFrame from "@/components/WebMobilePageFrame";

export default function Page() {
  // Household renders its own title + description, so no PageHeader — just center.
  return (
    <WebMobilePageFrame>
      <HouseholdScreen />
    </WebMobilePageFrame>
  );
}
