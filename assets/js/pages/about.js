(function () {
"use strict";
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
function initCircle() {
var el = document.querySelector("[data-circle]");
if (!el || reduce || !window.KK || !KK.scrub) return;
el.classList.add("is-circle");
KK.scrub(el, function (r) {
var vh = window.innerHeight;
var t = clamp((vh - r.top) / (vh * 0.9), 0, 1);
var e = 1 - Math.pow(1 - t, 3);
el.style.clipPath = "circle(" + (14 + e * 62).toFixed(2) + "% at 50% 50%)";
});
}
function initIndex() {
var list = document.querySelector("[data-idx]");
if (!list || reduce || !fine) return;
list.classList.add("has-float");
var float = document.createElement("div");
float.className = "kk-idx-float";
float.innerHTML = "<img alt=\"\"><img alt=\"\">";
document.body.appendChild(float);
var imgs = float.querySelectorAll("img"), front = 0;
var x = 0, y = 0, fx = 0, fy = 0, lastX = 0, running = false, on = false;
function loop() {
fx += (x - fx) * 0.14; fy += (y - fy) * 0.14;
var rot = clamp((x - lastX) * 0.6, -14, 14);
lastX += (x - lastX) * 0.2;
float.style.transform = "translate3d(" + fx + "px," + fy + "px,0) rotate(" + rot.toFixed(2) + "deg)";
if (on || Math.abs(x - fx) > 0.5) requestAnimationFrame(loop); else running = false;
}
function wake() { if (!running) { running = true; requestAnimationFrame(loop); } }
list.addEventListener("pointermove", function (e) { x = e.clientX; y = e.clientY; wake(); });
list.querySelectorAll(".kk-idx-item").forEach(function (item) {
item.addEventListener("pointerenter", function (e) {
var src = item.getAttribute("data-img");
if (!on) { fx = x = e.clientX; fy = y = e.clientY; lastX = x; }
on = true;
if (imgs[front].getAttribute("src") !== src) {
front = 1 - front;
imgs[front].src = src;
imgs[front].classList.add("is-front");
imgs[1 - front].classList.remove("is-front");
}
float.classList.add("is-on");
wake();
});
});
list.addEventListener("pointerleave", function () { on = false; float.classList.remove("is-on"); });
}
document.addEventListener("DOMContentLoaded", function () {
initCircle();
initIndex();
});
})();