import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendly — College Attendance",
  description: "Smart attendance tracking for college students"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}