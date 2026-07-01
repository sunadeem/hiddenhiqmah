import CirclesScreen from "@/components/mobile/screens/CirclesScreen";
import WebMobilePageFrame from "@/components/WebMobilePageFrame";

export default function Page() {
  return (
    <WebMobilePageFrame
      title="Circles"
      titleAr="الحلقات"
      subtitle="Shared goals & gentle accountability with others"
    >
      <CirclesScreen />
    </WebMobilePageFrame>
  );
}
