"use client";

import BottomSheet from "./BottomSheet";
import { QiblahSection } from "@/components/QiblahSection";

export default function QiblahSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Qiblah">
      <div className="px-3 pt-2 pb-6">
        <QiblahSection compact />
      </div>
    </BottomSheet>
  );
}
