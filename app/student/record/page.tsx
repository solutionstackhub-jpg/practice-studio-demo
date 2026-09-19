import { StudentPage } from "@/components/shells";
import { Recorder } from "@/components/recorder";

export default function RecordPage() {
  return (
    <StudentPage back={{ href: "/student" }}>
      <Recorder />
    </StudentPage>
  );
}
