// Doubling test (Lecture 2): add measurements one at a time, plot them on a
// log-log scale, and read the growth exponent b from T(2n)/T(n) ≈ 2^b, then
// the constant a from T(n) = a·n^b.
import { checkParams } from "./_core.js";

export const meta = {
	name: "doubling-test",
	summary: "Doubling hypothesis: ratio T(2n)/T(n) → b = lg ratio, a = T(n)/n^b, with a growing log-log plot.",
	groupLabel: "measurement",
	params: {
		n: { type: "int[]", required: true, minLength: 3, maxLength: 10, minValue: 1, maxValue: 1000000000, desc: "Input sizes, each double the previous one, e.g. [1000, 2000, 4000, 8000, 16000]." },
		times: { type: "number[]", required: true, minLength: 3, maxLength: 10, minValue: 0, maxValue: 1000000, desc: "Measured running times (seconds), same length as n." },
		unit: { type: "string", default: "s", desc: "Unit label for times." }
	},
	example: { n: [1000, 2000, 4000, 8000, 16000], times: [0.081, 0.38, 2.792, 21.623, 177.344] }
};

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	if (config.n.length !== config.times.length) errors.push("\"n\" and \"times\" must have the same length");
	for (let k = 1; k < config.n.length; k++) {
		if (config.n[k] <= config.n[k - 1]) { errors.push("\"n\" must be increasing"); break; }
	}
	if (config.times.filter(function(t) { return t > 0; }).length < 2) errors.push("\"times\" needs at least two positive measurements");
	return errors;
}

function fmt(x) {
	if (x === 0) return "0";
	if (Math.abs(x) >= 1000 || Math.abs(x) < 0.01) return x.toExponential(2).replace("e", "×10^").replace("+", "");
	return String(Math.round(x * 1000) / 1000);
}

export function steps(config) {
	const N = config.n;
	const T = config.times;
	const frames = [];
	let lastB = null;

	function push(f) {
		frames.push({
			n: N, t: T, shown: f.shown, b: f.b, a: f.a, msg: f.msg, group: f.group, fit: !!f.fit,
			vars: [
				["n", f.k === undefined ? "—" : String(N[f.k])],
				["T(n)", f.k === undefined ? "—" : fmt(T[f.k]) + " " + config.unit],
				["ratio T(n)/T(n/2)", f.ratio === undefined ? "—" : fmt(f.ratio)],
				["b ≈ lg ratio", f.b === undefined || f.b === null ? "—" : fmt(f.b)],
				["a = T(n) / n^b", f.a === undefined ? "—" : fmt(f.a)]
			]
		});
	}

	push({ shown: 0, group: -1, msg: "Run the program on inputs that double each time and record the running time. If T(n) ≈ a·n^b, then T(2n)/T(n) ≈ 2^b." });
	for (let k = 0; k < N.length; k++) {
		let ratio;
		let b = null;
		if (k > 0 && T[k - 1] > 0 && T[k] > 0) {
			ratio = T[k] / T[k - 1];
			b = Math.log2(ratio);
			lastB = b;
		}
		push({ shown: k + 1, k: k, ratio: ratio, b: b, group: k,
			msg: "n = " + N[k] + ": T = " + fmt(T[k]) + " " + config.unit + "." + (ratio !== undefined ? " Ratio to the previous run " + fmt(ratio) + ", so b ≈ lg " + fmt(ratio) + " = " + fmt(b) + "." :
				k === 0 ? " (No previous run to compare with yet.)" : " (Too small to time reliably — skip this ratio.)") });
	}
	const k = N.length - 1;
	const bRound = Math.round(lastB);
	const a = T[k] / Math.pow(N[k], bRound);
	push({ shown: N.length, k: k, ratio: Math.pow(2, lastB), b: lastB, a: a, fit: true, group: N.length,
		msg: "The ratios settle near " + fmt(Math.pow(2, lastB)) + ", so b ≈ " + bRound + " (use the largest inputs: small ones are dominated by noise and lower-order terms). Then a = T(" + N[k] + ") / " + N[k] + "^" + bRound + " = " + fmt(a) + ", so T(n) ≈ " + fmt(a) + " · n^" + bRound + "." });
	return frames;
}

