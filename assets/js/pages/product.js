(function () {
"use strict";
function initGallery() {
var gallery = document.querySelector("[data-gallery]");
if (!gallery) return;
var slides = Array.prototype.slice.call(gallery.querySelectorAll(".kk-gslide"));
var thumbs = Array.prototype.slice.call(gallery.querySelectorAll(".kk-gthumb"));
var label = gallery.querySelector("[data-glabel]");
var index = gallery.querySelector("[data-gindex]");
var media = gallery.querySelector(".kk-pd-media");
var box = document.querySelector("[data-lightbox]");
var lbImg = box && box.querySelector("[data-lb-img]");
var lbCap = box && box.querySelector("[data-lb-cap]");
var current = 0;
var n = slides.length;
if (label && slides[0]) label.textContent = slides[0].dataset.label;
function go(i, dir) {
if (n < 2) return;
i = (i + n) % n;
if (i === current) return;
slides.forEach(function (s, k) {
s.classList.toggle("is-active", k === i);
s.classList.toggle("from-left", k === i && dir < 0);
if (k === i) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
});
thumbs.forEach(function (t, k) {
if (k === i) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
});
if (thumbs[i]) thumbs[i].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
current = i;
if (label) label.textContent = slides[i].dataset.label;
if (index) index.textContent = i + 1;
media.classList.remove("is-zoom");
if (box && box.open) showInBox();
}
function showInBox() {
var img = slides[current].querySelector("img");
lbImg.src = img.currentSrc || img.src;
lbImg.alt = img.alt;
lbCap.textContent = slides[current].dataset.label + (n > 1 ? " · " + (current + 1) + " of " + n : "");
}
var justSwiped = false;
gallery.addEventListener("click", function (e) {
if (justSwiped) return;
var step = e.target.closest("[data-gstep]");
var thumb = e.target.closest("[data-go]");
if (step) return go(current + Number(step.dataset.gstep), Number(step.dataset.gstep));
if (thumb) return go(Number(thumb.dataset.go), Number(thumb.dataset.go) - current);
if (box && (e.target.closest("[data-open]") || e.target.closest(".kk-gstage"))) {
showInBox();
box.showModal();
}
});
var sx = null;
media.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") sx = e.clientX; });
media.addEventListener("pointerup", function (e) {
if (sx === null) return;
var dx = e.clientX - sx;
sx = null;
if (Math.abs(dx) > 40) {
justSwiped = true;
setTimeout(function () { justSwiped = false; }, 350);
go(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
}
});
document.addEventListener("keydown", function (e) {
var inside = gallery.contains(document.activeElement) || (box && box.open);
if (!inside || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
e.preventDefault();
go(current + (e.key === "ArrowRight" ? 1 : -1), e.key === "ArrowRight" ? 1 : -1);
});
if (box) {
box.addEventListener("click", function (e) {
var step = e.target.closest("[data-lb-step]");
if (step) return go(current + Number(step.dataset.lbStep), Number(step.dataset.lbStep));
if (e.target === box || e.target.closest("[data-close]")) box.close();
});
box.classList.toggle("is-single", n < 2);
}
}
function remember(root) {
try {
var item = { slug: root.dataset.slug, name: root.dataset.product, category: root.dataset.category, image: root.dataset.image };
var list = JSON.parse(localStorage.getItem("kk-recent") || "[]");
if (!Array.isArray(list)) list = [];
list = [item].concat(list.filter(function (p) { return p && p.slug !== item.slug; })).slice(0, 8);
localStorage.setItem("kk-recent", JSON.stringify(list));
} catch (e) {}
}
function initDirectQuote(name, getSel) {
var box = document.querySelector("[data-dq]");
if (!box || !box.showModal) return;
var form = box.querySelector("[data-dq-form]");
var sel = box.querySelector("[data-dq-sel]");
var status = box.querySelector("[data-dq-status]");
var submit = box.querySelector("[data-dq-submit]");
var wa = box.querySelector("[data-dq-wa]");
var hidden = box.querySelector("[data-dq-product]");
var endpoint = form.dataset.endpoint;
var email = form.dataset.email;
var submitHTML = submit.innerHTML;
var f = form.elements;
function say(kind, text) {
status.className = "alert mt-3 mb-0 " + (kind === "ok" ? "alert-success" : "alert-danger");
status.textContent = text;
status.hidden = false;
}
function label() {
var s = getSel();
return name + (s.opts ? " · " + s.opts : "");
}
function syncWa() {
var msg = "Hello KuberKosh, I'd like a quote for: " + label() + " — Qty " + (f.quantity.value || 1) + (f.location.value ? " — Delivery: " + f.location.value : "") + ". " + location.href.split("?")[0];
wa.href = "https://wa.me/917022285927?text=" + encodeURIComponent(msg);
}
document.addEventListener("click", function (e) {
if (!e.target.closest("[data-dq-open]")) return;
var s = getSel();
sel.textContent = s.opts || "Standard configuration";
f.quantity.value = s.qty;
hidden.value = label();
status.hidden = true;
syncWa();
box.showModal();
setTimeout(function () { f.name.focus(); }, 60);
});
box.addEventListener("click", function (e) {
if (e.target === box || e.target.closest("[data-dq-close]")) box.close();
});
form.addEventListener("input", syncWa);
form.addEventListener("submit", function (e) {
e.preventDefault();
if (f.website.value) return; // honeypot
if (!form.checkValidity()) {
form.classList.add("was-validated");
form.querySelector(":invalid").focus();
return;
}
var lines = [
"Product: " + hidden.value,
"Quantity: " + f.quantity.value,
"Delivery location: " + f.location.value,
"Page: " + location.href.split("?")[0],
"",
"Name: " + f.name.value,
"Company: " + f.company.value,
"Email: " + f.email.value,
"Phone: " + f.phone.value,
"",
"Notes:",
f.message.value,
];
if (endpoint) {
submit.disabled = true;
submit.textContent = "Sending…";
var data = new FormData(form);
data.append("enquiryType", "Single product");
fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
.then(function (res) {
if (!res.ok) throw new Error(res.status);
form.reset();
form.classList.remove("was-validated");
say("ok", "Thank you — your request for " + name + " has been received. Our team will get back to you shortly.");
})
.catch(function () { say("err", "We couldn’t send your request right now. Please email " + email + " or use WhatsApp."); })
.finally(function () { submit.disabled = false; submit.innerHTML = submitHTML; });
return;
}
var subject = "Quote request — " + name + " — " + f.name.value + (f.company.value ? " (" + f.company.value + ")" : "");
location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join(String.fromCharCode(10)));
say("ok", "Your email app should now open with the request filled in — just press send. If it didn’t open, email us at " + email + ".");
});
}
document.addEventListener("DOMContentLoaded", function () {
var root = document.querySelector("[data-product]");
var link = document.getElementById("quote-link");
var qtyEl = document.getElementById("qty");
if (!root || !link) return;
var name = root.dataset.product;
var qty = 1;
var picked = {};
root.querySelectorAll(".kk-chips").forEach(function (group) {
var first = group.querySelector(".kk-chip");
if (first) picked[group.dataset.option] = first.dataset.value;
});
function update() {
var opts = Object.keys(picked).map(function (k) { return k + ": " + picked[k]; }).join(" · ");
link.href = link.dataset.base + "?product=" + encodeURIComponent(name + (opts ? " · " + opts : "")) + "&qty=" + qty;
document.querySelectorAll("[data-quote-add][data-main]").forEach(function (b) {
b.dataset.options = opts;
b.dataset.qty = qty;
});
document.querySelectorAll("[data-qty-mirror]").forEach(function (el) { el.textContent = qty; });
var wa = document.getElementById("wa-link");
if (wa) {
var msg = "Hello KuberKosh, I'd like a quote for: " + name + (opts ? " (" + opts + ")" : "") + " — Qty " + qty + ". " + location.href.split("?")[0];
wa.href = "https://wa.me/917022285927?text=" + encodeURIComponent(msg);
}
}
document.addEventListener("click", function (e) {
var chip = e.target.closest(".kk-chip");
if (chip && root.contains(chip)) {
var group = chip.closest(".kk-chips");
picked[group.dataset.option] = chip.dataset.value;
group.querySelectorAll(".kk-chip").forEach(function (b) {
b.setAttribute("aria-pressed", String(b === chip));
});
var val = group.parentElement.querySelector(".kk-opt-val");
if (val) val.textContent = chip.dataset.value;
update();
}
var step = e.target.closest("[data-qty-step]");
if (step) {
qty = Math.max(1, Math.min(9999, qty + Number(step.dataset.qtyStep)));
qtyEl.textContent = qty;
update();
}
});
update();
initGallery();
remember(root);
initDirectQuote(name, function () {
return { opts: Object.keys(picked).map(function (k) { return k + ": " + picked[k]; }).join(" · "), qty: qty };
});
var bar = document.querySelector("[data-buybar]");
var main = document.getElementById("pd-actions");
if (bar && main && "IntersectionObserver" in window) {
new IntersectionObserver(function (entries) {
var past = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
bar.classList.toggle("is-up", past);
}).observe(main);
}
});
})();