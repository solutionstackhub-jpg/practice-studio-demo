import { StudentPage } from "@/components/shells";
import { RecentPractice } from "@/components/recent-practice";
import { SignalRule } from "@/components/decor";

export default function MyPractice() {
  return (
    <StudentPage>
      <div className="rise">
        <p className="eyebrow">Period 3 · Public Speaking</p>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-ink">My practice</h1>
        <p className="mt-2 text-[14.5px] text-body">Every clip you have recorded, newest first.</p>
        <SignalRule seed={17} className="mt-5" />
      </div>
      <div className="rise mt-6" style={{ animationDelay: "80ms" }}>
        <RecentPractice limit={25} showDuration />
      </div>
    </StudentPage>
  );
}
