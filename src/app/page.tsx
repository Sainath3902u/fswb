import { redirect } from "next/navigation";

export default function Home() {
  // Automatically redirect anyone visiting "/" straight to the login screen
  redirect("/auth/login");
}