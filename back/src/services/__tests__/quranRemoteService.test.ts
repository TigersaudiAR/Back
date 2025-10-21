import assert from "node:assert/strict";
import { mock, test } from "node:test";

import {
  FAILED_AYAT_RETRY_DELAY_MS,
  fetchSurahAyat
} from "../quranRemoteService.js";

const SURAH_ID = 9999;

test("retries remote ayat fetch after failure window expires", async (t) => {
  let callCount = 0;
  const fetchMock = mock.fn(async () => {
    callCount += 1;
    if (callCount === 1) {
      return {
        ok: false,
        status: 500
      } as any;
    }

    return {
      ok: true,
      status: 200,
      async json() {
        return {
          data: {
            ayahs: [
              {
                numberInSurah: 1,
                text: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ"
              }
            ]
          }
        };
      }
    } as any;
  });

  mock.method(global, "fetch", fetchMock);

  mock.timers.enable({ apis: ["Date"], now: 0 });

  t.after(() => {
    mock.restoreAll();
    mock.timers.reset();
  });

  const firstAttempt = await fetchSurahAyat(SURAH_ID);
  assert.equal(fetchMock.mock.callCount(), 1, "first attempt should call fetch once");
  assert.deepEqual(firstAttempt.ayat, [], "first attempt falls back to empty result");

  mock.timers.tick(FAILED_AYAT_RETRY_DELAY_MS + 1);

  const secondAttempt = await fetchSurahAyat(SURAH_ID);
  assert.equal(fetchMock.mock.callCount(), 2, "second attempt should re-call remote API");
  assert.equal(secondAttempt.fromCache, false, "second attempt should not be cached");
  assert.equal(secondAttempt.ayat.length, 1, "remote ayat should populate cache");
  assert.equal(secondAttempt.ayat[0]?.text_ar, "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ");
});
