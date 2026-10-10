(function () {
"use strict";
var KK = (window.KK = window.KK || {});
KK.thumb = function (src) {
return String(src || "").replace(/(img\/products\/[\w-]+?)(-480|-160)?\.webp$/, "$1-160.webp");
};
KK.param = function (name) {
return new URLSearchParams(location.search).get(name);
};
document.addEventListener("click", function (e) {
if (e.target.closest(".kk-social-link.is-todo")) e.preventDefault();
});
document.addEventListener("click", function (e) {
var link = e.target.closest("#kkNav a");
var menu = document.getElementById("kkNav");
if (!link || !menu || !menu.classList.contains("show") || !window.bootstrap) return;
window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
});
})();
(function () {
"use strict";
var KK = (window.KK = window.KK || {});
var io = "IntersectionObserver" in window
? new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (!entry.isIntersecting) return;
entry.target.classList.add("on");
io.unobserve(entry.target);
});
}, { rootMargin: "0px 0px -8% 0px", threshold: 0 })
: null;
KK.reveal = function (root) {
(root || document).querySelectorAll(".rv:not(.on)").forEach(function (el) {
if (io) io.observe(el);
else el.classList.add("on");
});
};
document.addEventListener("DOMContentLoaded", function () { KK.reveal(); });
})();
(function () {
"use strict";
var KK = (window.KK = window.KK || {});
var html = document.documentElement;
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
KK.reduce = reduce;
var vh = window.innerHeight;
var vw = window.innerWidth;
var clamp = function (v, min, max) { return v < min ? min : v > max ? max : v; };
var all = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
var scrubbers = [];   // { el, fn, on }
var listeners = [];   // fn(scrollY, velocity)
var ticking = false;
var lastY = window.scrollY;
var velocity = 0;
var near = "IntersectionObserver" in window
? new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
scrubbers.forEach(function (s) { if (s.el === e.target) s.on = e.isIntersecting; });
});
request();
}, { rootMargin: "25% 0px 25% 0px" })
: null;
function scrub(el, fn) {
scrubbers.push({ el: el, fn: fn, on: !near });
if (near) near.observe(el);
}
function onScroll(fn) { listeners.push(fn); }
function frame() {
ticking = false;
var y = window.scrollY;
velocity = y - lastY;
lastY = y;
for (var i = 0; i < scrubbers.length; i++) {
var s = scrubbers[i];
if (s.on) s.fn(s.el.getBoundingClientRect());
}
for (var j = 0; j < listeners.length; j++) listeners[j](y, velocity);
}
function request() {
if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}
KK.refresh = request;
KK.scrub = function (el, fn) { scrub(el, fn); };
KK.onScroll = function (fn) { onScroll(fn); };
KK.velocity = function () { return velocity; };
window.addEventListener("scroll", request, { passive: true });
window.addEventListener("resize", function () {
vh = window.innerHeight;
vw = window.innerWidth;
resizeHandlers.forEach(function (fn) { fn(); });
request();
});
var resizeHandlers = [];
function initChrome() {
var header = document.querySelector(".kk-header");
var bar = document.querySelector(".kk-progress i");
var top = document.querySelector("[data-totop]");
var ring = top && top.querySelector(".kk-totop-fill");
var LEN = 2 * Math.PI * 24;
if (ring) ring.style.strokeDasharray = LEN;
onScroll(function (y, v) {
var max = document.documentElement.scrollHeight - vh;
var p = max > 0 ? clamp(y / max, 0, 1) : 0;
if (bar) bar.style.transform = "scaleX(" + p + ")";
if (header) {
header.classList.toggle("is-scrolled", y > 8);
var busy = header.contains(document.activeElement) || document.querySelector("#kkNav.show, .offcanvas.show");
if (y > 520 && v > 6 && !busy) header.classList.add("is-hidden");
else if (v < -6 || y <= 520) header.classList.remove("is-hidden");
}
if (top) {
top.hidden = y < 900;
if (ring) ring.style.strokeDashoffset = LEN * (1 - p);
}
});
if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
}
function splitWords(el, className) {
var words = [];
(function walk(node) {
Array.prototype.slice.call(node.childNodes).forEach(function (child) {
if (child.nodeType === 3) {
var parts = child.textContent.split(/(\s+)/);
var frag = document.createDocumentFragment();
parts.forEach(function (part) {
if (!part) return;
if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
var outer = document.createElement("span");
outer.className = className;
var inner = document.createElement("span");
inner.textContent = part;
outer.appendChild(inner);
frag.appendChild(outer);
words.push(outer);
});
node.replaceChild(frag, child);
} else if (child.nodeType === 1 && child.tagName !== "BR") {
walk(child);
}
});
})(el);
return words;
}
function initSplit() {
var els = all("[data-split]");
if (reduce || !els.length) return;
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
if (!e.isIntersecting) return;
e.target.classList.add("is-in");
io.unobserve(e.target);
});
}, { rootMargin: "0px 0px -10% 0px" });
els.forEach(function (el) {
el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
splitWords(el, "kk-w").forEach(function (w, i) {
w.setAttribute("aria-hidden", "true");
w.firstChild.style.transitionDelay = Math.min(i * 55, 900) + "ms";
});
el.classList.add("is-split");
io.observe(el);
});
}
function initScrubWords() {
all("[data-scrub-words]").forEach(function (el) {
if (reduce) return;
var words = splitWords(el, "kk-sw");
el.classList.add("is-scrub");
var last = -1;
scrub(el, function (r) {
var t = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3), 0, 1);
var lit = t * (words.length + 2);
if (Math.abs(lit - last) < 0.02) return;
last = lit;
for (var i = 0; i < words.length; i++) words[i].style.opacity = clamp(0.16 + (lit - i), 0.16, 1);
});
});
}
function initParallax() {
if (reduce) return;
all("[data-parallax]").forEach(function (el) {
var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
scrub(el, function (r) {
var center = r.top + r.height / 2 - vh / 2;
el.style.transform = "translate3d(0," + (-center * speed).toFixed(1) + "px,0)";
});
});
}
function initExpand() {
all("[data-expand]").forEach(function (el) {
if (reduce) { el.classList.add("is-static"); return; }
scrub(el, function (r) {
var t = clamp((vh * 0.8 - r.top) / (vh * 0.8), 0, 1);
var side = Math.max(vw < 768 ? 20 : 24, (vw - 1232) / 2);
var inset = side * (1 - t);
var radius = 32 * (1 - t * 0.75);
el.style.clipPath = "inset(0px " + inset.toFixed(1) + "px round " + radius.toFixed(1) + "px)";
var img = el.querySelector("img");
if (img) img.style.transform = "scale(" + (1.12 - t * 0.12).toFixed(4) + ")";
});
});
}
function initHScroll() {
all("[data-hscroll]").forEach(function (sec) {
var track = sec.querySelector(".kk-hs-track");
var fill = sec.querySelector(".kk-hs-progress i");
if (!track) return;
var dist = 0;
var pinned = false;
function layout() {
pinned = !reduce && vw >= 992;
sec.classList.toggle("is-pinned", pinned);
track.style.transform = "";
if (!pinned) { sec.style.height = ""; return; }
dist = Math.max(0, track.scrollWidth - vw);
sec.style.height = dist + vh + "px";
}
layout();
resizeHandlers.push(layout);
window.addEventListener("load", layout);
scrub(sec, function (r) {
if (!pinned) {
if (fill) fill.style.transform = "scaleX(" + clamp(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth), 0, 1) + ")";
return;
}
var t = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
track.style.transform = "translate3d(" + (-t * dist).toFixed(1) + "px,0,0)";
if (fill) fill.style.transform = "scaleX(" + t + ")";
});
track.addEventListener("scroll", request, { passive: true });
});
}
function initStack() {
all("[data-stack]").forEach(function (wrap) {
var cards = all(":scope > .kk-stack-card", wrap);
cards.forEach(function (card, i) { card.style.setProperty("--i", i); });
if (reduce) return;
cards.forEach(function (card, i) {
var next = cards[i + 1];
if (!next) return;
var inner = card.firstElementChild;
scrub(card, function (r) {
if (vw < 768) { inner.style.transform = ""; inner.style.filter = ""; return; }
var n = next.getBoundingClientRect();
var t = clamp((r.bottom - n.top) / r.height, 0, 1);
inner.style.transform = "scale(" + (1 - t * 0.06).toFixed(4) + ")";
inner.style.filter = "brightness(" + (1 - t * 0.25).toFixed(3) + ")";
});
});
});
}
function initLines() {
all("[data-line]").forEach(function (sec) {
var fill = sec.querySelector(".kk-line-fill");
var steps = all("[data-step]", sec);
scrub(sec, function (r) {
var t = reduce ? 1 : clamp((vh * 0.75 - r.top) / (r.height * 0.9), 0, 1);
if (fill) fill.style.transform = "scaleX(" + t + ")";
steps.forEach(function (s, i) { s.classList.toggle("is-lit", t >= i / steps.length + 0.02); });
});
});
}
function initCounters() {
var els = all("[data-count]");
if (!els.length) return;
function run(el) {
var target = parseFloat(el.getAttribute("data-count"));
var suffix = el.getAttribute("data-suffix") || "";
if (reduce) { el.textContent = target + suffix; return; }
var start = performance.now();
(function tick(now) {
var t = clamp((now - start) / 1600, 0, 1);
var eased = 1 - Math.pow(1 - t, 4);
el.textContent = Math.round(target * eased) + suffix;
if (t < 1) requestAnimationFrame(tick);
})(start);
}
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (e) {
if (!e.isIntersecting) return;
run(e.target);
io.unobserve(e.target);
});
}, { threshold: 0.6 });
els.forEach(function (el) {
el.textContent = "0" + (el.getAttribute("data-suffix") || "");
io.observe(el);
});
}
function initStagger() {
all("[data-stagger]").forEach(function (wrap) {
all(".rv", wrap).forEach(function (el, i) { el.style.transitionDelay = (i % 8) * 80 + "ms"; });
});
}
function initMarquee() {
var box = document.querySelector(".kk-marquee");
var track = box && box.querySelector(".kk-marquee-track");
if (!track || reduce || !track.getAnimations) return;
var anim = track.getAnimations()[0];
if (!anim) return;
var rate = 1;
var dir = 1;
var skew = 0;
var visible = false;
var running = false;
new IntersectionObserver(function (e) {
visible = e[0].isIntersecting;
if (visible && !running) { running = true; requestAnimationFrame(loop); }
}).observe(box);
function loop() {
if (Math.abs(velocity) > 1) dir = velocity > 0 ? 1 : -1;
var target = dir * (1 + Math.min(Math.abs(velocity) / 6, 5));
rate += (target - rate) * 0.08;
skew += (clamp(-velocity * 0.18, -7, 7) - skew) * 0.12;
velocity *= 0.9;
anim.playbackRate = rate;
box.style.transform = "skewX(" + skew.toFixed(2) + "deg)";
if (visible) requestAnimationFrame(loop);
else running = false;
}
}
function initPointer() {
if (reduce || !finePointer) return;
document.addEventListener("pointermove", function (e) {
var tilt = e.target.closest && e.target.closest("[data-tilt]");
if (tilt) {
var r = tilt.getBoundingClientRect();
var x = (e.clientX - r.left) / r.width - 0.5;
var y = (e.clientY - r.top) / r.height - 0.5;
tilt.classList.add("is-tilting");
tilt.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-6px)";
tilt.style.setProperty("--gx", (x + 0.5) * 100 + "%");
tilt.style.setProperty("--gy", (y + 0.5) * 100 + "%");
}
}, { passive: true });
document.addEventListener("pointerout", function (e) {
var tilt = e.target.closest && e.target.closest("[data-tilt]");
if (tilt && !tilt.contains(e.relatedTarget)) {
tilt.classList.remove("is-tilting");
tilt.style.transform = "";
}
});
all("[data-zoom]").forEach(function (box) {
if (!box.querySelector("img")) return;
box.addEventListener("pointermove", function (e) {
var img = box.querySelector(".is-active > img") || box.querySelector("img");
if (e.target.closest("button")) { box.classList.remove("is-zoom"); return; }
var r = box.getBoundingClientRect();
img.style.transformOrigin = ((e.clientX - r.left) / r.width) * 100 + "% " + ((e.clientY - r.top) / r.height) * 100 + "%";
box.classList.add("is-zoom");
});
box.addEventListener("pointerleave", function () { box.classList.remove("is-zoom"); });
});
}
document.addEventListener("DOMContentLoaded", function () {
html.classList.add(reduce ? "motion-reduce" : "motion-ok");
initChrome();
initSplit();
initScrubWords();
initParallax();
initExpand();
initHScroll();
initStack();
initLines();
initCounters();
initStagger();
initPointer();
request();
});
})();
(function () {
"use strict";
var KK = (window.KK = window.KK || {});
var KEY = "kk-quote";
var root = document.documentElement.getAttribute("data-root") || "";
if (root === "./") root = "";
function load() {
try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
}
var items = load();
function save() {
try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage blocked: list lasts for this page only */ }
render();
document.dispatchEvent(new CustomEvent("kk:quote", { detail: items }));
}
var keyOf = function (it) { return it.slug + "|" + (it.options || ""); };
var total = function () { return items.reduce(function (n, it) { return n + it.qty; }, 0); };
var quote = (KK.quote = {
items: function () { return items.slice(); },
add: function (it) {
var key = keyOf(it);
var found = items.filter(function (x) { return keyOf(x) === key; })[0];
if (found) found.qty += it.qty || 1;
else items.push({ slug: it.slug, name: it.name, image: it.image || "", options: it.options || "", qty: it.qty || 1 });
save();
},
setQty: function (key, n) {
items.forEach(function (x) { if (keyOf(x) === key) x.qty = Math.max(1, Math.min(9999, n)); });
save();
},
remove: function (key) {
items = items.filter(function (x) { return keyOf(x) !== key; });
save();
},
clear: function () { items = []; save(); },
summary: function () {
return items.map(function (x, i) {
return (i + 1) + ". " + x.name + (x.options ? " (" + x.options + ")" : "") + " — Qty " + x.qty;
}).join("\n");
},
});
var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
function render() {
var n = total();
document.querySelectorAll("[data-quote-count]").forEach(function (b) {
b.textContent = n > 99 ? "99+" : n;
b.hidden = n === 0;
});
document.querySelectorAll("[data-quote-total]").forEach(function (el) {
el.textContent = items.length + (items.length === 1 ? " item" : " items");
});
var list = document.querySelector("[data-quote-list]");
if (!list) return;
list.innerHTML = items.map(function (x) {
var k = esc(keyOf(x));
return '<li class="kk-qitem" data-key="' + k + '">' +
(x.image ? '<img src="' + root + esc(KK.thumb(x.image)) + '" alt="" width="64" height="64">' : '<span class="kk-qitem-ph"></span>') +
'<div class="kk-qinfo"><a href="' + root + "products/" + esc(x.slug) + '.html">' + esc(x.name) + "</a>" +
(x.options ? '<span class="kk-qopts">' + esc(x.options) + "</span>" : "") +
'<div class="kk-qty sm"><button type="button" data-q="-1" aria-label="Decrease quantity of ' + esc(x.name) + '">−</button>' +
'<span aria-live="polite">' + x.qty + '</span><button type="button" data-q="1" aria-label="Increase quantity of ' + esc(x.name) + '">+</button></div></div>' +
'<button type="button" class="kk-qremove" data-q-remove aria-label="Remove ' + esc(x.name) + '">' +
'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>';
}).join("");
var empty = document.querySelector("[data-quote-empty]");
var foot = document.querySelector("[data-quote-foot]");
if (empty) empty.hidden = items.length > 0;
if (foot) foot.hidden = items.length === 0;
}
var toastTimer;
function toast(text) {
var t = document.querySelector("[data-toast]");
if (!t) return;
t.querySelector("[data-toast-text]").textContent = text;
t.hidden = false;
t.classList.remove("is-out");
void t.offsetWidth;
t.classList.add("is-in");
clearTimeout(toastTimer);
toastTimer = setTimeout(function () {
t.classList.remove("is-in");
t.classList.add("is-out");
setTimeout(function () { t.hidden = true; }, 400);
}, 3200);
}
document.addEventListener("click", function (e) {
var add = e.target.closest("[data-quote-add]");
if (add) {
e.preventDefault();
quote.add({
slug: add.dataset.slug,
name: add.dataset.name,
image: add.dataset.image,
options: add.dataset.options || "",
qty: parseInt(add.dataset.qty, 10) || 1,
});
add.classList.remove("is-added");
void add.offsetWidth;
add.classList.add("is-added");
var badge = document.querySelector(".kk-quote-btn");
if (badge) { badge.classList.remove("is-bump"); void badge.offsetWidth; badge.classList.add("is-bump"); }
toast(add.dataset.name + " added to your quote list");
return;
}
var row = e.target.closest(".kk-qitem");
if (row) {
var key = row.getAttribute("data-key");
var step = e.target.closest("[data-q]");
if (step) {
var cur = items.filter(function (x) { return keyOf(x) === key; })[0];
if (cur) quote.setQty(key, cur.qty + Number(step.getAttribute("data-q")));
}
if (e.target.closest("[data-q-remove]")) {
row.classList.add("is-leaving");
setTimeout(function () { quote.remove(key); }, 260);
}
return;
}
if (e.target.closest("[data-quote-clear]")) quote.clear();
});
window.addEventListener("storage", function (e) {
if (e.key === KEY) { items = load(); render(); }
});
document.addEventListener("DOMContentLoaded", render);
})();
(function () {
"use strict";
document.addEventListener("DOMContentLoaded", function () {
var dlg = document.getElementById("kkSearch");
var dataEl = document.getElementById("kk-search-index");
if (!dlg || !dataEl || !dlg.showModal) return;
var root = document.documentElement.getAttribute("data-root") || "";
if (root === "./") root = "";
var index = [];
try { index = JSON.parse(dataEl.textContent); } catch (e) { index = []; }
var input = dlg.querySelector("input");
var wrap = dlg.querySelector("[data-so-results-wrap]");
var list = dlg.querySelector("[data-so-results]");
var deflt = dlg.querySelector("[data-so-default]");
var empty = dlg.querySelector("[data-so-empty]");
var all = dlg.querySelector("[data-so-all]");
var title = dlg.querySelector("[data-so-title]");
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var mark = function (text, q) {
var i = text.toLowerCase().indexOf(q);
return i < 0 ? esc(text) : esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
};
function open() {
dlg.showModal();
document.documentElement.classList.add("kk-so-open");
setTimeout(function () { input.focus(); input.select(); }, 30);
render();
}
function close() {
dlg.classList.add("is-closing");
setTimeout(function () { dlg.classList.remove("is-closing"); dlg.close(); }, 220);
}
dlg.addEventListener("close", function () { document.documentElement.classList.remove("kk-so-open"); });
function render() {
var q = input.value.trim().toLowerCase();
deflt.hidden = !!q;
if (!q) { wrap.hidden = true; empty.hidden = true; return; }
var terms = q.split(/\s+/);
var hits = index
.map(function (p) {
var hay = (p.n + " " + p.c + " " + p.t + " " + p.k).toLowerCase();
if (!terms.every(function (t) { return hay.indexOf(t) > -1; })) return null;
var score = p.n.toLowerCase().indexOf(q) === 0 ? 0 : p.n.toLowerCase().indexOf(q) > -1 ? 1 : 2;
return { p: p, score: score };
})
.filter(Boolean)
.sort(function (a, b) { return a.score - b.score; })
.slice(0, 6);
wrap.hidden = !hits.length;
empty.hidden = !!hits.length;
empty.querySelector("[data-so-q]").textContent = input.value.trim();
title.textContent = hits.length + (hits.length === 1 ? " product" : " products");
all.href = root + "products.html?q=" + encodeURIComponent(input.value.trim());
list.innerHTML = hits.map(function (h, i) {
var p = h.p;
return '<li style="animation-delay:' + i * 40 + 'ms"><a href="' + root + "products/" + p.s + '.html">' +
(p.i ? '<img src="' + root + esc(KK.thumb("assets/img/products/" + p.i)) + '" alt="" width="56" height="56">' : "") +
"<span><b>" + mark(p.n, q) + "</b><small>" + esc(p.c) + (p.t ? " · " + esc(p.t) : "") + "</small></span>" +
'<i aria-hidden="true">→</i></a></li>';
}).join("");
}
input.addEventListener("input", render);
document.addEventListener("click", function (e) {
if (e.target.closest("[data-so-open]")) { e.preventDefault(); open(); return; }
if (e.target.closest("[data-so-close]") || e.target === dlg) close();
});
document.addEventListener("keydown", function (e) {
var tag = (document.activeElement && document.activeElement.tagName) || "";
var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
if (e.key === "/" && !typing && !dlg.open && !document.getElementById("product-search")) { e.preventDefault(); open(); }
if (e.key === "Escape" && dlg.open) { e.preventDefault(); close(); }
if (dlg.open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
var links = Array.prototype.slice.call(list.querySelectorAll("a"));
if (!links.length) return;
e.preventDefault();
var i = links.indexOf(document.activeElement);
i = e.key === "ArrowDown" ? (i + 1) % links.length : i <= 0 ? -1 : i - 1;
if (i < 0) input.focus(); else links[i].focus();
}
});
});
})();
(function () {
"use strict";
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var all = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
function initInView() {
var els = all("[data-inview], .kk-stack-card, .kk-photo-band, .kk-mwt-media");
if (!els.length) return;
if (!("IntersectionObserver" in window) || reduce) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
}, { rootMargin: "0px 0px -12% 0px" });
els.forEach(function (e) { io.observe(e); });
}
function initKinetic() {
all(".kk-kinetic-track").forEach(function (t) {
if (t.dataset.dup) return;
t.innerHTML += t.innerHTML; // seamless loop for the CSS translate(-50%) animation
t.dataset.dup = "1";
});
}
function initRipple() {
if (reduce) return;
document.addEventListener("pointerdown", function (e) {
var b = e.target.closest && e.target.closest(".kk-btn, .kk-pcard-add");
if (!b) return;
var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
var dot = document.createElement("span");
dot.className = "kk-ripple";
dot.style.cssText = "width:" + s + "px;height:" + s + "px;left:" + (e.clientX - r.left - s / 2) + "px;top:" + (e.clientY - r.top - s / 2) + "px";
b.appendChild(dot);
setTimeout(function () { dot.remove(); }, 650);
}, { passive: true });
}
function initHoverImages() {
if (!window.matchMedia("(hover: hover)").matches) return;
document.addEventListener("pointerover", function (e) {
var card = e.target.closest && e.target.closest(".kk-pcard");
var img = card && card.querySelector(".kk-pcard-alt[data-src]");
if (!img) return;
img.src = img.getAttribute("data-src");
img.removeAttribute("data-src");
}, { passive: true });
}
document.addEventListener("DOMContentLoaded", function () {
initInView();
initHoverImages();
initKinetic();
initRipple();
});
})();