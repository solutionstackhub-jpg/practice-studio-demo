import Link from "next/link";
import { StudentPage } from "@/components/shells";
import { RecentPractice } from "@/components/recent-practice";
import { MottoCard, QuoteCard } from "@/components/decor";
import { Greeting } from "@/components/greeting";
import { StudentHeroMeta } from "@/components/student-meta";
import { SectionTitle } from "@/components/ui";
import { AmbientGlow } from "@/components/art";
import { Mic, ArrowRight } from "@/components/icons";

export default function StudentHome() {
  return (
    <StudentPage>
      <section className="rise relative grid gap-5 sm:grid-cols-[1fr_300px]">
        <AmbientGlow className="-left-24 -top-24 h-[280px] w-[420px]" />

        <div className="relative flex flex-col justify-center py-3">
          <StudentHeroMeta />
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[38px]">
            <Greeting />
          </h1>
          <p className="mt-2.5 text-[14.5px] text-body">Ready for another practice round?</p>
          <Link href="/student/record" className="btn btn-primary mt-7 w-fit px-5 py-3 text-[14.5px]">
            <Mic width={17} height={17} />
            Start a recording
            <ArrowRight width={16} height={16} />
          </Link>
        </div>

        <MottoCard />
      </section>

      <section className="rise mt-11" style={{ animationDelay: "90ms" }}>
        <SectionTitle
          action={
            <Link href="/student/practice" className="text-[13px] font-semibold text-gold hover:text-gold-2">
              View all
            </Link>
          }
        >
          Recent practice
        </SectionTitle>
        <RecentPractice limit={4} />
      </section>

      <section className="rise mt-5" style={{ animationDelay: "160ms" }}>
        <QuoteCard />
      </section>
    </StudentPage>
  );
}
