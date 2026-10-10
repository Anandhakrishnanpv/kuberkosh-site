(function () {
"use strict";
document.addEventListener("DOMContentLoaded", function () {
var gear = document.querySelector("[data-gear]");
if (!gear || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
var box = gear.parentElement, x = 0, y = 0, gx = 0, gy = 0, rot = 0, running = false;
function loop() {
var dx = x - gx, dy = y - gy;
gx += dx * 0.08; gy += dy * 0.08; rot += Math.hypot(dx, dy) * 0.08;
gear.style.transform = "translate(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px) rotate(" + rot.toFixed(1) + "deg)";
if (Math.abs(dx) + Math.abs(dy) > 0.5) requestAnimationFrame(loop); else running = false;
}
box.addEventListener("pointermove", function (e) {
var r = box.getBoundingClientRect();
x = e.clientX - (r.left + r.width / 2); y = e.clientY - (r.top + r.height / 2);
if (!running) { running = true; requestAnimationFrame(loop); }
});
});
})();