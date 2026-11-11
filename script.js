// ===== Settings: edit these two lines =====
// 1) Your contact email (shown in the footer "Contact" link and used as a fallback for the form)
const CONTACT_EMAIL = "hello@example.com";
// 2) Form endpoint. Create a free form at https://formspree.io and paste its URL here,
//    e.g. "https://formspree.io/f/abcdwxyz". Leave empty to send signups by email instead.
const FORM_ENDPOINT = "";
// ==========================================

document.getElementById("year").textContent = new Date().getFullYear();

const contact = document.getElementById("contact-link");
contact.href = "mailto:" + CONTACT_EMAIL;

// Plan picker → summary + waitlist form
const billing = { 1: "one-time box", 3: "billed every 3 months", 6: "billed every 6 months", 12: "billed every 12 months" };
function updatePlan() {
  const r = document.querySelector('input[name="plan"]:checked');
  if (!r) return;
  const label = r.value === "1" ? "1 month" : `${r.value} months`;
  document.getElementById("sum-plan").textContent = label;
  document.getElementById("sum-total").textContent = "$" + r.dataset.total;
  document.getElementById("sum-billing").textContent = billing[r.value];
  document.getElementById("form-plan").value = label;
  document.getElementById("form-plan-label").textContent = label;
}
document.querySelectorAll('input[name="plan"]').forEach((r) => r.addEventListener("change", updatePlan));
updatePlan();

const form = document.getElementById("waitlist-form");
const statusEl = document.getElementById("form-status");

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = "form-status " + (kind || "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.email;
  const country = form.country;
  email.removeAttribute("aria-invalid");
  country.removeAttribute("aria-invalid");

  if (!email.value || !email.checkValidity()) {
    email.setAttribute("aria-invalid", "true");
    email.focus();
    setStatus("Enter an email address like name@example.com.", "err");
    return;
  }
  if (!country.value) {
    country.setAttribute("aria-invalid", "true");
    country.focus();
    setStatus("Choose your country so we know where to ship.", "err");
    return;
  }
  if (form._gotcha.value) return; // bot

  const interests = [...form.querySelectorAll('input[name="interest"]:checked')].map((i) => i.value);

  if (!FORM_ENDPOINT) {
    const body = `Email: ${email.value}\nCountry: ${country.value}\nPlan: ${form.plan.value}\nInterested in: ${interests.join(", ") || "-"}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Kyushu Treat waitlist")}&body=${encodeURIComponent(body)}`;
    setStatus("Your email app should open. Send the message to join the waitlist.", "ok");
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  setStatus("Joining…");
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, country: country.value, plan: form.plan.value, interests: interests.join(", ") }),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    updatePlan();
    setStatus("You're on the waitlist. We'll email you when founding spots open.", "ok");
  } catch (err) {
    setStatus(`Couldn't join right now. Try again, or email ${CONTACT_EMAIL}.`, "err");
  } finally {
    button.disabled = false;
  }
});
