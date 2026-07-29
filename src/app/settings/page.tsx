"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/store/project-store";

export default function SettingsPage() {
  const brandSettings = useProjectStore((s) => s.brandSettings);
  const setBrandSettings = useProjectStore((s) => s.setBrandSettings);
  const fileRef = useRef<HTMLInputElement>(null);

  const onLogoUpload = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBrandSettings({ logoUrl: url });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-[12.5px] font-medium tracking-wide text-primary uppercase">
          Brand kit
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">Settings</h1>
        <p className="mt-1 text-[14.5px] text-[color:var(--ink-soft)]">
          Prism learns your brand so remakes sound and look like you.
        </p>
      </div>

      <section className="surface-card space-y-5 p-5">
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand name</Label>
          <Input
            id="brandName"
            value={brandSettings.brandName}
            onChange={(e) => setBrandSettings({ brandName: e.target.value })}
            className="rounded-xl"
            placeholder="Prism"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone of voice</Label>
          <Textarea
            id="tone"
            value={brandSettings.toneOfVoice}
            onChange={(e) => setBrandSettings({ toneOfVoice: e.target.value })}
            className="min-h-28 rounded-xl"
            placeholder="How should generated copy and prompts sound?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Primary color</Label>
          <div className="flex items-center gap-3">
            <input
              id="color"
              type="color"
              value={brandSettings.primaryColor}
              onChange={(e) =>
                setBrandSettings({ primaryColor: e.target.value })
              }
              className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-1"
            />
            <Input
              value={brandSettings.primaryColor}
              onChange={(e) =>
                setBrandSettings({ primaryColor: e.target.value })
              }
              className="rounded-xl font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-[color:var(--surface)]">
              {brandSettings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brandSettings.logoUrl}
                  alt="Brand logo"
                  className="size-full object-contain"
                />
              ) : (
                <Upload className="size-5 text-[color:var(--ink-faint)]" />
              )}
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => fileRef.current?.click()}
              >
                Upload logo
              </Button>
              {brandSettings.logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setBrandSettings({ logoUrl: undefined })}
                >
                  Remove
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onLogoUpload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div
        className="surface-card p-4"
        style={{ borderColor: `${brandSettings.primaryColor}55` }}
      >
        <p className="text-xs text-[color:var(--ink-faint)]">Accent preview</p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="size-8 rounded-lg"
            style={{ backgroundColor: brandSettings.primaryColor }}
          />
          <p className="font-display text-lg">
            {brandSettings.brandName || "Brand"}
          </p>
        </div>
      </div>
    </div>
  );
}
