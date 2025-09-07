#!/usr/bin/env node
 
const fs = require('fs');
const path = require('path');

// ===== args, bump & utils ====================================================

function parseArgs(argv) {
	const out = { source: 'src/main.ts', build: 'build', type: 'default', watch: false };
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i], next = argv[i + 1];
		const val = (k) => { out[k] = next; i++; };
		if (a === '--source') val('source');          // default src/main.ts
		else if (a === '--build') val('build');       // default build
		else if (a === '--dest') val('dest');         // REQUIRED
		else if (a === '--type') val('type');         // major|minor|default|set|sync-pkg
		else if (a === '--version') val('version');   // required for --type set
		else if (a === '--watch') out.watch = true;   // watch src/main.ts; exit on src/stopwatch.txt
		else if (a === '--help' || a === '-h') out.type = 'help';
		else console.warn('Unknown arg:', a);
	}
	return out;
}

function bump(v, kind) {
	const m = String(v || '0.0.0').match(/^(\d+)\.(\d+)\.(\d+)$/);
	if (!m) throw new Error(`Invalid semver: ${v}`);
	let [maj, min, pat] = m.slice(1).map(Number);
	if (kind === 'major') { maj++; min = 0; pat = 0; }
	else if (kind === 'minor') { min++; pat = 0; }
	else { /* default = patch */ pat++; }
	return `${maj}.${min}.${pat}`;
}

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJSON(p, obj) {
	fs.mkdirSync(path.dirname(p), { recursive: true });
	fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

// ===== self-edit guard to stop watch flicker =================================

const SELF_EDIT_WINDOW_MS = 800; // ignore our own writes for ~0.8s
const selfEditGuard = new Map(); // abs path -> last write ts

function markSelfEdit(filePath) {
	selfEditGuard.set(path.resolve(filePath), Date.now());
}
function wasSelfEditedRecently(filePath) {
	const t = selfEditGuard.get(path.resolve(filePath)) || 0;
	return Date.now() - t < SELF_EDIT_WINDOW_MS;
}

// ===== version stamping in source & README ===================================

function updateFirstVersionComment(filePath, version, { insertIfMissing = true } = {}) {
	if (!fs.existsSync(filePath)) throw new Error(`Source not found: ${filePath}`);
	const src = fs.readFileSync(filePath, 'utf8');
	const lines = src.split(/\r?\n/);
	let changed = false;

	for (let i = 0; i < Math.min(lines.length, 50); i++) {
		const line = lines[i];
		const m1 = line.match(/^\s*\/\/(.*?)(v?\d+\.\d+\.\d+)(.*)$/);
		const m2 = line.match(/^\s*\/\*(.*?)(v?\d+\.\d+\.\d+)(.*)$/);
		if (m1 || m2) { lines[i] = line.replace(/v?\d+\.\d+\.\d+/, `v${version}`); changed = true; break; }
	}
	if (!changed && insertIfMissing) { lines.unshift(`// v${version}`); changed = true; }

	if (changed) {
		// mark this as our own edit so the watcher ignores it
		markSelfEdit(filePath);
		fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
	}
	return changed;
}

// Transform README text with updated version tokens (non-destructive)
function transformReadmeText(text, version) {
	// explicit placeholders
	let txt = text.replace(/@VERSION@/g, version).replace(/@VVERSION@/g, `v${version}`);

	// first 100 lines: headings / badges / zip names
	const outLines = txt.split(/\r?\n/).map((line, idx) => {
		if (idx <= 100) {
			if (/^#{1,6}\s/.test(line) && /\bv?\d+\.\d+\.\d+\b/.test(line)) {
				line = line.replace(/\bv?\d+\.\d+\.\d+\b/, `v${version}`);
			}
			line = line.replace(/(version-)(\d+\.\d+\.\d+)(-)/g, `$1${version}$3`);
			line = line.replace(/(_v)(\d+\.\d+\.\d+)(\.zip)/g, `$1${version}$3`);
		}
		return line;
	});
	return outLines.join('\n');
}

// Update src README in place (if present), then write the updated text to build/README.md
function updateAndCopyReadme(root, buildDir, version) {
	const srcReadmePreferred = path.join(root, 'src', 'README.md');
	const srcReadmeFallback = path.join(root, 'README.md');
	const srcPath = fs.existsSync(srcReadmePreferred) ? srcReadmePreferred
		: fs.existsSync(srcReadmeFallback) ? srcReadmeFallback
			: null;
	if (!srcPath) return false;

	const original = fs.readFileSync(srcPath, 'utf8');
	const updated = transformReadmeText(original, version);

	// If we're editing src/README.md, we might want to mark self-edit—but watcher is only on main.ts.
	if (updated !== original) {
		fs.writeFileSync(srcPath, updated, 'utf8');
	}

	const buildReadme = path.join(buildDir, 'README.md');
	fs.mkdirSync(path.dirname(buildReadme), { recursive: true });
	fs.writeFileSync(buildReadme, updated, 'utf8');
	return true;
}

// ===== filesystem copy & markers =============================================

function copyDirRecursive(srcDir, destDir) {
	if (!fs.existsSync(srcDir)) return;
	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		const s = path.join(srcDir, entry.name);
		const d = path.join(destDir, entry.name);
		if (entry.isDirectory()) copyDirRecursive(s, d);
		else { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(s, d); }
	}
}

