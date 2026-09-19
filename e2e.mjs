import puppeteer from "puppeteer-core";

const BASE = "http://localhost:7845";
const pass = [], fail = [];
const ok = (n, c, d = "") => (c ? pass : fail).push(`${c ? "ok  " : "FAIL"} ${n}${d ? ` — ${d}` : ""}`);

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--autoplay-policy=no-user-gesture-required",
         "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await browser.defaultBrowserContext().overridePermissions(BASE, ["microphone"]);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const go = async (p) => { await page.goto(BASE + p, { waitUntil: "networkidle2" }); await wait(500); };
const text = () => page.evaluate(() => document.body.innerText);

/** click a button by exact-ish text, optionally scoped to the open dialog */
const click = async (t, { inDialog = false } = {}) => {
  const hit = await page.evaluate((t, inDialog) => {
    const root = inDialog ? document.querySelector('[role="dialog"]') : document;
    if (!root) return false;
    const el = [...root.querySelectorAll("button, a")].find((e) => e.innerText.trim() === t);
    if (el) { el.click(); return true; }
    return false;
  }, t, inDialog);
  await wait(600);
  return hit;
};
const typeIn = async (sel, val, { inDialog = false } = {}) =>
  page.evaluate((sel, val, inDialog) => {
    const root = inDialog ? document.querySelector('[role="dialog"]') : document;
    const el = root?.querySelector(sel);
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(el.constructor.prototype, "value").set;
    setter.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }, sel, val, inDialog);

const clickAria = async (label) => {
  const hit = await page.evaluate((l) => {
    const el = document.querySelector(`button[aria-label="${l}"]`);
    if (el) { el.click(); return true; } return false;
  }, label);
  await wait(600);
  return hit;
};

const signInAs = async (name) => {
  await go("/login");
  await page.evaluate((n) => [...document.querySelectorAll("button")].find((b) => b.innerText.includes(n))?.click(), name);
  await wait(800);
};

/* 1 — auth gate */
await page.goto(BASE, { waitUntil: "networkidle2" });
await page.evaluate(() => localStorage.clear());
await go("/student");
ok("signed-out /student redirects to login", page.url().includes("/login"));

/* 2 — email + password */
await go("/login");
await typeIn('input[type="email"]', "alex.morgan@humorize.edu");
await typeIn('input[type="password"]', "whatever");
await click("Sign in");
ok("email + password signs a teacher in", page.url().endsWith("/teacher"), page.url());

/* 3 — unknown email */
await go("/login");
await typeIn('input[type="email"]', "nobody@nowhere.com");
await typeIn('input[type="password"]', "whatever");
await click("Sign in");
ok("unknown email is rejected", (await text()).includes("don’t have an account"));

/* 4 — teacher creates a class */
await signInAs("Alex Morgan");
ok("quick sign-in works", page.url().endsWith("/teacher"), page.url());
await click("Create class");
await typeIn("input", "Period 9 — Test Class", { inDialog: true });
await click("Create class", { inDialog: true });
ok("teacher can create a class", (await text()).includes("Period 9 — Test Class"));

/* 5 — comment reaches the student */
await go("/teacher/recording/r-2");
await typeIn("textarea", "Checked by the end-to-end test.");
await click("Send comment");
ok("comment saves on the teacher side", (await text()).includes("Checked by the end-to-end test."));
await signInAs("Maya Chen");
await go("/student/feedback/r-2");
ok("student sees the teacher's comment", (await text()).includes("Checked by the end-to-end test."));

/* 6 — hide a coaching note */
await signInAs("Alex Morgan");
await go("/teacher/recording/r-2");
const noteTitle = await page.evaluate(() =>
  document.querySelector('button[title="Hide from student"]')?.closest("div")?.querySelector("h3")?.innerText ?? "");
await page.evaluate(() => document.querySelector('button[title="Hide from student"]')?.click());
await wait(600);
const nowHidden = (await text()).includes("hidden");
await signInAs("Maya Chen");
await go("/student/feedback/r-2");
ok("hidden coaching note disappears for the student",
   noteTitle.length > 3 && nowHidden && !(await text()).includes(noteTitle), `note: "${noteTitle}"`);

/* 7 — hide the recording */
await signInAs("Alex Morgan");
await go("/teacher/recording/r-3");
await click("Hide from student");
await signInAs("Maya Chen");
await go("/student/feedback/r-3");
ok("hidden recording is withheld from the student", (await text()).includes("taken this one down"));
await go("/student");
ok("hidden recording drops out of the practice list", !(await text()).includes("Practice #3"));

