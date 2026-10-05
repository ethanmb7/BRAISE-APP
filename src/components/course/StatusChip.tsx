import type { DisplayStatus } from "@/lib/course/engine";
import { STATUS_LABEL } from "@/lib/course/statusLabels";

export function StatusChip({ status }: { status: DisplayStatus }) {
  return <span className={`course-status course-status--${status}`}>{STATUS_LABEL[status]}</span>;
}
