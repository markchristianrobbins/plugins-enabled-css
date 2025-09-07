#!/usr/bin/env node
 
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
	const args = {};
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		const next = argv[i + 1];
		const flag = (k) => (args[k] = true);
		const val = (k) => (args[k] = next, i++);
		if (a === '--dest') val('dest');
		else if (a === '--main') val('main');
		else if (a === '--set') val('set');
		else if (a === '--patch') flag('patch');
		else if (a === '--minor') flag('minor');
		else if (a === '--major') flag('major');
		else if (a === '--sync-pkg') flag('syncPkg');
		else if (a === '--dry-run') flag('dryRun');
		else if (a === '--help' || a === '-h') flag('help');
		else console.warn('Unknown arg:', a);
	}
	return args;
}

function bump(v, kind = 'patch') {
	const m = String(v || '0.0.0').match(/^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/);
	if (!m) throw new Error(`Not a semver version: ${v}`);
	let [major, minor, patch] = m.slice(1).map(Number);
	if (kind === 'major') (major++, minor = 0, patch = 0);
	else if (kind === 'minor') (minor++, patch = 0);
	else (patch++);
	return `${major}.${minor}.${patch}`;
}

function loadJSON(p) {
	return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function saveJSON(p, obj) {
	fs.mkdirSync(path.dirname(p), { recursive: true });
	fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

(async () => {
	const args = parseArgs(process.argv);
	if (args.help || !args.dest) {
		console.log(
			`Usage:
  node scripts/bump-and-copy.js --dest "<pluginDir>" [--main build/main.js] [--set 0.3.2 | --patch | --minor | --major | --sync-pkg] [--dry-run]

Examples:
  node scripts/bump-and-copy.js --dest "C:\\vault\\.obsidian\\plugins\\plugins-enabled-css" --main build/main.js --patch
  node scripts/bump-and-copy.js --dest "/vault/.obsidian/plugins/plugins-enabled-css" --main build/main.js --set 0.4.0
  node scripts/bump-and-copy.js --dest "/vault/.../plugins/<id>" --sync-pkg --main build/main.js`
		);
		process.exit(args.dest ? 0 : 1);
	}

	const projectRoot = process.cwd();
	const manifestPath = path.join(projectRoot, 'manifest.json');
	if (!fs.existsSync(manifestPath)) {
		console.error('manifest.json not found at', manifestPath);
		process.exit(1);
	}

	const manifest = loadJSON(manifestPath);

	// Decide new version
	let newVersion = manifest.version;
	if (args.set) {
		newVersion = args.set;
	} else if (args.syncPkg) {
		const pkgPath = path.join(projectRoot, 'package.json');
		if (!fs.existsSync(pkgPath)) {
			console.error('package.json not found for --sync-pkg');
			process.exit(1);
		}
		const pkg = loadJSON(pkgPath);
		if (!pkg.version) {
			console.error('package.json has no "version" for --sync-pkg');
			process.exit(1);
		}
		newVersion = pkg.version;
	} else {
		const kind = args.major ? 'major' : args.minor ? 'minor' : 'patch';
		newVersion = bump(manifest.version, kind);
	}

	// Optionally set "main" path (e.g. build/main.js)
	if (args.main) {
		manifest.main = args.main;
	}

	manifest.version = newVersion;

	console.log(`New version: ${newVersion}`);
	if (args.main) console.log(`main: ${manifest.main}`);

	if (args.dryRun) {
		console.log('\n--- manifest (would write) ---\n' + JSON.stringify(manifest, null, 2));
		process.exit(0);
	}

	// 1) Save back to the project manifest.json (keeps repo in sync)
	saveJSON(manifestPath, manifest);

	// 2) Copy to plugin directory
	const destManifest = path.join(args.dest, 'manifest.json');
	saveJSON(destManifest, manifest);
	console.log('Wrote', destManifest);
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