function cleanOldMarkers(destDir, keepVersion) {
	if (!fs.existsSync(destDir)) return;
	const re = /^v\d+\.\d+\.\d+\.txt$/i;
	for (const name of fs.readdirSync(destDir)) {
		if (re.test(name) && name.toLowerCase() !== `v${keepVersion}.txt`) {
			try { fs.unlinkSync(path.join(destDir, name)); } catch { }
		}
	}
	const marker = path.join(destDir, `v${keepVersion}.txt`);
	fs.writeFileSync(marker, new Date().toISOString() + '\n', 'utf8');
	return marker;
}

// ===== esbuild & prettier =====================================================

async function buildWithEsbuild(entry, outdir, version) {
	const esbuild = require('esbuild');
	fs.rmSync(outdir, { recursive: true, force: true });
	fs.mkdirSync(outdir, { recursive: true });
	await esbuild.build({
		entryPoints: [entry],
		bundle: true,
		platform: 'node',
		format: 'cjs',
		target: 'es2020',
		outdir,
		sourcemap: 'inline',
		external: ['obsidian', 'electron'],
		banner: { js: `// v${version}` } // first line in build/main.js
	});
	const out = path.join(outdir, 'main.js');
	if (!fs.existsSync(out)) throw new Error(`Build did not emit: ${out}`);
	return out;
}

async function formatWithPrettier(filePath) {
	try {
		// Prettier v3 is ESM-only; dynamic import works in CJS scripts too
		const mod = await import('prettier');
		const prettier = mod.default ?? mod;

		const src = fs.readFileSync(filePath, 'utf8');

		// Load config if present (async in v3)
		let options = { parser: 'babel', filepath: filePath };
		try {
			const resolved = await (prettier.resolveConfig?.(filePath) ?? Promise.resolve(null));
			if (resolved) options = { ...resolved, ...options };
		} catch { /* ignore config errors */ }

		// prefer tabs unless user config explicitly set otherwise
		if (!Object.prototype.hasOwnProperty.call(options, 'useTabs')) options.useTabs = true;
		if (!Object.prototype.hasOwnProperty.call(options, 'tabWidth')) options.tabWidth = 2;

		const formatted = await prettier.format(src, options);
		const retabbed = retabLeading(formatted, options.tabWidth || 2);

		if (retabbed !== src) {
			fs.writeFileSync(filePath, retabbed, 'utf8');
			console.log(`Prettier formatted: ${filePath} (Prettier ${prettier.version || ''})`);
		} else {
			console.log(`Prettier made no changes: ${filePath}`);
		}
	} catch (e) {
		console.warn('Prettier not found or failed; skipping format:', e?.message ?? e);
	}
}

// Replace leading groups of <tabWidth> spaces with tabs; preserve inner-line alignment spaces
function retabLeading(text, tabWidth) {
	return text
		.split(/\r?\n/)
		.map((line) => {
			let i = 0;
			while (i < line.length && line[i] === ' ') i++;
			if (i === 0 || line[0] === '\t') return line;
			const spaces = i;
			const tabs = Math.floor(spaces / tabWidth);
			const remainder = spaces % tabWidth;
			return (tabs > 0 ? '\t'.repeat(tabs) + ' '.repeat(remainder) + line.slice(spaces) : line);
		})
		.join('\n');
}

// ===== package.json sync ======================================================

function ensurePackageVersion(pkgPath, version, manifest) {
	let pkg;
	if (fs.existsSync(pkgPath)) {
		pkg = readJSON(pkgPath);
	} else {
		pkg = { name: (manifest && (manifest.id || manifest.name)) || 'plugin', version: '0.0.0' };
	}
	pkg.version = version;
	writeJSON(pkgPath, pkg);
}

// ===== main work units ========================================================

