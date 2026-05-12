"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const [profileText, setProfileText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/profile`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile_text) {
          setProfileText(data.profile_text);
        }
      })
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile_text: profileText }),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Profile saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="rounded-md p-2 hover:bg-accent text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Larreth Profile</h1>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Update the profile text below. The chatbot uses this information to personalize responses.
        </p>

        <textarea
          value={profileText}
          onChange={(e) => setProfileText(e.target.value)}
          className="min-h-[400px] w-full resize-none rounded-md border border-input bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter profile text..."
        />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-[150px] self-end rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
