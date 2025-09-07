// v0.0.14 - plugins-enabled-css/src/main.ts - Mark Christian Robbins - MIT License

import { Notice, Plugin, PluginManifest } from "obsidian";

/**
 * Obsidian plugin that injects dynamic CSS classes and styles to visually indicate
 * the enabled or disabled state of community plugins, and enhances internal plugin links
 * in both reading and editing views. ok
 */
export default class PluginsEnabledCss extends Plugin {
    private readonly STYLE_ID = "plugins-enabled-css-style";
    private CSS_READY = false;

    // cache for .obsidian/community-plugins.json
    private _cpCache?: { mtime: number; ids: Set<string> };
    // cache of manifests by id/name
    private _manifests?: ManifestsCache;
    // cache for name -> pid resolution
    private _pidByNameCache?: Map<string, string | null>;

    async onload(): Promise<void> {
		console.log("[Plugins Enabled CSS] loading...-" + new Date().toISOString());
        this.addCommand({
            id: "plugins-enabled-css-run",
            name: "Update classes & wikilink data-text",
            callback: async () => {
                try {
                    await this.refresh();
                    new Notice("Plugins Enabled CSS: updated.");
                } catch (err) {
                    console.error("[Plugins Enabled CSS] error:", err);
                    new Notice("Plugins Enabled CSS: error (see console).");
                }
            },
        });

        await this.refresh();

        // update on layout changes
        this.registerEvent(
            this.app.workspace.on("layout-change", async () => {
                await this.refresh();
            })
        );
    }

    onunload(): void {
        const el = document.getElementById(this.STYLE_ID);
        if (el) el.remove();
        this._clearPluginStateCss();
    }

    // ---------- Community plugins (vault file) ----------

    /** Reads .obsidian/community-plugins.json and returns enabled IDs. */
    private async _readEnabledCommunityPlugins(): Promise<Set<string>> {
        try {
            const adapter = this.app?.vault?.adapter as import("obsidian").FileSystemAdapter | undefined;
            if (!adapter?.stat || !("read" in adapter) || typeof adapter.read !== "function") return new Set();

            const rel = ".obsidian/community-plugins.json";
            const stat = await adapter.stat(rel);
            if (!stat) return new Set();

            // mtime-based cache
            this._cpCache = this._cpCache || { mtime: 0, ids: new Set<string>() };
            const mtime = (stat as { mtime?: number; modified?: number }).mtime || (stat as { modified?: number }).modified || 0;
            if (mtime && mtime === this._cpCache.mtime) return this._cpCache.ids;

            const raw: string = await adapter.read(rel);
            let list: string[] = [];
            try {
                const parsed = JSON.parse((raw ?? "[]").trim());
                if (Array.isArray(parsed)) list = parsed as string[];
                else if (
                    parsed &&
                    typeof parsed === "object" &&
                    Array.isArray((parsed as { plugins?: unknown }).plugins)
                ) {
                    list = (parsed as { plugins: unknown[] }).plugins as string[];
                }
            } catch (e) {
                console.warn("[PEC] Failed to parse community-plugins.json:", e);
                return new Set();
            }

            const ids = new Set<string>(list.map(String));
            this._cpCache = { mtime, ids };
            return ids;
        } catch (e) {
            console.warn("[PEC] _readEnabledCommunityPlugins error:", e);
            return new Set();
        }
    }

    /** Convenience: check if a given id is enabled in the community plugins file. */
    private async _isEnabledInCommunityPluginsFile(id: string): Promise<boolean> {
        if (!id) return false;
        const enabled = await this._readEnabledCommunityPlugins();
        return enabled.has(String(id));
    }

    // ---------- Manifests lookup ----------

    /** Build (and cache) Maps keyed by id and normalized name. */
    private _getManifests(force?: boolean): ManifestsCache {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pm = (this.app as any).plugins;
        const src: Record<string, PluginManifest> = (pm?.manifests as Record<string, PluginManifest>) || {};

        // normalization for names
        const norm = (s: string): string =>
            String(s || "")
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s*-\s*plugin\s*$/i, "")
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();

        const size = Object.keys(src).length;
        if (!force && this._manifests && this._manifests._src === src && this._manifests._size === size) {
            return this._manifests;
        }