async function doOnce({ root, sourceTs, buildDir, destDir, manifest, version }) {
	// 1) first version comment in source (ignore watch loop)
	updateFirstVersionComment(sourceTs, version, { insertIfMissing: true });

	// 2) manifest.json.version ONLY (do not touch manifest.main)
	manifest.version = version;
	writeJSON(path.join(root, 'manifest.json'), manifest);

	// 3) package.json.version ALWAYS
	ensurePackageVersion(path.join(root, 'package.json'), version, manifest);

	// 4) build (inline sourcemaps + version banner)
	console.log(`[${new Date().toLocaleTimeString()}] Building → ${buildDir}`);
	const builtMain = await buildWithEsbuild(sourceTs, buildDir, version);

	// 5) Prettier format build/main.js
	await formatWithPrettier(builtMain);

	// 6) update src/README.md in-place (or root README.md if src missing), then copy to build/README.md
	updateAndCopyReadme(root, buildDir, version);

	// 7) copy manifest + ALL build/* to dest (dest/build/…)
	fs.mkdirSync(destDir, { recursive: true });
	writeJSON(path.join(destDir, 'manifest.json'), manifest);
	const destBuildDir = path.join(destDir, path.basename(buildDir));
	copyDirRecursive(buildDir, destBuildDir);

	// 8) also copy build/main.js to dest/<manifest.main>
	if (manifest.main) {
		const destMainPath = path.join(destDir, manifest.main);
		fs.mkdirSync(path.dirname(destMainPath), { recursive: true });
		fs.copyFileSync(path.join(buildDir, 'main.js'), destMainPath);
	}

	// 9) version marker
	const marker = cleanOldMarkers(destDir, version);

	console.log(`Done.
- Manifest → ${path.join(destDir, 'manifest.json')}
- Build    → ${destBuildDir}
- main.js  → ${path.join(destDir, manifest.main || 'main.js')}
- Marker   → ${marker}\n`);
}

async function main() {
	const args = parseArgs(process.argv);
	if (args.type === 'help' || !args.dest) {
		console.log(
			`Usage:
  node scripts/build-and-deploy.js --dest "<pluginDir>"
    [--source src/main.ts] [--build build]
    [--type major|minor|default|set|sync-pkg] [--version x.y.z] [--watch]

Notes:
  - default = patch bump
  - --watch: re-runs when src/main.ts changes; exits if src/stopwatch.txt exists.
    Self-edits to main.ts (version banner) are ignored to prevent loops.
  - README: src/README.md (or root README.md) is updated in-place and copied to build/README.md.`
		);
		process.exit(args.dest ? 0 : 1);
	}

	const root = process.cwd();
	const sourceTs = path.resolve(root, args.source || 'src/main.ts');
	const buildDir = path.resolve(root, args.build || 'build');
	const destDir = path.resolve(args.dest);
	const manifestPath = path.join(root, 'manifest.json');
	const pkgPath = path.join(root, 'package.json');

	if (!fs.existsSync(manifestPath)) throw new Error(`manifest.json not found: ${manifestPath}`);
	if (!fs.existsSync(sourceTs)) throw new Error(`source not found: ${sourceTs}`);

	// Decide version ONCE (watch reuses it)
	const manifest = readJSON(manifestPath);
	let version;
	if (args.type === 'set') {
		if (!args.version) throw new Error(`--type set requires --version x.y.z`);
		version = args.version;
	} else if (args.type === 'sync-pkg') {
		let pkg = fs.existsSync(pkgPath) ? readJSON(pkgPath) : { name: manifest.id || 'plugin', version: '0.0.0' };
		pkg.version = bump(pkg.version || '0.0.0', 'default'); // patch
		writeJSON(pkgPath, pkg);
		version = pkg.version;
	} else if (['major', 'minor', 'default'].includes(args.type)) {
		const base = manifest.version || (fs.existsSync(pkgPath) ? readJSON(pkgPath).version : '0.0.0');
		version = bump(base, args.type);
	} else {
		throw new Error(`Unknown --type: ${args.type}`);
	}
	console.log(`Version → ${version}`);

	await doOnce({ root, sourceTs, buildDir, destDir, manifest, version });

	if (!args.watch) return;

	// --- WATCH MODE ---
	const stopPath = path.join(root, 'src', 'stopwatch.txt');
	let building = false;
	let pending = false;
	let lastChange = 0;

	const trigger = async (why) => {
		const now = Date.now();
		if (now - lastChange < 150) return; // debounce burst events
		lastChange = now;

		if (building) { pending = true; return; }
		building = true;
		try {
			if (fs.existsSync(stopPath)) {
				console.log('stopwatch.txt detected — exiting watch.');
				process.exit(0);
			}
			console.log(`Change detected (${why}) — rebuilding…`);
			// Re-read manifest to keep manual edits, then pin version
			const freshManifest = readJSON(manifestPath);
			freshManifest.version = version;

			// Always keep package.json.version synced to chosen version
			ensurePackageVersion(pkgPath, version, freshManifest);

			await doOnce({ root, sourceTs, buildDir, destDir, manifest: freshManifest, version });
		} catch (e) {
			console.error('Build failed:', e);
		} finally {
			building = false;
			if (pending) { pending = false; trigger('queued'); }
		}
	};

	console.log('Watching:', path.relative(root, sourceTs));
	fs.watch(sourceTs, { persistent: true }, (eventType) => {
		// Ignore our own write that inserted/updated the version banner
		if (wasSelfEditedRecently(sourceTs)) return;
		trigger(`main.ts ${eventType}`);
		// NOTE: we don't watch README; only main.ts triggers rebuilds.
	});

	const stopTimer = setInterval(() => {
		if (fs.existsSync(stopPath)) {
			console.log('stopwatch.txt detected — exiting watch.');
			clearInterval(stopTimer);
			process.exit(0);
		}
	}, 500);
}

main().catch(e => { console.error(e); process.exit(1); });
