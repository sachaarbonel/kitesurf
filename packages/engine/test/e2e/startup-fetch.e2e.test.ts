// Copyright (c) 2026 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
// https://opensource.org/licenses/Apache-2.0

import { expect, test } from "./harness";
import { setContent } from "./set-content";

test("a fetch reference captured by a startup module works after load", async ({ page }) => {
  await setContent(
    page,
    `<!doctype html>
    <button id="load">Load</button>
    <output id="startup">pending</output>
    <output id="result">pending</output>
    <script type="module">
      const savedFetch = globalThis.fetch;
      void savedFetch("data:text/plain,started").then(async (response) => {
        document.querySelector("#startup").textContent = await response.text();
      });
      document.querySelector("#load").onclick = async () => {
        const response = await savedFetch("data:text/plain,loaded");
        document.querySelector("#result").textContent = await response.text();
      };
    </script>`,
  );

  await expect.poll(() => page.$eval("#startup", (element) => element.textContent)).toBe("started");
  await page.click("#load");
  await expect.poll(() => page.$eval("#result", (element) => element.textContent)).toBe("loaded");
});
