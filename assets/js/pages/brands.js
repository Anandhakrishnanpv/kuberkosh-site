(function () {
"use strict";
function initSpotWall() {
var wall = document.querySelector("[data-spotwall]");
if (!wall) return;
var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!fine || reduce) { wall.classList.add("is-all-lit"); return; }
var tiles = Array.prototype.slice.call(wall.querySelectorAll(".kk-logo-tile"));
var px = -9999, py = -9999, raf = 0;
function paint() {
raf = 0;
tiles.forEach(function (t) {
var r = t.getBoundingClientRect();
var d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
t.style.setProperty("--lit", Math.max(0, 1 - d / 320).toFixed(3));
});
}
var sec = wall.closest("section") || wall;
sec.addEventListener("pointermove", function (e) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); });
sec.addEventListener("pointerleave", function () { px = py = -9999; if (!raf) raf = requestAnimationFrame(paint); });
}
document.addEventListener("DOMContentLoaded", function () {
initSpotWall();
var input = document.getElementById("brand-search");
var dir = document.getElementById("brand-dir");
var count = document.getElementById("brand-count");
var empty = document.getElementById("brand-empty");
var emptyQ = document.getElementById("brand-empty-q");
if (!input || !dir) return;
var groups = Array.prototype.slice.call(dir.querySelectorAll(".kk-dir-group"));
var items = Array.prototype.slice.call(dir.querySelectorAll(".kk-dir-item"));
items.forEach(function (li) {
var n = li.querySelector(".kk-dir-name");
n.dataset.text = n.textContent;
});
var total = items.length;
var esc = function (s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };
function filter() {
var q = input.value.trim().toLowerCase();
var shown = 0;
items.forEach(function (li) {
var match = !q || li.dataset.name.indexOf(q) > -1;
li.hidden = !match;
var n = li.querySelector(".kk-dir-name");
var text = n.dataset.text;
if (match && q) {
var i = text.toLowerCase().indexOf(q);
n.innerHTML = esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
} else {
n.textContent = text;
}
if (match) shown++;
});
groups.forEach(function (g) { g.hidden = !g.querySelector(".kk-dir-item:not([hidden])"); });
count.textContent = shown === total ? total + " brands" : shown + " of " + total + " brands";
empty.hidden = shown > 0;
if (emptyQ) emptyQ.textContent = input.value.trim() || "it";
if (window.KK && KK.refresh) KK.refresh();
}
input.addEventListener("input", filter);
input.addEventListener("keydown", function (e) { if (e.key === "Escape") { input.value = ""; filter(); } });
var letters = {};
document.querySelectorAll(".kk-az[href]").forEach(function (a) { letters[a.getAttribute("href").slice(8)] = a; });
if ("IntersectionObserver" in window) {
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
if (!e.isIntersecting) return;
Object.keys(letters).forEach(function (k) { letters[k].classList.remove("is-current"); });
var a = letters[e.target.dataset.letter];
if (a) a.classList.add("is-current");
});
}, { rootMargin: "-160px 0px -70% 0px" });
groups.forEach(function (g) { io.observe(g); });
}
});
})();