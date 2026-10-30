// Shared, DOM-free helpers for viz components.
// Imported both by the browser (md-viewer) and by the notes skill's
// check_md.py under node, so nothing here may touch `document` or `window`.

// Parameters every component accepts; components declare their own in `meta.params`.
export const COMMON_PARAMS = {
	title: { type: "string", desc: "Optional caption shown above the demo." },
	interactive: { type: "bool", default: false, desc: "Show an input bar so readers can try their own data." },
	start: { type: "int", default: 1, min: 1, desc: "1-based step to open on (clamped to the last step)." }
};

function describe(value) {
	return JSON.stringify(value);
}

// Validate `config` against a params schema. Returns a list of error strings.
// Supported types: string, bool, int, enum, int[], number[], json-array.
export function checkParams(params, config) {
	const errors = [];
	if (config === null || typeof config !== "object" || Array.isArray(config)) {
		return ["config must be a JSON object like { \"array\": [5, 3, 8] }"];
	}
	const all = Object.assign({}, COMMON_PARAMS, params);

	for (const key of Object.keys(config)) {
		if (!(key in all)) {
			errors.push("unknown parameter \"" + key + "\" (allowed: " + Object.keys(all).join(", ") + ")");
		}
	}

	for (const [key, spec] of Object.entries(all)) {
		const value = config[key];
		if (value === undefined) {
			if (spec.required) errors.push("missing required parameter \"" + key + "\"");
			continue;
		}
		const where = "\"" + key + "\"";
		switch (spec.type) {
			case "string":
				if (typeof value !== "string") errors.push(where + " must be a string");
				break;
			case "bool":
				if (typeof value !== "boolean") errors.push(where + " must be true or false");
				break;
			case "int":
				if (!Number.isInteger(value)) errors.push(where + " must be an integer");
				else if (spec.min !== undefined && value < spec.min) errors.push(where + " must be ≥ " + spec.min);
				else if (spec.max !== undefined && value > spec.max) errors.push(where + " must be ≤ " + spec.max);
				break;
			case "enum":
				if (!spec.values.includes(value)) errors.push(where + " must be one of " + spec.values.map(describe).join(", "));
				break;
			case "int[]":
				if (!Array.isArray(value) || !value.every(Number.isInteger)) {
					errors.push(where + " must be an array of integers");
				} else if (spec.minLength !== undefined && value.length < spec.minLength) {
					errors.push(where + " needs at least " + spec.minLength + " elements");
				} else if (spec.maxLength !== undefined && value.length > spec.maxLength) {
					errors.push(where + " can have at most " + spec.maxLength + " elements");
				} else if (value.some(function(v) {
					return (spec.minValue !== undefined && v < spec.minValue) || (spec.maxValue !== undefined && v > spec.maxValue);
				})) {
					errors.push(where + " values must be between " + spec.minValue + " and " + spec.maxValue);
				}
				break;
			case "number[]":
				if (!Array.isArray(value) || !value.every(function(v) { return typeof v === "number" && isFinite(v); })) {
					errors.push(where + " must be an array of numbers");
				} else if (spec.minLength !== undefined && value.length < spec.minLength) {
					errors.push(where + " needs at least " + spec.minLength + " elements");
				} else if (spec.maxLength !== undefined && value.length > spec.maxLength) {
					errors.push(where + " can have at most " + spec.maxLength + " elements");
				} else if (value.some(function(v) {
					return (spec.minValue !== undefined && v < spec.minValue) || (spec.maxValue !== undefined && v > spec.maxValue);
				})) {
					errors.push(where + " values must be between " + spec.minValue + " and " + spec.maxValue);
				}
				break;
			case "json-array":
				// Structured data (e.g. memory-trace steps); the component checks the contents itself.
				if (!Array.isArray(value)) errors.push(where + " must be an array");
				else if (spec.minLength !== undefined && value.length < spec.minLength) errors.push(where + " needs at least " + spec.minLength + " elements");
				else if (spec.maxLength !== undefined && value.length > spec.maxLength) errors.push(where + " can have at most " + spec.maxLength + " elements");
				break;
			default:
				errors.push("internal: unsupported param type " + spec.type);
		}
	}
	return errors;
}

// Fill in defaults for missing params (after validation passed).
export function withDefaults(params, config) {
	const all = Object.assign({}, COMMON_PARAMS, params);
	const out = Object.assign({}, config);
	for (const [key, spec] of Object.entries(all)) {
		if (out[key] === undefined && spec.default !== undefined) out[key] = spec.default;
	}
	return out;
}

// Parse "38, 3, 5 47" into integers; returns { values } or { error }.
export function parseIntList(text) {
	const parts = String(text).split(/[\s,，]+/).filter(Boolean);
	const values = [];
	for (const p of parts) {
		if (!/^-?\d+$/.test(p)) return { error: "\"" + p + "\" is not an integer" };
		values.push(Number(p));
	}
	return { values };
}

// n distinct random integers in [lo, hi].
export function randomInts(n, lo, hi) {
	const pool = [];
	for (let v = lo; v <= hi; v++) pool.push(v);
	for (let i = pool.length - 1; i > 0; i--) {
		const k = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[k]] = [pool[k], pool[i]];
	}
	return pool.slice(0, n);
}
