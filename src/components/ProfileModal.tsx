import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Camera,
  User,
  Mail,
  CheckCircle2,
  Pencil,
  Upload,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

const AVATAR_PRESETS = [
  "https://picsum.photos/seed/a1/100/100",
  "https://picsum.photos/seed/b2/100/100",
  "https://picsum.photos/seed/c3/100/100",
  "https://picsum.photos/seed/d4/100/100",
  "https://picsum.photos/seed/e5/100/100",
  "https://picsum.photos/seed/f6/100/100",
];

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync local state when profile prop changes (e.g. after external update)
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setAvatarUrl(profile.avatarUrl);
      setUrlInput("");
      setShowUrlInput(false);
      setSaved(false);
      setNameError("");
    }
  }, [isOpen, profile]);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      setAvatarUrl(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput("");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    setNameError("");
    setSaving(true);
    // Simulate a brief save delay for UX
    await new Promise((r) => setTimeout(r, 600));
    onSave({ ...profile, name: name.trim(), avatarUrl });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* ── Header ── */}
              <div className="bg-primary px-8 pt-8 pb-16 relative text-white">
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-extrabold tracking-tight">Edit Profile</h2>
                <p className="text-white/70 text-sm mt-1">
                  Update your name and profile picture
                </p>
              </div>

              {/* ── Avatar (overlaps header) ── */}
              <div className="flex justify-center -mt-12 mb-4 relative z-10">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-2 ring-primary/20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Camera overlay */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* ── Body ── */}
              <div className="px-8 pb-8 space-y-5">
                {/* Avatar action buttons */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-primary border border-primary/20 hover:bg-red-100 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Photo
                  </button>
                  <button
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" />
                    Use URL
                  </button>
                </div>

                {/* URL input */}
                <AnimatePresence>
                  {showUrlInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 mt-1">
                        <input
                          type="url"
                          placeholder="https://example.com/photo.jpg"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
                          className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={handleUrlApply}
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preset avatars */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Pick
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((url) => (
                      <button
                        key={url}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                          avatarUrl === url
                            ? "border-primary scale-110 shadow-md shadow-primary/30"
                            : "border-transparent hover:border-slate-200"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name field */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      placeholder="Your full name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                        nameError
                          ? "border-primary bg-red-50 focus:ring-primary/20"
                          : "border-slate-200 bg-slate-50 focus:ring-primary/20 focus:border-primary/40"
                      }`}
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  </div>
                  {nameError && (
                    <p className="text-xs text-primary mt-1 font-medium">{nameError}</p>
                  )}
                </div>

                {/* Email field — read-only */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                    <span className="ml-2 normal-case font-normal text-slate-400">(read-only)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-dashed border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed select-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Contact support to change your email.
                  </p>
                </div>

                {/* Save button */}
                <Button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`w-full py-6 rounded-2xl text-base font-bold shadow-lg transition-all duration-300 ${
                    saved
                      ? "bg-green-500 hover:bg-green-500 shadow-green-200"
                      : "bg-primary hover:bg-primary/90 shadow-primary/20"
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Profile Updated!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
