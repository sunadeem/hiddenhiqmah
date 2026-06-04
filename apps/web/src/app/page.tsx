import RouteGate from "@/components/mobile/RouteGate";
import WebHomePage from "@/components/web/HomePage";
import MobileHomeScreen from "@/components/mobile/screens/HomeScreen";

export default function Page() {
  return <RouteGate mobile={<MobileHomeScreen />} web={<WebHomePage />} />;
}
