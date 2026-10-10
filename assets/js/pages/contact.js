(function () {
"use strict";
function initRepel() {
var h = document.querySelector("[data-repel]");
if (!h || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
var chars = [];
(function walk(node) {
Array.prototype.slice.call(node.childNodes).forEach(function (c) {
if (c.nodeType === 3) {
var frag = document.createDocumentFragment();
c.textContent.split("").forEach(function (ch) {
if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
var s = document.createElement("span");
s.className = "kk-ch"; s.textContent = ch; s.setAttribute("aria-hidden", "true");
frag.appendChild(s); chars.push({ el: s, x: 0, y: 0, r: 0 });
});
node.replaceChild(frag, c);
} else if (c.nodeType === 1) walk(c);
});
})(h);
setTimeout(function () { h.classList.add("is-ready"); }, 1700); // after the rise-in, let letters leave their masks
var px = -9999, py = -9999, running = false;
function loop() {
var moving = false;
chars.forEach(function (c) {
var b = c.el.getBoundingClientRect();
var dx = b.left + b.width / 2 - px, dy = b.top + b.height / 2 - py;
var d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 170);
var tx = (dx / d) * f * 22, ty = (dy / d) * f * 22, tr = (dx / d) * f * 14;
c.x += (tx - c.x) * 0.18; c.y += (ty - c.y) * 0.18; c.r += (tr - c.r) * 0.18;
if (Math.abs(tx - c.x) + Math.abs(ty - c.y) > 0.05) moving = true;
c.el.style.transform = "translate(" + (c.x - 0).toFixed(2) + "px," + c.y.toFixed(2) + "px) rotate(" + c.r.toFixed(2) + "deg)";
});
if (moving) requestAnimationFrame(loop); else running = false;
}
document.addEventListener("pointermove", function (e) {
px = e.clientX; py = e.clientY;
if (!running) { running = true; requestAnimationFrame(loop); }
}, { passive: true });
}
function initClock() {
var el = document.querySelector("[data-clock]");
if (!el) return;
var fmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
function tick() { el.textContent = fmt.format(new Date()); }
tick();
setInterval(tick, 15000);
}
document.addEventListener("DOMContentLoaded", function () {
initRepel();
initClock();
var form = document.getElementById("quote-form");
if (!form) return;
var KK = window.KK;
var status = document.getElementById("form-status");
var button = form.querySelector("[type=submit]");
var buttonHTML = button.innerHTML;
var endpoint = form.dataset.endpoint;
var email = form.dataset.email;
var product = KK.param("product");
var listBox = document.getElementById("quote-summary");
var fromList = KK.quote && KK.quote.items().length > 0;
if (product) {
var qty = KK.param("qty");
form.elements.message.value = product + (qty ? " — Qty " + qty : "");
form.elements.enquiryType.value = "Single product";
} else if (fromList) {
var n = KK.quote.items().length;
form.elements.message.value = "Please quote for the following:\n" + KK.quote.summary() + "\n\nDelivery location: ";
form.elements.enquiryType.value = n > 1 ? "Multiple products / BOM" : "Single product";
if (listBox) {
listBox.hidden = false;
listBox.querySelector("[data-summary-n]").textContent = n + (n === 1 ? " item" : " items");
}
}
function say(kind, text) {
status.className = "alert mt-4 mb-0 alert-" + (kind === "ok" ? "success" : "danger");
status.textContent = text;
status.hidden = false;
}
form.addEventListener("submit", function (e) {
e.preventDefault();
if (form.elements.website.value) return; // honeypot
if (!form.checkValidity()) {
form.classList.add("was-validated");
form.querySelector(":invalid").focus();
return;
}
var f = form.elements;
if (endpoint) {
button.disabled = true;
button.textContent = "Sending…";
fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
.then(function (res) {
if (!res.ok) throw new Error(res.status);
form.reset();
form.classList.remove("was-validated");
if (fromList && !product) KK.quote.clear();
if (listBox) listBox.hidden = true;
say("ok", "Thank you — your request has been received. Our team will get back to you shortly.");
})
.catch(function () {
say("err", "We couldn’t send your request right now. Please email " + email + ".");
})
.finally(function () {
button.disabled = false;
button.innerHTML = buttonHTML;
});
return;
}
var subject = "Quote request — " + f.name.value + (f.company.value ? " (" + f.company.value + ")" : "");
var body = [
"Name: " + f.name.value,
"Company: " + f.company.value,
"Email: " + f.email.value,
"Phone: " + f.phone.value,
"Enquiry type: " + f.enquiryType.value,
"",
"Requirement:",
f.message.value,
].join("\n");
location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
say("ok", "Your email app should now open with the request filled in — just press send. If it didn’t open, email us at " + email + ".");
});
});
})();