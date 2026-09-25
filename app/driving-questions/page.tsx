import { redirect } from "next/navigation";

// This page used to render every question (up to 2413 of them, including
// live <video> elements) on one server-rendered page - a 20+ second load
// producing a ~700,000px-tall page on a real device. The Cheat Sheet's
// Answer Key tab now covers the same "browse every question with its
// correct answer" need properly (chapter drill-down, search, license-class
// scoping, no all-at-once render), so this route just forwards there
// rather than keeping a second, broken copy of the same feature around.
export default function DrivingQuestionsRedirect() {
  redirect("/cheatsheet");
}