        const byId = new Map<string, PluginManifest>();
        const byName = new Map<string, PluginManifest>();

        for (const id of Object.keys(src)) {
            const mf = src[id] ?? ({ id, name: id } as unknown as PluginManifest);
            byId.set(id, mf);

            const key = norm(mf.name || id);
            if (key && !byName.has(key)) {
                byName.set(key, mf);
            }
        }

        this._manifests = { byId, byName, _src: src, _size: size };
        return this._manifests;
    }

    // ---------- Name → pid ----------

    /** Resolve a plugin id from a (possibly "-plugin" suffixed) display name. */
    private _getPidFromName(rawName: string, opts: { strict?: boolean } = {}): string | null {
        const { strict = false } = opts;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pm = (this.app as any).plugins;
        const manifests: Record<string, PluginManifest> = (pm?.manifests as Record<string, PluginManifest>) || {};
        if (!rawName) return null;

        this._pidByNameCache ||= new Map<string, string | null>();

        const norm = (s: string) =>
            String(s || "")
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ")
                .trim();
        const stripSuffix = (s: string) => s.replace(/\s*-\s*plugin\s*$/i, "");
        const toKebab = (s: string) =>
            norm(s)
                .toLowerCase()
                .replace(/[^\w]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .replace(/_+/g, "-");

        const key = toKebab(stripSuffix(rawName));
        if (this._pidByNameCache.has(key)) return this._pidByNameCache.get(key)!;

        // 1) exact name match
        for (const [id, mf] of Object.entries(manifests)) {
            const mfName = stripSuffix(norm(mf?.name || ""));
            if (mfName && toKebab(mfName) === key) {
                this._pidByNameCache.set(key, id);
                return id;
            }
        }

        // 2) exact kebab match against IDs
        for (const [id] of Object.entries(manifests)) {
            if (toKebab(id) === key) {
                this._pidByNameCache.set(key, id);
                return id;
            }
        }

        // 3) loose contains
        for (const [id, mf] of Object.entries(manifests)) {
            const mfKebab = toKebab(stripSuffix(mf?.name || id));
            if (mfKebab.includes(key)) {
                this._pidByNameCache.set(key, id);
                return id;
            }
        }

        if (strict) {
            this._pidByNameCache.set(key, null);
            return null;
        }

        const derived = toKebab(key);
        this._pidByNameCache.set(key, derived);
        return derived;
    }

    // ---------- DOM helpers ----------

    /** Remove previous state classes from <body>. */
    private _clearPluginStateCss(): void {
        const classes = Array.from(document.body.classList);
        classes.forEach((cls) => {
            if (cls.startsWith("the-") && (cls.endsWith("-is-enabled") || cls.endsWith("-is-disabled"))) {
                document.body.classList.remove(cls);
            }
        });
    }

    /** Add pid-related classes to an element (clears old pid-/pec- first). */
    private _setPidClass(el: HTMLElement, pid: string | null): void {
        if (!el) return;
        const toRemove: string[] = [];
        el.classList.forEach((c) => {
            if (c && (c.startsWith("pid-") || c.startsWith("pec-"))) toRemove.push(c);
        });
        toRemove.forEach((c) => el.classList.remove(c));
        if (pid) {
            el.classList.add(`pid-${pid}`);
            el.classList.add(`pec-plugin`); // explicit marker (matches existing CSS)
        }
    }

    /** Tag reading/editor links with plugin classes based on the label. */
    private _applyDataToLinks(nodeList: NodeListOf<HTMLAnchorElement>, isEditorChild: boolean): void {
        nodeList.forEach((a) => {
            if (!isEditorChild) {
                // Reading view
                const txt = (a.textContent || "").trim();
                const pluginId = this._getPidFromName(txt, { strict: false });
                if (!pluginId) return;
                if (/-plugin\s*$/i.test(txt)) {
                    a.classList.add("pec-plugin", `pid-${pluginId}`);
                } else {
                    a.classList.remove("pec-plugin");
                    a.classList.remove(`pid-${pluginId}`);
                }
                return;
            }

            // Editor (LP): anchors grouped under .cm-hmd-internal-link
            const parent = a.closest<HTMLElement>(".cm-hmd-internal-link");
            if (!parent) return;

            const firstA = parent.querySelector<HTMLAnchorElement>("a");
            if (a !== firstA) return;

            const allAnchors = Array.from(parent.querySelectorAll<HTMLAnchorElement>("a"));
            let fullText = allAnchors.map((x) => x.textContent || "").join("");
            fullText = fullText.trim();
            const pluginId = this._getPidFromName(fullText, { strict: false });
            if (!pluginId) return;
            if (/-plugin\s*$/i.test(fullText)) {
                firstA.classList.add("pec-plugin", `pid-${pluginId}`);
            } else {
                firstA.classList.remove("pec-plugin");
                firstA.classList.remove(`pid-${pluginId}`);
            }

            // ensure later anchors don't carry these classes
            for (let i = 1; i < allAnchors.length; i++) {
                allAnchors[i].classList.remove("pec-plugin");
                allAnchors[i].classList.remove(`pid-${pluginId}`);
            }
        });
    }

    // ---------- State & CSS ----------

    /** Update <body> classes to reflect enabled/disabled state. */
    private async _updatePluginStateCss(): Promise<void> {
        // Define a type for the plugins API to avoid 'any'
        interface PluginsApi {
            manifests: Record<string, PluginManifest>;
            enabledPlugins: Set<string>;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginsApi: PluginsApi = ((this.app as any).plugins as PluginsApi);
        const allPlugins = Array.from(Object.values(pluginsApi.manifests));
        const pluginIds = new Set<string>();
        for (const plugin of allPlugins) pluginIds.add((plugin as PluginManifest).id);

        for (const id of pluginIds) {
            const enabled = pluginsApi.enabledPlugins.has(id);
            const onClass = `the-${id}-is-enabled`;
            const offClass = `the-${id}-is-disabled`;
            document.body.classList.toggle(onClass, enabled);
            document.body.classList.toggle(offClass, !enabled);
        }
    }

    /** Update link elements and inject CSS. */
    private _updateWikilinksElements(): void {
        // Reading view
        const readingLinks = document.querySelectorAll<HTMLAnchorElement>("a.internal-link");
        this._applyDataToLinks(readingLinks, false);

        // Editor (Live Preview / source)
        const editorAnchors = document.querySelectorAll<HTMLAnchorElement>(".cm-hmd-internal-link > a");
        this._applyDataToLinks(editorAnchors, true);
    }

    /** Build/refresh the stylesheet content. */
    private _applyPluginCss(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginsApi = (this.app as any).plugins;
        if (!pluginsApi) return;

        const manifests: Record<string, PluginManifest> = pluginsApi.manifests || {};
        const allIds = Object.keys(manifests);

        let css = `
			/* Base rule injected by Plugins Enabled CSS */
			a.internal-link.pec-plugin,
			.cm-hmd-internal-link > a.pec-plugin {
				position: relative;
			}
			a.internal-link.pec-plugin::before,
			.cm-hmd-internal-link > a.pec-plugin::before {
				content: '🔌';
				font-size: 0.85em;
			}
		`;

        // Per-plugin enabled/disabled opacity
        for (const id of allIds) {
            css += `
				body.the-${id}-is-enabled .cm-hmd-internal-link.pec-plugin.pid-${id}::before,
				body.the-${id}-is-enabled a.internal-link.pec-plugin.pid-${id}::before { opacity: 0.9; }

				body.the-${id}-is-disabled .cm-hmd-internal-link.pec-plugin.pid-${id}::before,
				body.the-${id}-is-disabled a.internal-link.pec-plugin.pid-${id}::before { opacity: 0.3; }
			`;
        }

        let style = document.getElementById(this.STYLE_ID) as HTMLStyleElement | null;
        if (!style) {
            style = document.createElement("style");
            style.id = this.STYLE_ID;
            document.head.appendChild(style);
        }
        style.textContent = css;
        this.CSS_READY = true;
    }

    // ---------- Public ----------

    /** Full refresh: state, links, and CSS. */
    async refresh(): Promise<void> {
        await this._updatePluginStateCss();
        this._updateWikilinksElements();
        this._applyPluginCss();
    }
}

/** Cache shape for manifests lookup. */
type ManifestsCache = {
    byId: Map<string, PluginManifest>;
    byName: Map<string, PluginManifest>;
    _src: Record<string, PluginManifest>;
    _size: number;
};
