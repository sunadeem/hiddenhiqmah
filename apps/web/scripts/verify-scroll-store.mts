/**
 * Proves the scroll-position store cannot grow without bound over a long session.
 * Run: npx tsx apps/web/scripts/verify-scroll-store.mts
 *
 * The repo has no test runner; this mirrors the verify:fcm precedent.
 */
import { set, get, __size, __clear } from "../src/lib/mobile/scrollStore.js";

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

__clear();
for (let i = 1; i <= 60; i++) set(`/route-${i}`, i * 10);

check("bounded at 50 after 60 inserts", __size() === 50, `size=${__size()}`);
check("oldest key evicted", get("/route-1") === undefined);
check("key 10 evicted (60 - 50)", get("/route-10") === undefined);
check("key 11 retained (first survivor)", get("/route-11") === 110, `v=${get("/route-11")}`);
check("newest key retained", get("/route-60") === 600, `v=${get("/route-60")}`);

// Re-setting an old key must refresh its recency and rescue it from the next
// eviction — otherwise a route the user keeps returning to is the one thrown away.
set("/route-11", 999);
check("re-set updates the value", get("/route-11") === 999);
check("re-set does not grow the map", __size() === 50, `size=${__size()}`);
set("/route-61", 610);
check("re-set rescued /route-11 from eviction", get("/route-11") === 999);
check("next-oldest (/route-12) evicted instead", get("/route-12") === undefined);
check("still bounded", __size() === 50, `size=${__size()}`);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
