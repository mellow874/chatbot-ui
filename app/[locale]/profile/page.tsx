"use client"

import { useEffect, useState } from "react"

export default function ProfilePage() {
  const [profileText, setProfileText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock GET /profile
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        setProfileText(data.profile_text)
        setLoading(false)
      })
      .catch(() => {
        setProfileText("")
        setLoading(false)
      })
  }, [])

  const handleSave = () => {
    // Mock PUT /profile
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_text: profileText })
    })
      .then(() => alert("Profile saved"))
      .catch(() => alert("Error saving profile"))
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Profile</h1>
      <textarea
        value={profileText}
        onChange={(e) => setProfileText(e.target.value)}
        className="w-full h-64 p-2 border rounded text-black"
        placeholder="Enter your profile text"
      />
      <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Save
      </button>
    </div>
  )
}