(function () {
"use strict";
document.addEventListener("DOMContentLoaded", function () {
var grid = document.getElementById("product-grid");
if (!grid) return;
var KK = window.KK;
var $ = function (id) { return document.getElementById(id); };
var all = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
var items = all(".kk-pitem", grid);
var search = $("product-search"), sort = $("product-sort"), count = $("product-count"), empty = $("product-empty");
var clearBtn = $("product-search-clear"), optToggle = $("f-options"), active = $("active-filters"), descEl = $("product-cat-desc");
var banner = $("cbanner");
var banners = {};
try { banners = JSON.parse(banner.dataset.banners); } catch (e) { banners = {}; }
var bannerKey = "All";
var promo = $("grid-promo");
var qtiles = all(".kk-qtile[data-qcat]");
var descs = {};
try { descs = JSON.parse(descEl.dataset.desc); } catch (e) { /* no descriptions */ }
var FACETS = ["category", "type", "industry"];
var state = { category: [], type: [], industry: [], options: false, q: "", sort: "featured" };
var valuesOf = function (item, facet) {
if (facet === "category") return [item.dataset.category];
if (facet === "type") return [item.dataset.type];
return item.dataset.industries ? item.dataset.industries.split("|") : [];
};
function matches(item, skip) {
for (var i = 0; i < FACETS.length; i++) {
var f = FACETS[i];
if (f === skip || !state[f].length) continue;
var vals = valuesOf(item, f);
if (!state[f].some(function (v) { return vals.indexOf(v) > -1; })) return false;
}
if (skip !== "options" && state.options && item.dataset.options !== "1") return false;
var q = state.q.trim().toLowerCase();
if (q && !q.split(/\s+/).every(function (t) { return item.dataset.search.indexOf(t) > -1; })) return false;
return true;
}
function syncInputs() {
all(".kk-facet input").forEach(function (cb) { cb.checked = state[cb.name].indexOf(cb.value) > -1; });
optToggle.checked = state.options;
search.value = state.q;
sort.value = state.sort;
}
function apply(animate) {
var sorted = items.slice().sort(function (a, b) {
if (state.sort === "az") return a.dataset.name.localeCompare(b.dataset.name);
if (state.sort === "za") return b.dataset.name.localeCompare(a.dataset.name);
if (state.sort === "category") return a.dataset.category.localeCompare(b.dataset.category) || a.dataset.order - b.dataset.order;
if (state.sort === "options") return b.dataset.options - a.dataset.options || a.dataset.order - b.dataset.order;
return a.dataset.order - b.dataset.order;
});
sorted.forEach(function (el) { grid.appendChild(el); });
var visible = 0;
sorted.forEach(function (item) {
var ok = matches(item);
item.hidden = !ok;
if (ok && animate) {
var card = item.firstElementChild;
card.style.animationDelay = Math.min(visible, 8) * 45 + "ms";
card.classList.remove("kk-pop");
void card.offsetWidth;
card.classList.add("kk-pop");
}
if (ok) visible++;
});
all(".kk-facet input").forEach(function (cb) {
var n = items.filter(function (it) { return matches(it, cb.name) && valuesOf(it, cb.name).indexOf(cb.value) > -1; }).length;
var label = cb.closest(".kk-facet");
label.querySelector(".kk-facet-n").textContent = n;
label.classList.toggle("is-zero", n === 0 && !cb.checked);
});
var chips = [];
FACETS.forEach(function (f) { state[f].forEach(function (v) { chips.push({ f: f, v: v, text: v }); }); });
if (state.options) chips.push({ f: "options", v: "1", text: "Configurable options" });
if (state.q) chips.push({ f: "q", v: state.q, text: "“" + state.q + "”" });
active.hidden = !chips.length;
active.innerHTML = chips.map(function (c) {
return '<button type="button" class="kk-chipx" data-f="' + c.f + '" data-v="' + c.v.replace(/"/g, "&quot;") + '">' +
c.text.replace(/</g, "&lt;") + '<span aria-hidden="true">×</span><span class="visually-hidden"> — remove filter</span></button>';
}).join("") + (chips.length > 1 ? '<button type="button" class="kk-chipx-clear" data-filter-reset>Clear all</button>' : "");
var nFilters = chips.filter(function (c) { return c.f !== "q"; }).length;
all("[data-filter-n]").forEach(function (b) { b.textContent = nFilters; b.hidden = !nFilters; });
all(".kk-filters-reset").forEach(function (b) { b.hidden = !chips.length; });
if (promo) {
var vis = sorted.filter(function (it) { return !it.hidden; });
promo.hidden = vis.length < 3;
if (vis.length >= 3) grid.insertBefore(promo, vis[2]);
}
var key = state.category.length === 1 ? state.category[0] : "All";
if (banner && key !== bannerKey && banners[key]) {
bannerKey = key;
var b = banners[key];
var img = banner.querySelector(".kk-cbanner-img");
var title = banner.querySelector("[data-banner-title]");
var bdesc = banner.querySelector("[data-banner-desc]");
var crumb = banner.querySelector("[data-banner-crumb]");
banner.classList.add("is-swapping");
setTimeout(function () {
if (img.srcset) img.srcset = b.img.replace(/\.webp$/, "-800.webp") + " 800w, " + b.img + " 1280w";
img.src = b.img;
title.textContent = b.title;
bdesc.textContent = b.desc;
crumb.textContent = key === "All" ? "Products" : b.title;
banner.classList.remove("is-swapping");
}, KK.reduce ? 0 : 260);
}
qtiles.forEach(function (t) {
var c = t.dataset.qcat;
t.classList.toggle("is-active", c === "All" ? !state.category.length : state.category.length === 1 && state.category[0] === c);
});
count.textContent = visible === 1 ? "1 product" : visible + " products";
all("[data-result-n]").forEach(function (el) { el.textContent = visible; });
empty.hidden = visible > 0;
clearBtn.hidden = !state.q;
var desc = state.category.length === 1 ? descs[state.category[0]] : !state.category.length ? descs.All : "";
if (descEl.textContent !== (desc || "")) {
descEl.textContent = desc || "";
descEl.classList.remove("is-in"); void descEl.offsetWidth; descEl.classList.add("is-in");
}
var params = new URLSearchParams();
FACETS.forEach(function (f) { if (state[f].length) params.set(f, state[f].join("|")); });
if (state.options) params.set("options", "1");
if (state.q) params.set("q", state.q);
var qs = params.toString();
history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
if (KK.refresh) KK.refresh();
}
var viewBtns = all("[data-view]");
function setView(v, animate) {
var cards = items.filter(function (it) { return !it.hidden; }).map(function (it) { return it.firstElementChild; });
var first = cards.map(function (c) { return c.getBoundingClientRect(); });
grid.classList.toggle("is-list", v === "list");
viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === v)); });
try { localStorage.setItem("kk-view", v); } catch (e) { /* ignore */ }
if (!animate || KK.reduce || !Element.prototype.animate) return;
cards.forEach(function (c, i) {
var a = first[i], b = c.getBoundingClientRect();
if (!b.width || !b.height) return;
c.animate([
{ transform: "translate(" + (a.left - b.left) + "px," + (a.top - b.top) + "px) scale(" + a.width / b.width + "," + a.height / b.height + ")", transformOrigin: "0 0" },
{ transform: "none", transformOrigin: "0 0" },
], { duration: 650, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", delay: Math.min(i, 8) * 25 });
});
}
viewBtns.forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.view, true); }); });
try { if (localStorage.getItem("kk-view") === "list") setView("list", false); } catch (e) { /* ignore */ }
qtiles.forEach(function (t) {
t.addEventListener("click", function (e) {
e.preventDefault();
var c = t.dataset.qcat;
state.category = c === "All" ? [] : [c];
syncInputs();
apply(true);
var cat = $("catalogue");
if (cat && cat.getBoundingClientRect().top > 160) window.scrollTo({ top: cat.getBoundingClientRect().top + window.scrollY - 90, behavior: KK.reduce ? "auto" : "smooth" });
});
});
document.addEventListener("change", function (e) {
var cb = e.target;
if (cb.matches(".kk-facet input")) {
var list = state[cb.name];
if (cb.checked) { if (list.indexOf(cb.value) < 0) list.push(cb.value); }
else state[cb.name] = list.filter(function (v) { return v !== cb.value; });
apply(true);
} else if (cb === optToggle) {
state.options = optToggle.checked;
apply(true);
} else if (cb === sort) {
state.sort = sort.value;
apply(true);
}
});
document.addEventListener("click", function (e) {
var chip = e.target.closest(".kk-chipx");
if (chip) {
var f = chip.dataset.f, v = chip.dataset.v;
if (f === "options") state.options = false;
else if (f === "q") state.q = "";
else state[f] = state[f].filter(function (x) { return x !== v; });
syncInputs();
apply(true);
return;
}
if (e.target.closest("[data-filter-reset]")) {
state.category = []; state.type = []; state.industry = []; state.options = false; state.q = "";
syncInputs();
apply(true);
}
});
var t;
search.addEventListener("input", function () {
clearTimeout(t);
t = setTimeout(function () { state.q = search.value; apply(true); }, 140);
});
search.addEventListener("keydown", function (e) { if (e.key === "Escape") { search.value = ""; state.q = ""; apply(true); } });
clearBtn.addEventListener("click", function () { search.value = ""; state.q = ""; apply(true); search.focus(); });
document.addEventListener("keydown", function (e) {
var tag = document.activeElement.tagName;
if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") { e.preventDefault(); search.focus(); }
});
var params = new URLSearchParams(location.search);
FACETS.forEach(function (f) {
var raw = params.get(f);
if (!raw) return;
var known = all('.kk-facet input[name="' + f + '"]').map(function (cb) { return cb.value; });
state[f] = raw.split("|").filter(function (v) { return known.indexOf(v) > -1; });
});
state.options = params.get("options") === "1";
state.q = params.get("q") || "";
syncInputs();
apply(false);
var MAX = 3;
var bar = $("compare-bar"), barItems = $("compare-items"), hint = $("compare-hint"), openBtn = $("compare-open");
var table = $("compare-table"), modalEl = $("compareModal");
var picked = [];
try { picked = JSON.parse(sessionStorage.getItem("kk-compare")) || []; } catch (e) { picked = []; }
var bySlug = {};
items.forEach(function (it) { bySlug[it.dataset.slug] = it; });
picked = picked.filter(function (s) { return bySlug[s]; }).slice(0, MAX);
var esc = function (s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
function renderCompare() {
try { sessionStorage.setItem("kk-compare", JSON.stringify(picked)); } catch (e) { /* ignore */ }
all("[data-compare]").forEach(function (cb) {
cb.checked = picked.indexOf(cb.value) > -1;
cb.disabled = !cb.checked && picked.length >= MAX;
cb.closest(".kk-compare-check").classList.toggle("is-disabled", cb.disabled);
});
bar.hidden = !picked.length;
document.body.classList.toggle("has-compare", picked.length > 0);
barItems.innerHTML = picked.map(function (s) {
var it = bySlug[s];
return '<span class="kk-cmpbar-item"><img src="' + esc(KK.thumb(it.dataset.image)) + '" alt="">' + '<span>' + esc(it.dataset.name) + "</span>" +
'<button type="button" data-uncompare="' + s + '" aria-label="Remove ' + esc(it.dataset.name) + ' from compare">×</button></span>';
}).join("") + new Array(MAX - picked.length + 1).join('<span class="kk-cmpbar-slot" aria-hidden="true">+</span>');
hint.textContent = picked.length < 2 ? "Pick " + (2 - picked.length) + " more to compare" : picked.length + " of " + MAX + " selected";
openBtn.disabled = picked.length < 2;
}
function renderTable() {
var cols = picked.map(function (s) { return bySlug[s].dataset; });
var row = function (label, fn) {
return '<div class="kk-cmp-row"><div class="kk-cmp-label">' + label + "</div>" + cols.map(function (d) { return '<div class="kk-cmp-cell">' + fn(d) + "</div>"; }).join("") + "</div>";
};
table.style.setProperty("--cols", cols.length);
table.innerHTML =
'<div class="kk-cmp-row kk-cmp-head"><div class="kk-cmp-label"></div>' + cols.map(function (d) {
return '<div class="kk-cmp-cell"><img src="' + esc(d.image) + '" alt=""><a href="' + esc(d.url) + '">' + esc(d.name) + "</a></div>";
}).join("") + "</div>" +
row("Category", function (d) { return esc(d.category); }) +
row("Type", function (d) { return esc(d.type); }) +
row("Used in", function (d) { return d.industries ? d.industries.split("|").map(function (x) { return '<span class="kk-cmp-tag">' + esc(x) + "</span>"; }).join("") : "—"; }) +
row("Options", function (d) { return d.specs ? d.specs.split(" | ").map(function (x) { return "<div>" + esc(x) + "</div>"; }).join("") : '<span class="kk-muted">Specified on request</span>'; }) +
row("About", function (d) { var t = d.summary || ""; return esc(t.length > 220 ? t.slice(0, t.lastIndexOf(" ", 220)) + "…" : t); }) +
row("Price", function () { return '<span class="kk-cmp-price">On request</span>'; }) +
row("", function (d) {
return '<button type="button" class="kk-btn kk-btn-primary kk-btn-sm w-100" data-quote-add data-slug="' + esc(d.slug) + '" data-name="' + esc(d.name) +
'" data-image="' + esc(d.image.replace(/^(\.\.\/)+/, "")) + '">Add to quote list</button>';
});
}
document.addEventListener("change", function (e) {
var cb = e.target.closest("[data-compare]");
if (!cb) return;
if (cb.checked && picked.length < MAX) picked.push(cb.value);
else picked = picked.filter(function (s) { return s !== cb.value; });
renderCompare();
});
document.addEventListener("click", function (e) {
if (e.target.closest(".kk-compare-check")) e.stopPropagation();
var un = e.target.closest("[data-uncompare]");
if (un) { picked = picked.filter(function (s) { return s !== un.dataset.uncompare; }); renderCompare(); }
});
$("compare-clear").addEventListener("click", function () { picked = []; renderCompare(); });
openBtn.addEventListener("click", function () {
if (picked.length < 2 || !window.bootstrap) return;
renderTable();
window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
});
renderCompare();
});
})();