export function render(stage, frame) {
	const W = 420, H = 250, P = 48;
	const pts = [];
	for (let k = 0; k < frame.n.length; k++) if (frame.t[k] > 0) pts.push([Math.log10(frame.n[k]), Math.log10(frame.t[k]), k]);
	const xs = pts.map(function(p) { return p[0]; });
	const ys = pts.map(function(p) { return p[1]; });
	const x0 = Math.floor(Math.min.apply(null, xs)), x1 = Math.ceil(Math.max.apply(null, xs));
	const y0 = Math.floor(Math.min.apply(null, ys)), y1 = Math.ceil(Math.max.apply(null, ys));
	const sx = function(v) { return P + (v - x0) / Math.max(1e-9, x1 - x0) * (W - P - 12); };
	const sy = function(v) { return H - P + 8 - (v - y0) / Math.max(1e-9, y1 - y0) * (H - P - 24); };
	let svg = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" style="max-width:' + W + 'px;display:block;margin:0 auto" role="img" aria-label="log-log plot of running time">';
	svg += '<g stroke="currentColor" stroke-opacity="0.15">';
	for (let x = x0; x <= x1; x++) svg += '<line x1="' + sx(x) + '" y1="' + sy(y0) + '" x2="' + sx(x) + '" y2="' + sy(y1) + '"/>';
	for (let y = y0; y <= y1; y++) svg += '<line x1="' + sx(x0) + '" y1="' + sy(y) + '" x2="' + sx(x1) + '" y2="' + sy(y) + '"/>';
	svg += "</g><g fill=\"currentColor\" fill-opacity=\"0.6\" font-size=\"10\" font-family=\"Consolas, Menlo, monospace\">";
	for (let x = x0; x <= x1; x++) svg += '<text x="' + sx(x) + '" y="' + (sy(y0) + 14) + '" text-anchor="middle">10^' + x + "</text>";
	for (let y = y0; y <= y1; y++) svg += '<text x="' + (sx(x0) - 6) + '" y="' + (sy(y) + 3) + '" text-anchor="end">10^' + y + "</text>";
	svg += '<text x="' + (W / 2 + 10) + '" y="' + (H - 4) + '" text-anchor="middle">n (log scale)</text><text x="4" y="12">T(n), log scale</text></g>';
	if (frame.fit && pts.length >= 2) {
		const b = Math.round(frame.b);
		const last = pts[pts.length - 1];
		const c = last[1] - b * last[0];
		const ya = b * x0 + c, yb = b * x1 + c;
		svg += '<clipPath id="vzdt-clip"><rect x="' + sx(x0) + '" y="' + sy(y1) + '" width="' + (sx(x1) - sx(x0)) + '" height="' + (sy(y0) - sy(y1)) + '"/></clipPath>';
		svg += '<line clip-path="url(#vzdt-clip)" x1="' + sx(x0) + '" y1="' + sy(ya) + '" x2="' + sx(x1) + '" y2="' + sy(yb) + '" stroke="#e8a33d" stroke-width="2" stroke-dasharray="5 4"/>';
		svg += '<text x="' + (sx(x1) - 4) + '" y="' + (sy(y0) - 8) + '" text-anchor="end" font-size="11" fill="#e8a33d">dashed: slope b = ' + b + "</text>";
	}
	const shown = pts.filter(function(p) { return p[2] < frame.shown; });
	if (shown.length > 1) svg += '<polyline fill="none" stroke="#2563eb" stroke-width="1.5" points="' + shown.map(function(p) { return sx(p[0]) + "," + sy(p[1]); }).join(" ") + '"/>';
	shown.forEach(function(p, i) {
		svg += '<circle cx="' + sx(p[0]) + '" cy="' + sy(p[1]) + '" r="' + (i === shown.length - 1 ? 5 : 3.5) + '" fill="#2563eb"/>';
	});
	svg += "</svg>";
	let table = '<table style="margin:0.8rem auto 0;border-collapse:collapse;font:0.82rem Consolas,Menlo,monospace"><tr>' +
		["n", "T(n)", "ratio", "lg ratio"].map(function(h) { return '<th style="padding:0.2rem 0.7rem;text-align:right;opacity:0.7">' + h + "</th>"; }).join("") + "</tr>";
	for (let k = 0; k < frame.shown; k++) {
		const r = k > 0 && frame.t[k - 1] > 0 && frame.t[k] > 0 ? frame.t[k] / frame.t[k - 1] : null;
		table += "<tr>" + [String(frame.n[k]), fmt(frame.t[k]), r === null ? "—" : fmt(r), r === null ? "—" : fmt(Math.log2(r))]
			.map(function(c) { return '<td style="padding:0.2rem 0.7rem;text-align:right">' + c + "</td>"; }).join("") + "</tr>";
	}
	stage.innerHTML = svg + table + "</table>";
}
