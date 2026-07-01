import StreaksScreen from "@/components/mobile/screens/StreaksScreen";
import WebMobilePageFrame from "@/components/WebMobilePageFrame";

export default function Page() {
  return (
    <WebMobilePageFrame
      title="Streaks"
      titleAr="السلسلة"
      subtitle="Your streak, pauses, mercy days & qadāʾ"
    >
      <StreaksScreen />
    </WebMobilePageFrame>
  );
}
