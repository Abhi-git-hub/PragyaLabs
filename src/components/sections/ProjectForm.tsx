"use client";

import { useState } from "react";

/**
 * ProjectForm — concise inquiry delivered straight to WhatsApp.
 * Validates inline, saves the brief on this device (local copy),
 * then opens WhatsApp addressed to the studio with every detail
 * prefilled — the visitor presses send there. Confirmation is explicit.
 */
const WHATSAPP = "919311230129";
const STORE_KEY = "pragya-inquiries";
const BUDGETS = ["Exploring — no fixed budget yet", "Under ₹50k", "₹50k – ₹2L", "₹2L+", "Ongoing collaboration"];

export function ProjectForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [detail, setDetail] = useState("");
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [composed, setComposed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid work email.";
    if (detail.trim().length < 20) next.detail = "A sentence or two helps — 20 characters minimum.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const entry = {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      budget,
      detail: detail.trim(),
      at: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "[]");
      window.localStorage.setItem(STORE_KEY, JSON.stringify([...prev, entry]));
    } catch {
      /* private mode — WhatsApp delivery still works */
    }
    const text = encodeURIComponent(
      `New project inquiry — Pragya Labs\nName: ${entry.name}\nEmail: ${entry.email}\nCompany / project: ${entry.company || "—"}\nBudget / stage: ${entry.budget}\n\nWhat I'm trying to improve:\n${entry.detail}`
    );
    window.open(`https://wa.me/${WHATSAPP}?text=${text}`, "_blank", "noopener");
    setComposed(true);
  };

  const field = "w-full border border-line bg-void px-4 py-3 text-bone placeholder:text-faint focus:border-cyan focus:outline-none";

  return (
    <form onSubmit={submit} noValidate aria-label="Start a project">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className="meta mb-2 block text-faint">Name</label>
          <input id="pf-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "pf-name-err" : undefined} />
          {errors.name && <p id="pf-name-err" className="meta mt-2 text-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="pf-email" className="meta mb-2 block text-faint">Work email</label>
          <input id="pf-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@company.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "pf-email-err" : undefined} />
          {errors.email && <p id="pf-email-err" className="meta mt-2 text-error">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="pf-company" className="meta mb-2 block text-faint">Company or project</label>
          <input id="pf-company" name="company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} className={field} placeholder="Optional" />
        </div>
        <div>
          <label htmlFor="pf-budget" className="meta mb-2 block text-faint">Budget range or stage (optional)</label>
          <select id="pf-budget" name="budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={field}>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="pf-detail" className="meta mb-2 block text-faint">What are you trying to improve?</label>
          <textarea id="pf-detail" name="detail" rows={5} value={detail} onChange={(e) => setDetail(e.target.value)} className={field} placeholder="Where is information, workflow, or experience breaking down?" aria-invalid={!!errors.detail} aria-describedby={errors.detail ? "pf-detail-err" : undefined} />
          {errors.detail && <p id="pf-detail-err" className="meta mt-2 text-error">{errors.detail}</p>}
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-5">
        <button type="submit" data-cursor="OPEN" className="btn-primary">
          Send project context
        </button>
        <p className="meta text-faint">A concise brief is enough. We will reply with the most useful next step.</p>
      </div>
      {composed && (
        <p role="status" className="meta mt-5 border border-line bg-graphite px-4 py-3 text-bone">
          WhatsApp should have opened with your brief addressed to +91 93112 30129 — press send there and it reaches the studio directly. A copy is saved on this device.
        </p>
      )}
      <p className="meta mt-5 text-faint">
        No accounts, no newsletters, no sharing. What you write goes only into that WhatsApp message (plus a copy on your own device). See the{" "}
        <a href="/privacy" className="text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-cyan">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
