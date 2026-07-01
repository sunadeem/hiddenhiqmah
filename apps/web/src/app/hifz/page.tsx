import HifzScreen from "@/components/mobile/screens/HifzScreen";
import WebMobilePageFrame from "@/components/WebMobilePageFrame";

export default function Page() {
  // Hifz renders its own back + view-title header, so no PageHeader — just center.
  return (
    <WebMobilePageFrame>
      <HifzScreen />
    </WebMobilePageFrame>
  );
}
