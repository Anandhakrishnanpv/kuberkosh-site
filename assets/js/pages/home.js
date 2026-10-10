(function () {
"use strict";
function initDeck() {
var root = document.querySelector("[data-deck]");
if (!root) return;
var cards = Array.prototype.slice.call(root.querySelectorAll(".kk-deck-card"));
var dots = Array.prototype.slice.call(root.querySelectorAll(".kk-deck-dots i"));
var n = cards.length, front = 0, timer = null, hold = false, visible = true;
if (n < 2) return;
function paint() {
cards.forEach(function (c, k) {
var pos = (k - front + n) % n;
c.dataset.pos = pos;
c.querySelectorAll("a, button").forEach(function (el) { if (pos === 0) el.removeAttribute("tabindex"); else el.setAttribute("tabindex", "-1"); });
if (pos === 0) c.removeAttribute("aria-hidden"); else c.setAttribute("aria-hidden", "true");
});
dots.forEach(function (d, k) { d.classList.toggle("is-on", k === front); });
}
function tick() { front = (front + 1) % n; paint(); }
function run() {
clearInterval(timer);
if (!hold && visible && !document.hidden && !(window.KK && KK.reduce)) timer = setInterval(tick, 3600);
}
root.addEventListener("pointerenter", function () { hold = true; run(); });
root.addEventListener("pointerleave", function () { hold = false; run(); });
root.addEventListener("focusin", function () { hold = true; run(); });
root.addEventListener("focusout", function () { hold = false; run(); });
document.addEventListener("visibilitychange", run);
if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; run(); }).observe(root);
paint();
run();
}
function initRecent() {
var box = document.querySelector("[data-recent]");
if (!box) return;
var list = [];
try { list = JSON.parse(localStorage.getItem("kk-recent") || "[]"); } catch (e) {}
if (!Array.isArray(list) || !list.length) return;
var esc = function (t) { return String(t || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
box.innerHTML = list.slice(0, 8).map(function (p) {
if (!/^[a-z0-9-]+$/.test(p.slug || "")) return "";
return '<a href="products/' + p.slug + '.html"><img src="' + esc(KK.thumb(p.image)) + '" alt="" width="56" height="56" loading="lazy"><span><b>' + esc(p.name) + "</b><small>" + esc(p.category) + "</small></span></a>";
}).join("");
if (box.children.length) box.closest("section").hidden = false;
}
function initCollection() {
var track = document.querySelector("[data-col-track]");
if (!track) return;
var items = Array.prototype.slice.call(track.querySelectorAll(".kk-pitem"));
var prev = document.querySelector("[data-col-prev]");
var next = document.querySelector("[data-col-next]");
var all = document.querySelector("[data-col-all]");
var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-ctab]"));
function arrows() {
prev.disabled = track.scrollLeft <= 4;
next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
}
function step(dir) {
var card = items.filter(function (i) { return !i.hidden; })[0];
var w = card ? card.getBoundingClientRect().width + 20 : 320;
track.scrollBy({ left: dir * w * Math.max(1, Math.floor(track.clientWidth / w) - 1), behavior: "smooth" });
}
prev.addEventListener("click", function () { step(-1); });
next.addEventListener("click", function () { step(1); });
track.addEventListener("scroll", arrows, { passive: true });
window.addEventListener("resize", arrows);
tabs.forEach(function (t) {
t.addEventListener("click", function () {
var cat = t.dataset.ctab;
tabs.forEach(function (x) { x.setAttribute("aria-pressed", String(x === t)); });
var n = 0;
items.forEach(function (it) {
var show = cat === "All" || it.dataset.category === cat;
it.hidden = !show;
if (show) {
var card = it.firstElementChild;
card.style.animationDelay = Math.min(n++, 6) * 50 + "ms";
card.classList.remove("kk-pop"); void card.offsetWidth; card.classList.add("kk-pop");
}
});
track.scrollTo({ left: 0 });
all.href = cat === "All" ? "products.html" : "products.html?category=" + encodeURIComponent(cat);
all.textContent = cat === "All" ? "View all" : "View all " + cat;
arrows();
});
});
arrows();
}
document.addEventListener("DOMContentLoaded", function () {
initDeck();
initRecent();
initCollection();
});
})();