// Lightweight, zero-dependency password-strength indicator.
// Scores 0–4 by length + character variety (not a full entropy estimate like
// zxcvbn, but enough to nudge users toward stronger passwords).

export function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["#ef4444", "#ef4444", "#f59e0b", "#eab308", "#22c55e"];

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background: i < score ? COLORS[score] : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
      <p className="text-[11px] mt-1" style={{ color: COLORS[score] }}>
        {LABELS[score]}
      </p>
    </div>
  );
}
