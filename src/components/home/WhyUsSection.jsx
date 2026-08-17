// import {
//   HiOutlineAcademicCap,
//   HiOutlineBeaker,
//   HiOutlineBuildingOffice2,
//   HiOutlineGlobeAlt,
//   HiOutlineSparkles,
//   HiOutlineTrophy,
// } from "react-icons/hi";
import { HiOutlineBuildingOffice2, HiOutlineTrophy } from "react-icons/hi2";
import { cx, ICON_PILL } from "./homeUi";
import { HiOutlineAcademicCap, HiOutlineBeaker, HiOutlineGlobeAlt, HiOutlineSparkles } from "react-icons/hi";
import { APP_UNIVERSITY_NAME } from "../../constants/app";

const FEATURES = [
  {
    icon: <HiOutlineTrophy className="h-5 w-5" />,
    title: "95% Placement Support",
    text: "Dedicated placement cell with campus interviews and career counselling.",
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    icon: <HiOutlineAcademicCap className="h-5 w-5" />,
    title: "Expert Faculty",
    text: "50+ experienced professors and industry mentors across all programs.",
    color: "bg-indigo-500/15 text-indigo-400",
  },
  {
    icon: <HiOutlineBeaker className="h-5 w-5" />,
    title: "Modern Labs & Campus",
    text: "State-of-the-art labs, libraries and a safe residential campus.",
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: <HiOutlineSparkles className="h-5 w-5" />,
    title: "Scholarships & Financial Aid",
    text: "Merit scholarships and flexible installment plans for every program.",
    color: "bg-pink-500/15 text-pink-400",
  },
  {
    icon: <HiOutlineBuildingOffice2 className="h-5 w-5" />,
    title: "Hostel & Facilities",
    text: "Comfortable hostel accommodation with 24×7 security and Wi-Fi.",
    color: "bg-sky-500/15 text-sky-400",
  },
  {
    icon: <HiOutlineGlobeAlt className="h-5 w-5" />,
    title: "Global Exposure",
    text: "Exchange programs, international collaborations and industry tie-ups.",
    color: "bg-purple-500/15 text-purple-400",
  },
];

export default function WhyUsSection() {
  return (
    <section
      id="why-us"
      className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div
            className={cx(
              ICON_PILL,
              "mb-3 border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
            )}
          >
            Why Choose Us
          </div>
          <h2 className="mb-3 text-3xl font-extrabold text-white lg:text-4xl">
            The {APP_UNIVERSITY_NAME} Advantage
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-white/40 sm:text-base">
            Everything you need to make the right admission decision — under one
            roof.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="home-card rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6"
              style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}
            >
              <div
                className={cx(
                  "mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                  f.color,
                )}
              >
                {f.icon}
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-white">{f.title}</h3>
              <p className="text-xs leading-relaxed text-white/40">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
