import RouteGate from "@/components/mobile/RouteGate";
import WebHomePage from "@/components/web/HomePage";
import MobileHome from "@/components/mobile/home/MobileHome";

export default function Page() {
  return <RouteGate mobile={<MobileHome />} web={<WebHomePage />} />;
}
