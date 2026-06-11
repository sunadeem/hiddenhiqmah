"use client";

import BottomSheet from "./BottomSheet";
import AskPage from "@/app/ask/page";

export default function AskSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <AskPage />
    </BottomSheet>
  );
}
