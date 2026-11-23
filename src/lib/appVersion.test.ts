import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { APP_VERSION } from "@/lib/appVersion";

// Quatre fichiers doivent annoncer la même version : celui que lit l'app, celui que lit npm, et
// les deux projets natifs qui la montrent aux testeurs dans TestFlight et dans Play.
describe("la version de l'app", () => {
  it("est la même dans package.json", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version?: string };
    expect(pkg.version).toBe(APP_VERSION);
  });

  it("est la même dans le projet Android", () => {
    const gradle = readFileSync("android/app/build.gradle", "utf8");
    expect(gradle).toContain(`versionName "${APP_VERSION}"`);
  });

  it("est la même dans le projet iOS, dans chacune de ses configurations", () => {
    const pbx = readFileSync("ios/App/App.xcodeproj/project.pbxproj", "utf8");
    const found = [...pbx.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
    expect(found.length).toBeGreaterThan(0);
    expect(new Set(found)).toEqual(new Set([APP_VERSION]));
  });
});