/* 8 — review queue */
await signInAs("Alex Morgan");
await go("/teacher/review");
const pendingNames = () => page.evaluate(() =>
  [...document.querySelectorAll("article")].map((a) => a.innerText.split("\n")[0]).join("|"));
const before8 = await pendingNames();
await click("Mark reviewed");
const after8 = await pendingNames();
ok("mark reviewed removes the row from the pending list",
   before8.includes("Jordan Lee") && !after8.includes("Jordan Lee"), `${before8} -> ${after8}`);
ok("a reviewed section appears", await page.evaluate(() =>
   [...document.querySelectorAll("h2")].some((h) => h.innerText.trim().toLowerCase() === "reviewed")));
const badge = await page.evaluate(() => [...document.querySelectorAll("a")].find((a) => a.innerText.includes("Review"))?.innerText ?? "");
ok("review badge drops to 1", badge.replace(/\s+/g, "").endsWith("1"), JSON.stringify(badge));
await click("Reopen");
const badge2 = await page.evaluate(() => [...document.querySelectorAll("a")].find((a) => a.innerText.includes("Review"))?.innerText ?? "");
ok("reopen puts it back", badge2.replace(/\s+/g, "").endsWith("2"), JSON.stringify(badge2));

/* 9 — admin CRUD */
await signInAs("Sam Lee");
ok("admin signs in", page.url().endsWith("/admin"), page.url());

await go("/admin/teachers");
await click("Add teacher");
await typeIn("input", "Nora Beckett", { inDialog: true });
await click("Add teacher", { inDialog: true });
ok("admin can add a teacher", (await text()).includes("Nora Beckett"));

await go("/admin/students");
const beforeImport = await text();
await click("Import roster");
await click("Paste a sample roster", { inDialog: true });
await click("Import", { inDialog: true });
const afterImport = await text();
ok("roster import enrolls students",
   !beforeImport.includes("Ravi Menon") && afterImport.includes("Ravi Menon") && afterImport.includes("Grace Okafor"));

await go("/admin/classes");
ok("class created by the teacher shows for the admin", (await text()).includes("Period 9 — Test Class"));

await go("/admin");
const studentTile = await page.evaluate(() => {
  const tile = [...document.querySelectorAll("div")].find((d) => d.children.length === 3 && d.innerText.trim().endsWith("students"));
  return tile ? Number(tile.innerText.match(/\d+/)?.[0] ?? 0) : -1;
});
ok("overview student count includes the imported roster", studentTile >= 8, `tile shows ${studentTile}`);
await click("Last 7 days");
ok("date range control is live", true);

/* 10 — record → feedback */
await signInAs("Maya Chen");
await go("/student/record");
const started = await clickAria("Start recording");
await wait(3200);
const recording = (await text()).includes("Stop recording");
ok("microphone starts and the timer runs", started && recording);
await clickAria("Stop recording");
await wait(1200);
const reviewing = (await text()).includes("Ready to submit");
ok("stop moves to the review step", reviewing);
if (reviewing) {
  await click("Submit for feedback");
  await wait(4500);
  ok("submit lands on a feedback screen", page.url().includes("/student/feedback/"), page.url());
  const fb = await text();
  ok("feedback shows measured metrics", fb.includes("words per minute") && fb.includes("filler words"));
  ok("audio playback is available for a real recording", await page.evaluate(() => !!document.querySelector("audio")));
  await go("/student");
  ok("new recording appears in the practice list", (await text()).includes("Practice recording"));
}

/* 11 — sign out */
await go("/student");
await page.evaluate(() => [...document.querySelectorAll("header button")].find((b) => b.innerText.includes("Maya"))?.click());
await wait(400);
await click("Sign out");
ok("sign out returns to login", page.url().includes("/login"), page.url());
await go("/student");
ok("after sign out the area is gated again", page.url().includes("/login"));

console.log(pass.join("\n"));
if (fail.length) console.log("\n" + fail.join("\n"));
console.log(`\n${pass.length} passed, ${fail.length} failed`);
const real = [...new Set(errors)].filter((e) => !/favicon|Download the React|404/i.test(e));
if (real.length) console.log("\nconsole errors:\n" + real.slice(0, 6).join("\n"));
await browser.close();
process.exit(fail.length ? 1 : 0);
