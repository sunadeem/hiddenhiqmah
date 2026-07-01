import HifzScreen from "@/components/mobile/screens/HifzScreen";
import WebMobilePageFrame from "@/components/WebMobilePageFrame";

export default function Page() {
  // On web, HifzScreen hides its own top-level header, so the PageHeader is the
  // page title (sub-views keep their internal back header).
  return (
    <WebMobilePageFrame
      title="Hifz"
      titleAr="الحفظ"
      subtitle="Memorize the Qur'an with spaced repetition"
    >
      <HifzScreen />
    </WebMobilePageFrame>
  );
}
