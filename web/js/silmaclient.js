(() => {
    "use strict";

    const app = document.querySelector("#app");
    const terminal = document.querySelector("#terminal");
    const status = document.querySelector("#status");
    const statusLabel = status.querySelector("span");
    const latencyChip = document.querySelector("#latency-chip");
    const reconnect = document.querySelector("#reconnect");
    const form = document.querySelector("#command-form");
    const command = document.querySelector("#command");
    const send = document.querySelector("#send");
    const recordingToggle = document.querySelector("#recording-toggle");
    const recordingStatus = document.querySelector("#recording-status");
    const sessionArchive = document.querySelector("#session-archive");
    const sessionArchiveMessage = document.querySelector("#session-archive-message");
    const sessionCount = document.querySelector("#session-count");
    const sessionList = document.querySelector("#session-list");
    const settingsBtn = document.querySelector("#settings-btn");
    const settingsPop = document.querySelector("#settings-pop");
    const shortcutsBtn = document.querySelector("#shortcuts-btn");
    const shortcutsPop = document.querySelector("#shortcuts-pop");
    const shortcutsClose = document.querySelector("#shortcuts-close");
    const changelogBtn = document.querySelector("#changelog-btn");
    const changelogPop = document.querySelector("#changelog-pop");
    const changelogList = document.querySelector("#changelog-list");
    const changelogClose = document.querySelector("#changelog-close");
    const reportBugBtn = document.querySelector("#report-bug-btn");
    const reportIdeaBtn = document.querySelector("#report-idea-btn");
    const feedbackPop = document.querySelector("#feedback-pop");
    const feedbackTitle = document.querySelector("#feedback-title");
    const feedbackHint = document.querySelector("#feedback-hint");
    const feedbackNick = document.querySelector("#feedback-nick");
    const feedbackText = document.querySelector("#feedback-text");
    const feedbackCancel = document.querySelector("#feedback-cancel");
    const feedbackSend = document.querySelector("#feedback-send");
    const toastEl = document.querySelector("#toast");
    const adminNotice = document.querySelector("#admin-notice");
    const adminNoticeText = document.querySelector("#admin-notice-text");
    const adminNoticeClose = document.querySelector("#admin-notice-close");
    let feedbackKind = "bug";
    const CHANGELOG_SEEN_KEY = "silmaclient.changelog-seen";
    let changelogLoaded = false;
    const clearTerminalBtn = document.querySelector("#clear-terminal");
    const mobileTabs = document.querySelector("#mobile-tabs");
    const setFont = document.querySelector("#set-font");
    const setHidePrompt = document.querySelector("#set-hide-prompt");
    const roomChip = document.querySelector("#room-chip");
    const sceneCaption = document.querySelector("#scene-caption");
    const hereExits = document.querySelector("#here-exits");
    const safeBox = document.querySelector("#safe-box");
    const safeRoomEl = document.querySelector("#safe-room");
    const safeMetaEl = document.querySelector("#safe-meta");
    const safeStatusEl = document.querySelector("#safe-status");
    const safeSetBtn = document.querySelector("#safe-set");
    const safeReturnBtn = document.querySelector("#safe-return");
    const safeResumeBtn = document.querySelector("#safe-resume");
    const safeStopBtn = document.querySelector("#safe-stop");
    const minimapSvg = document.querySelector("#minimap-svg");
    const minimapSvgLarge = document.querySelector("#minimap-svg-large");
    const minimapMeta = document.querySelector("#minimap-meta");
    const minimapEmpty = document.querySelector("#minimap-empty");
    const minimapCenterBtn = document.querySelector("#minimap-center");
    const minimapClearBtn = document.querySelector("#minimap-clear");
    const minimapExpandBtn = document.querySelector("#minimap-expand");
    const minimapHelpBtn = document.querySelector("#minimap-help");
    const mapHelpPop = document.querySelector("#map-help-pop");
    const mapHelpClose = document.querySelector("#map-help-close");
    const mapExpand = document.querySelector("#map-expand");
    const mapExpandClose = document.querySelector("#map-expand-close");
    const mapExpandSub = document.querySelector("#map-expand-sub");
    const mapExpandTitle = document.querySelector("#map-expand-title");
    const mapExpandStage = document.querySelector("#map-expand-stage");
    const mapTooltip = document.querySelector("#map-tooltip");
    const mapSearchInput = document.querySelector("#map-search");
    const mapZoomInBtn = document.querySelector("#map-zoom-in");
    const mapZoomOutBtn = document.querySelector("#map-zoom-out");
    const mapFitBtn = document.querySelector("#map-fit");
    const mapGotoMeBtn = document.querySelector("#map-goto-me");
    const mapRemoveRoomBtn = document.querySelector("#map-remove-room-btn");
    const mapSaveName = document.querySelector("#map-save-name");
    const mapSaveBtn = document.querySelector("#map-save-btn");
    const mapLoadSelect = document.querySelector("#map-load-select");
    const mapLoadBtn = document.querySelector("#map-load-btn");
    const mapDeleteBtn = document.querySelector("#map-delete-btn");
    const mapDownloadBtn = document.querySelector("#map-download-btn");
    const mapImportBtn = document.querySelector("#map-import-btn");
    const mapImportFile = document.querySelector("#map-import-file");
    const mapSyncBtn = document.querySelector("#map-sync-btn");
    const SAVED_MAPS_KEY = "silmaclient.saved-maps";
    const vitalsEl = document.querySelector("#vitals");
    const vitalHpLabel = document.querySelector("#vital-hp-label");
    const vitalMnLabel = document.querySelector("#vital-mn-label");
    const vitalMvLabel = document.querySelector("#vital-mv-label");
    const vitalHpBar = document.querySelector("#vital-hp-bar");
    const vitalMnBar = document.querySelector("#vital-mn-bar");
    const vitalMvBar = document.querySelector("#vital-mv-bar");
    const macrosRoot = document.querySelector("#macros-root");
    const macrosEditor = document.querySelector("#macros-editor");
    const macrosEditToggle = document.querySelector("#macros-edit-toggle");
    const macrosAddCategory = document.querySelector("#macros-add-category");
    const macrosCategoryName = document.querySelector("#macros-category-name");
    const macrosAddButton = document.querySelector("#macros-add-button");
    const macrosButtonCategory = document.querySelector("#macros-button-category");
    const macrosButtonLabel = document.querySelector("#macros-button-label");
    const macrosButtonCommand = document.querySelector("#macros-button-command");
    const macrosButtonHotkey = document.querySelector("#macros-button-hotkey");
    const macrosButtonFavorite = document.querySelector("#macros-button-favorite");
    const macrosFilter = document.querySelector("#macros-filter");
    const macrosFavorites = document.querySelector("#macros-favorites");
    const macrosFavoritesList = document.querySelector("#macros-favorites-list");
    const macrosExportBtn = document.querySelector("#macros-export");
    const macrosImportBtn = document.querySelector("#macros-import");
    const macrosImportFile = document.querySelector("#macros-import-file");
    const decoder = new TextDecoder();
    const ansi = createAnsiRenderer(terminal);
    const recorder = createSessionRecorder();
    const RECORDING_PREFERENCE_KEY = "silmaclient.recording-enabled";
    const SETTINGS_KEY = "silmaclient.ui-settings";
    const MACROS_KEY = "silmaclient.custom-macros";
    const COMMAND_HISTORY_KEY = "silmaclient.command-history";
    const HOTKEY_OPTIONS = buildHotkeyOptions();
    const NUMPAD_DIRS = {
        Numpad8: "n",
        Numpad2: "s",
        Numpad4: "w",
        Numpad6: "e",
        Numpad9: "ne",
        Numpad7: "nw",
        Numpad3: "se",
        Numpad1: "sw",
        Numpad5: "guarda",
    };
    const EXIT_ALIASES = {
        n: "n",
        nord: "n",
        north: "n",
        s: "s",
        sud: "s",
        south: "s",
        e: "e",
        est: "e",
        east: "e",
        o: "w",
        ovest: "w",
        w: "w",
        west: "w",
        u: "u",
        su: "u",
        up: "u",
        alto: "u",
        d: "d",
        giu: "d",
        "giù": "d",
        down: "d",
        basso: "d",
        ne: "ne",
        se: "se",
        so: "sw",
        sw: "sw",
        no: "nw",
        nw: "nw",
    };
    const DIR_OPPOSITE = {
        n: "s",
        s: "n",
        e: "w",
        w: "e",
        u: "d",
        d: "u",
        ne: "sw",
        nw: "se",
        se: "nw",
        sw: "ne",
    };
    // Silmaril IT: "d" abbrevia dormi. Alto/basso usano i comandi del MUD.
    const DIR_TO_MUD = {
        n: "n",
        s: "s",
        e: "e",
        w: "w",
        u: "alto",
        d: "basso",
        ne: "ne",
        nw: "nw",
        se: "se",
        sw: "sw",
    };
    // Grid step for auto-map (z = alto/basso, projected onto 2D).
    const DIR_DELTA = {
        n: { x: 0, y: -1, z: 0 },
        s: { x: 0, y: 1, z: 0 },
        e: { x: 1, y: 0, z: 0 },
        w: { x: -1, y: 0, z: 0 },
        ne: { x: 1, y: -1, z: 0 },
        nw: { x: -1, y: -1, z: 0 },
        se: { x: 1, y: 1, z: 0 },
        sw: { x: -1, y: 1, z: 0 },
        u: { x: 0, y: 0, z: 1 },
        d: { x: 0, y: 0, z: -1 },
    };
    const MAP_VIEW_W = 240;
    const MAP_VIEW_H = 168;
    const MAP_LARGE_W = 960;
    const MAP_LARGE_H = 560;
    const MAP_CELL = 36;
    const MAP_MINI_CELL = 26;
    const EXHAUSTED_RE = /Sei veramente esausto/i;
    // Failed move: drop one queued map direction so the FIFO stays aligned.
    const MOVE_FAIL_RE =
        /non puoi andare|non riesci ad andare|non c['’]?è (un['’]? )?uscita|that way is closed|alas, you cannot go|la porta[^\n]{0,40}chiusa|è chiusa\.|too exhausted to|troppo esausto per|non riesci a passare/i;
    const VITALS_RE = /Pf:\s*(\d+)\s+Mn:\s*(\d+)\s+Mv:\s*(\d+)/gi;
    // Prompt custom Silmaril: <Pf:507 Mn:741 / *> oppure con testo combattimento.
    const VITALS_ANGLE_RE = /<?Pf:\s*(\d+)\s+Mn:\s*(\d+)(?:\s+Mv:\s*(\d+))?/gi;
    let promptHoldBuffer = "";
    const SAFE_STEP_DELAY_MS = 450;
    const SAFE_STEP_TIMEOUT_MS = 3500;
    // Room changes are always announced with [Uscite: ...] on the next lines.
    // The name may be on the prompt line (after >) or on the line before [Uscite:].
    const EXITS_LINE_RE = /\[Uscite:\s*([^\]]+)\]/gi;
    const PROMPT_LINE_RE = /^Pf:\s*\d+\s+Mn:\s*\d+\s+Mv:\s*\d+\s*>(.*)$/i;
    const REJECT_ROOM_PREFIX =
        /^(hai |ricevi |tu |sei |puoi |qui |ora |attendi |muori |il tuo |la tua |il morso )/i;
    let commandHistorySize = 20;
    let commandHistory = [];
    // -1 = riga corrente (non in cronologia); 0..n-1 = voce in cronologia
    let historyIndex = -1;
    let historyDraft = "";
    let recentMudText = "";
    let locationCarry = "";
    let vitalsScanBuffer = "";
    let currentRoom = "";
    const MAP_PENDING_DIR_MAX = 2;
    const latencyState = {
        pendingAt: null,
        samples: [],
        lastMs: null,
    };
    const LATENCY_SAMPLE_MAX = 20;
    let socket;
    let toastTimer;
    let settings = loadSettings();
    let macros = loadMacros();
    let macrosEditMode = false;
    let macrosFilterText = "";
    const safeState = {
        room: null,
        path: [],
        mode: "idle",
        pendingDir: null,
        pendingReturn: false,
        stepTimer: null,
        waitTimer: null,
        pauseReason: "",
    };
    const mapState = {
        nodes: new Map(),
        edges: [],
        currentId: null,
        safeId: null,
        // FIFO of outbound dirs so fast travel keeps map alignment.
        pendingDirs: [],
        // Sticky dir while MUD "corri"/"run" auto-walks many rooms.
        runDir: null,
        focusId: null,
        activeName: "",
        activeId: null,
        // After load/import: block new nodes until explicit Sync (name + selected node).
        awaitingSync: false,
        syncCandidateId: null,
    };
    const mapCamera = {
        zoom: 1,
        panX: 0,
        panY: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
        hoverId: null,
        search: "",
        interactionsBound: false,
    };
    // Increments when MUD output contains a new [Uscite:] block. Needed because
    // consecutive rooms often share the same name (e.g. "Via Principale").
    let locationEpoch = 0;
    let lastHandledLocationEpoch = 0;
    const vitalsState = {
        hp: null,
        mn: null,
        mv: null,
        hpMax: 1,
        mnMax: 1,
        mvMax: 1,
    };
    let vitalsParseFrame = 0;
    fillHotkeySelect(macrosButtonHotkey);

    function newId() {
        return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function buildHotkeyOptions() {
        const options = [{ value: "", label: "Nessun tasto" }];
        for (let index = 1; index <= 12; index += 1) {
            options.push({ value: `F${index}`, label: `F${index}` });
        }
        for (let index = 1; index <= 9; index += 1) {
            options.push({ value: `Alt+${index}`, label: `Alt+${index}` });
        }
        options.push({ value: "Alt+0", label: "Alt+0" });
        return options;
    }

    function fillHotkeySelect(select, selected = "") {
        select.replaceChildren(
            ...HOTKEY_OPTIONS.map((option) => {
                const node = document.createElement("option");
                node.value = option.value;
                node.textContent = option.label;
                if (option.value === selected) {
                    node.selected = true;
                }
                return node;
            }),
        );
    }

    function eventMatchesHotkey(event, hotkey) {
        if (!hotkey) {
            return false;
        }
        const parts = hotkey.split("+");
        const keyName = parts.at(-1);
        const wantAlt = parts.includes("Alt");
        const wantCtrl = parts.includes("Ctrl");
        const wantShift = parts.includes("Shift");
        if (Boolean(event.altKey) !== wantAlt) {
            return false;
        }
        if (Boolean(event.ctrlKey || event.metaKey) !== wantCtrl) {
            return false;
        }
        if (Boolean(event.shiftKey) !== wantShift) {
            return false;
        }
        if (/^F\d{1,2}$/i.test(keyName)) {
            return event.key.toUpperCase() === keyName.toUpperCase();
        }
        if (/^\d$/.test(keyName)) {
            return event.code === `Digit${keyName}` || event.key === keyName;
        }
        return event.key.toLowerCase() === keyName.toLowerCase();
    }

    function categoryTone(name) {
        const normalized = name.toLowerCase();
        if (normalized.includes("combatt") || normalized.includes("combat")) {
            return "combat";
        }
        if (
            normalized.includes("incant")
            || normalized.includes("spell")
            || normalized.includes("magia")
        ) {
            return "spell";
        }
        if (normalized.includes("util")) {
            return "util";
        }
        if (normalized.includes("emote") || normalized.includes("social")) {
            return "social";
        }
        if (normalized.includes("general")) {
            return "general";
        }
        return "default";
    }

    const SUGGESTED_CATEGORIES = ["Combattimento", "Incantesimi", "Utilità", "Sociale"];

    function emptyCategory(name) {
        return { id: newId(), name, buttons: [] };
    }

    function normalizeHotkey(hotkey) {
        const value = typeof hotkey === "string" ? hotkey.trim() : "";
        if (!value) {
            return "";
        }
        if (HOTKEY_OPTIONS.some((option) => option.value === value)) {
            return value;
        }
        // Accept common variants so older/saved binds are not wiped on load.
        const upper = value.toUpperCase();
        const fMatch = upper.match(/^F([1-9]|1[0-2])$/);
        if (fMatch) {
            return `F${fMatch[1]}`;
        }
        const altMatch = value.match(/^Alt\+([0-9])$/i);
        if (altMatch) {
            return `Alt+${altMatch[1]}`;
        }
        return "";
    }

    function normalizeButton(button) {
        const command = String(button.command).trim();
        return {
            id: button.id || newId(),
            label: String(button.label || command).trim() || command,
            command,
            hotkey: normalizeHotkey(button.hotkey),
            favorite: Boolean(button.favorite),
        };
    }

    function defaultMacros() {
        return {
            categories: [
                {
                    id: newId(),
                    name: "Generale",
                    buttons: [
                        normalizeButton({ label: "guarda", command: "guarda", hotkey: "F1" }),
                        normalizeButton({ label: "inventario", command: "inventario", hotkey: "F2" }),
                        normalizeButton({ label: "equip", command: "equip" }),
                        normalizeButton({ label: "score", command: "score", hotkey: "F3" }),
                        normalizeButton({ label: "esci", command: "esci" }),
                        normalizeButton({ label: "aiuto", command: "aiuto" }),
                        normalizeButton({ label: "chi", command: "chi" }),
                        normalizeButton({ label: "considera", command: "considera" }),
                    ].map((button, index) => (
                        index < 3 ? { ...button, favorite: true } : button
                    )),
                },
                {
                    id: newId(),
                    name: "Emote",
                    buttons: [
                        normalizeButton({ label: "saluta", command: "saluta" }),
                        normalizeButton({ label: "annuisci", command: "annuisci" }),
                        normalizeButton({ label: "sorridi", command: "sorridi" }),
                        normalizeButton({ label: "ridi", command: "ridi" }),
                        normalizeButton({ label: "inchina", command: "inchina" }),
                    ],
                },
                emptyCategory("Combattimento"),
                emptyCategory("Incantesimi"),
                emptyCategory("Utilità"),
                emptyCategory("Sociale"),
            ],
        };
    }

    function ensureSuggestedCategories(data) {
        const names = new Set(
            data.categories.map((category) => category.name.trim().toLowerCase()),
        );
        for (const name of SUGGESTED_CATEGORIES) {
            if (!names.has(name.toLowerCase())) {
                data.categories.push(emptyCategory(name));
            }
        }
        return data;
    }

    function loadMacros() {
        try {
            const raw = localStorage.getItem(MACROS_KEY);
            if (!raw) {
                return defaultMacros();
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed?.categories)) {
                return defaultMacros();
            }
            const loaded = {
                categories: parsed.categories
                    .filter((category) => category && typeof category.name === "string")
                    .map((category) => ({
                        id: category.id || newId(),
                        name: category.name.trim() || "Senza nome",
                        buttons: Array.isArray(category.buttons)
                            ? category.buttons
                                .filter((button) => button && typeof button.command === "string")
                                .map(normalizeButton)
                            : [],
                    })),
            };
            return ensureSuggestedCategories(loaded);
        } catch {
            return defaultMacros();
        }
    }

    function addCategory(name) {
        const trimmed = name.trim();
        if (!trimmed) {
            return false;
        }
        const exists = macros.categories.some(
            (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (exists) {
            showToast(`“${trimmed}” esiste già`);
            return false;
        }
        macros.categories.push(emptyCategory(trimmed));
        saveMacros();
        renderMacros();
        showToast(`Categoria “${trimmed}” creata`);
        return true;
    }

    function macrosLocalPayload() {
        return {
            version: 1,
            categories: macros.categories,
        };
    }

    function saveMacros() {
        const payload = macrosLocalPayload();
        const encoded = JSON.stringify(payload);
        try {
            localStorage.setItem(MACROS_KEY, encoded);
            const roundtrip = localStorage.getItem(MACROS_KEY);
            if (roundtrip !== encoded) {
                showToast("Salvataggio locale non riuscito");
            }
        } catch {
            showToast("Impossibile salvare i pulsanti in questo browser");
        }
        void syncMacrosToServer(payload);
    }

    async function syncMacrosToServer(payload = macrosLocalPayload()) {
        try {
            const response = await fetch("/silmaclient/macros", {
                method: "PUT",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                showToast("Salvataggio sul server non riuscito");
            }
        } catch {
            // Offline / first paint: localStorage still keeps the latest edits.
        }
    }

    function macrosHaveButtons(data) {
        return data.categories.some(
            (category) => Array.isArray(category.buttons) && category.buttons.length > 0,
        );
    }

    function macrosFromPayload(parsed) {
        return ensureSuggestedCategories({
            categories: parsed.categories
                .filter((category) => category && typeof category.name === "string")
                .map((category) => ({
                    id: category.id || newId(),
                    name: category.name.trim() || "Senza nome",
                    buttons: Array.isArray(category.buttons)
                        ? category.buttons
                            .filter((button) => button && typeof button.command === "string")
                            .map(normalizeButton)
                        : [],
                })),
        });
    }

    async function hydrateMacrosFromServer() {
        try {
            const response = await fetch("/silmaclient/macros", {
                credentials: "same-origin",
                cache: "no-store",
            });
            if (!response.ok) {
                macros = ensureSuggestedCategories(macros);
                return;
            }
            const parsed = await response.json();
            if (!Array.isArray(parsed?.categories)) {
                macros = ensureSuggestedCategories(macros);
                return;
            }

            const remote = {
                categories: parsed.categories,
            };
            if (macrosHaveButtons(remote)) {
                macros = macrosFromPayload(remote);
            } else {
                macros = ensureSuggestedCategories(macros);
                await syncMacrosToServer(macrosLocalPayload());
            }

            try {
                localStorage.setItem(MACROS_KEY, JSON.stringify(macrosLocalPayload()));
            } catch {
                // Keep in-memory macros even if localStorage is blocked.
            }
            renderMacros();
        } catch {
            macros = ensureSuggestedCategories(macros);
            // Keep locally loaded macros when the sync endpoint is unavailable.
        }
    }

    function macrosExportPayload() {
        return {
            version: 1,
            app: "silmaclient",
            exportedAt: new Date().toISOString(),
            categories: macros.categories.map((category) => ({
                id: category.id,
                name: category.name,
                buttons: category.buttons.map((button) => ({
                    id: button.id,
                    label: button.label,
                    command: button.command,
                    hotkey: button.hotkey || "",
                    favorite: Boolean(button.favorite),
                })),
            })),
        };
    }

    function parseMacrosPayload(parsed) {
        const categoriesSource = Array.isArray(parsed?.categories)
            ? parsed.categories
            : Array.isArray(parsed)
                ? parsed
                : null;
        if (!categoriesSource) {
            throw new Error("Formato JSON non valido");
        }

        const categories = categoriesSource
            .filter((category) => category && typeof category.name === "string")
            .map((category) => ({
                id: category.id || newId(),
                name: category.name.trim() || "Senza nome",
                buttons: Array.isArray(category.buttons)
                    ? category.buttons
                        .filter((button) => button && typeof button.command === "string")
                        .map(normalizeButton)
                    : [],
            }));

        if (categories.length === 0) {
            throw new Error("Nessuna categoria nel file");
        }
        return { categories };
    }

    function exportMacrosJson() {
        const payload = macrosExportPayload();
        const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
            type: "application/json;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const stamp = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `silmaril-pulsanti-${stamp}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        showToast("File JSON scaricato");
    }

    function importMacrosJsonText(text) {
        const parsed = JSON.parse(text);
        macros = parseMacrosPayload(parsed);
        saveMacros();
        renderMacros();
        showToast("Pulsanti e keybind importati");
    }

    function allMacroButtons() {
        return macros.categories.flatMap((category) =>
            category.buttons.map((button) => ({ category, button })),
        );
    }

    function findButton(buttonId) {
        for (const category of macros.categories) {
            const button = category.buttons.find((entry) => entry.id === buttonId);
            if (button) {
                return { category, button };
            }
        }
        return null;
    }

    function buttonMatchesFilter(button) {
        if (!macrosFilterText) {
            return true;
        }
        const needle = macrosFilterText;
        return button.label.toLowerCase().includes(needle)
            || button.command.toLowerCase().includes(needle)
            || button.hotkey.toLowerCase().includes(needle);
    }

    function createMacroButton(button, categoryId) {
        const wrap = document.createElement("div");
        wrap.className = "macros-btn-wrap";

        const row = document.createElement("div");
        row.className = "macros-btn-row";

        const item = document.createElement("button");
        item.type = "button";
        item.className = "macros-btn";
        item.dataset.cmd = button.command;
        item.dataset.buttonId = button.id;
        item.title = button.hotkey
            ? `${button.command} · ${button.hotkey}`
            : button.command;

        const key = document.createElement("span");
        key.className = `macros-btn__key${button.hotkey ? "" : " is-empty"}`;
        key.textContent = button.hotkey || "·";

        const label = document.createElement("span");
        label.className = "macros-btn__label";
        label.textContent = button.label;
        item.append(key, label);

        const star = document.createElement("button");
        star.type = "button";
        star.className = `macros-btn__star${button.favorite ? " is-on" : ""}`;
        star.dataset.toggleFavorite = button.id;
        star.textContent = button.favorite ? "★" : "☆";
        star.title = "Preferito";
        star.setAttribute("aria-label", "Preferito");

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "macros-btn__remove";
        remove.dataset.deleteButton = button.id;
        remove.dataset.categoryId = categoryId;
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Elimina ${button.label}`);

        row.append(item, star, remove);
        wrap.append(row);

        if (macrosEditMode) {
            const hotkeySelect = document.createElement("select");
            hotkeySelect.className = "macros-btn-edit";
            hotkeySelect.dataset.editHotkey = button.id;
            fillHotkeySelect(hotkeySelect, button.hotkey);
            wrap.append(hotkeySelect);
        }

        return wrap;
    }

    function renderFavorites() {
        const favorites = allMacroButtons()
            .map(({ button }) => button)
            .filter((button) => button.favorite && buttonMatchesFilter(button));

        macrosFavorites.hidden = favorites.length === 0;
        macrosFavoritesList.replaceChildren(
            ...favorites.map((button) => {
                const item = document.createElement("button");
                item.type = "button";
                item.className = "macros-btn";
                item.dataset.cmd = button.command;
                item.title = button.hotkey
                    ? `${button.command} · ${button.hotkey}`
                    : button.command;

                const key = document.createElement("span");
                key.className = `macros-btn__key${button.hotkey ? "" : " is-empty"}`;
                key.textContent = button.hotkey || "·";

                const label = document.createElement("span");
                label.className = "macros-btn__label";
                label.textContent = button.label;
                item.append(key, label);
                return item;
            }),
        );
    }

    function renderMacros() {
        macrosRoot.classList.toggle("is-editing", macrosEditMode);
        macrosEditor.hidden = !macrosEditMode;
        macrosEditToggle.textContent = macrosEditMode ? "Fine" : "Modifica";
        macrosEditToggle.setAttribute("aria-pressed", String(macrosEditMode));
        renderFavorites();

        if (macros.categories.length === 0) {
            const empty = document.createElement("p");
            empty.className = "macros-empty";
            empty.textContent = macrosEditMode
                ? "Nessuna categoria. Creane una nel riquadro Gestione sotto."
                : "Nessun pulsante. Tocca Modifica per crearne.";
            macrosRoot.replaceChildren(empty);
            refreshMacroCategorySelect();
            return;
        }

        const fragments = [];
        for (const category of macros.categories) {
            const visibleButtons = category.buttons.filter(buttonMatchesFilter);
            if (!macrosEditMode && visibleButtons.length === 0) {
                continue;
            }

            const block = document.createElement("section");
            block.className = "macros-category";
            block.dataset.categoryId = category.id;
            block.dataset.tone = categoryTone(category.name);

            const head = document.createElement("div");
            head.className = "macros-category__head";

            const nameInput = document.createElement("input");
            nameInput.className = "macros-category__name";
            nameInput.type = "text";
            nameInput.value = category.name;
            nameInput.maxLength = 32;
            nameInput.readOnly = !macrosEditMode;
            nameInput.setAttribute("aria-label", "Nome categoria");
            nameInput.addEventListener("change", () => {
                const next = nameInput.value.trim();
                if (!next) {
                    nameInput.value = category.name;
                    return;
                }
                category.name = next;
                saveMacros();
                renderMacros();
            });

            const removeCategory = document.createElement("button");
            removeCategory.type = "button";
            removeCategory.className = "macros-category__delete";
            removeCategory.dataset.deleteCategory = category.id;
            removeCategory.textContent = "Elimina";

            head.append(nameInput, removeCategory);

            const buttons = document.createElement("div");
            buttons.className = "macros-category__buttons";

            const list = macrosEditMode ? category.buttons : visibleButtons;
            if (list.length === 0) {
                const empty = document.createElement("span");
                empty.className = "macros-empty";
                empty.textContent = macrosFilterText
                    ? "Nessun risultato"
                    : "Nessun pulsante";
                buttons.append(empty);
            } else {
                for (const button of list) {
                    buttons.append(createMacroButton(button, category.id));
                }
            }

            block.append(head, buttons);
            fragments.push(block);
        }

        if (fragments.length === 0) {
            const empty = document.createElement("p");
            empty.className = "macros-empty";
            empty.textContent = macrosFilterText
                ? "Nessun pulsante corrisponde al filtro."
                : "Nessun pulsante ancora.";
            macrosRoot.replaceChildren(empty);
        } else {
            macrosRoot.replaceChildren(...fragments);
        }
        refreshMacroCategorySelect();
    }

    function refreshMacroCategorySelect() {
        macrosButtonCategory.replaceChildren(
            ...macros.categories.map((category) => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                return option;
            }),
        );
        macrosAddButton.querySelector("button[type='submit']").disabled =
            macros.categories.length === 0;
    }

    function setMacrosEditMode(enabled) {
        macrosEditMode = enabled;
        renderMacros();
    }

    function runMacroCommand(cmd) {
        sendMudCommand(cmd);
        focusCommandBar();
    }

    function handleMacroHotkey(event) {
        if (macrosEditMode) {
            return false;
        }
        for (const { button } of allMacroButtons()) {
            if (button.hotkey && eventMatchesHotkey(event, button.hotkey)) {
                event.preventDefault();
                runMacroCommand(button.command);
                return true;
            }
        }
        return false;
    }

    let terminalScrollFrame = 0;

    function scheduleTerminalScroll() {
        if (terminalScrollFrame) {
            return;
        }
        terminalScrollFrame = requestAnimationFrame(() => {
            terminalScrollFrame = 0;
            terminal.scrollTop = terminal.scrollHeight;
        });
    }

    function appendOutput(text) {
        ansi.write(text);
        scheduleTerminalScroll();
    }

    function isMaskedVitalPromptLine(plain) {
        const line = plain.replace(/\s+/g, " ").trim();
        if (!line) {
            return false;
        }
        // <Pf:507 Mn:741 / *>  oppure  <Pf:507 Mn:706 testo/stato>
        if (/^<Pf:\s*\d+\s+Mn:\s*\d+\b.*>$/i.test(line)) {
            return true;
        }
        // Senza <> ma tipico prompt vitale
        if (/^Pf:\s*\d+\s+Mn:\s*\d+(\s+Mv:\s*\d+)?\s*>?$/i.test(line)) {
            return true;
        }
        // Prompt combat senza angle brackets chiusi in modo pulito
        if (
            /^Pf:\s*\d+\s+Mn:\s*\d+\b/i.test(line)
            && line.length < 220
            && (/\*/.test(line) || /\//.test(line) || />$/.test(line))
        ) {
            return true;
        }
        return false;
    }

    function filterPromptForDisplay(chunk) {
        if (settings.hidePromptBars === false) {
            if (promptHoldBuffer) {
                const flushed = promptHoldBuffer;
                promptHoldBuffer = "";
                return flushed + chunk;
            }
            return chunk;
        }

        let data = promptHoldBuffer + chunk;
        promptHoldBuffer = "";

        // Se un "<Pf…" è spezzato su più pacchetti WS, trattienilo finché non arriva ">".
        const lastOpen = data.lastIndexOf("<");
        if (lastOpen !== -1) {
            const tail = data.slice(lastOpen);
            const tailPlain = stripTerminalSequences(tail);
            if (
                /^<\s*Pf:/i.test(tailPlain.trim())
                && !tailPlain.includes(">")
            ) {
                promptHoldBuffer = tail;
                data = data.slice(0, lastOpen);
            } else if (
                /^<$/.test(tailPlain.trim())
                || /^<\s*P?f?:?$/i.test(tailPlain.trim())
            ) {
                promptHoldBuffer = tail;
                data = data.slice(0, lastOpen);
            }
        }

        return data
            .split(/(\r?\n)/)
            .map((part) => {
                if (part === "\n" || part === "\r\n") {
                    return part;
                }
                const plain = stripTerminalSequences(part);
                const trimmed = plain.replace(/\s+/g, " ").trim();
                if (isMaskedVitalPromptLine(trimmed)) {
                    return "";
                }
                // Prompt inline in un pezzo più lungo (anche con ANSI in mezzo).
                if (/<?Pf:\s*\d+\s+Mn:\s*\d+/i.test(plain) && /[*>]/.test(plain)) {
                    const cleaned = plain
                        .replace(/<Pf:\s*\d+\s+Mn:\s*\d+[^>\n]*>/gi, "")
                        .replace(/(?:^|\n)\s*Pf:\s*\d+\s+Mn:\s*\d+(\s+Mv:\s*\d+)?\s*>?\s*(?=\n|$)/gi, "\n")
                        .trim();
                    return cleaned;
                }
                return part;
            })
            .join("")
            .replace(/\n{3,}/g, "\n\n");
    }

    function appendMudOutput(text) {
        if (latencyState.pendingAt != null && String(text || "").length > 0) {
            settleLatencyProbe();
        }
        const plain = stripTerminalSequences(text);
        recentMudText = `${recentMudText}${plain}`.slice(-512);
        vitalsScanBuffer = `${vitalsScanBuffer}${plain}`.slice(-4096);
        if (EXHAUSTED_RE.test(plain)) {
            onSafeExhausted();
        }
        if (MOVE_FAIL_RE.test(plain)) {
            dropPendingMapDir();
            clearMapRunDir("move-fail");
        }
        // Process every [Uscite:] in this chunk immediately (no RAF coalesce),
        // so fast travel doesn't drop intermediate rooms.
        consumeLocationChunk(plain);
        if (!vitalsParseFrame) {
            vitalsParseFrame = requestAnimationFrame(() => {
                vitalsParseFrame = 0;
                updateVitalsFromMudText(vitalsScanBuffer);
            });
        }

        const display = filterPromptForDisplay(text);
        if (display !== "") {
            appendOutput(display);
        }

        if (recorder.active) {
            recorder.append(text).catch(showRecordingError);
        }
    }

    function updateVitalsFromMudText(text) {
        let match;
        let lastFull = null;
        let lastPartial = null;

        VITALS_RE.lastIndex = 0;
        while ((match = VITALS_RE.exec(text)) !== null) {
            lastFull = {
                hp: Number(match[1]),
                mn: Number(match[2]),
                mv: Number(match[3]),
            };
        }

        VITALS_ANGLE_RE.lastIndex = 0;
        while ((match = VITALS_ANGLE_RE.exec(text)) !== null) {
            lastPartial = {
                hp: Number(match[1]),
                mn: Number(match[2]),
                mv: match[3] !== undefined ? Number(match[3]) : null,
            };
        }

        if (!lastFull && !lastPartial) {
            return;
        }

        if (lastFull) {
            vitalsState.hp = lastFull.hp;
            vitalsState.mn = lastFull.mn;
            vitalsState.mv = lastFull.mv;
            vitalsState.hpMax = Math.max(vitalsState.hpMax, lastFull.hp, 1);
            vitalsState.mnMax = Math.max(vitalsState.mnMax, lastFull.mn, 1);
            vitalsState.mvMax = Math.max(vitalsState.mvMax, lastFull.mv, 1);
        } else if (lastPartial) {
            vitalsState.hp = lastPartial.hp;
            vitalsState.mn = lastPartial.mn;
            vitalsState.hpMax = Math.max(vitalsState.hpMax, lastPartial.hp, 1);
            vitalsState.mnMax = Math.max(vitalsState.mnMax, lastPartial.mn, 1);
            if (lastPartial.mv !== null) {
                vitalsState.mv = lastPartial.mv;
                vitalsState.mvMax = Math.max(vitalsState.mvMax, lastPartial.mv, 1);
            } else if (vitalsState.mv === null) {
                // Prompt senza Mv: aggiorna Pf/Mn; Mv resta a 0 finché non arriva.
                vitalsState.mv = 0;
                vitalsState.mvMax = 1;
            }
        }
        renderVitals();
    }

    function renderVitals() {
        if (vitalsState.hp === null) {
            vitalHpLabel.textContent = "—";
            vitalMnLabel.textContent = "—";
            vitalMvLabel.textContent = "—";
            vitalHpBar.style.width = "0%";
            vitalMnBar.style.width = "0%";
            vitalMvBar.style.width = "0%";
            vitalsEl.dataset.lowHp = "false";
            vitalsEl.dataset.lowMv = "false";
            return;
        }

        const hpPct = Math.max(0, Math.min(100, (100 * vitalsState.hp) / vitalsState.hpMax));
        const mnPct = Math.max(0, Math.min(100, (100 * vitalsState.mn) / vitalsState.mnMax));
        const mvPct = Math.max(0, Math.min(100, (100 * vitalsState.mv) / vitalsState.mvMax));

        vitalHpLabel.textContent = `${vitalsState.hp}`;
        vitalMnLabel.textContent = `${vitalsState.mn}`;
        vitalMvLabel.textContent = `${vitalsState.mv}`;
        vitalHpBar.style.width = `${hpPct}%`;
        vitalMnBar.style.width = `${mnPct}%`;
        vitalMvBar.style.width = `${mvPct}%`;
        vitalsEl.dataset.lowHp = String(hpPct <= 25);
        vitalsEl.dataset.lowMv = String(mvPct <= 15 || vitalsState.mv <= 5);
    }

    function resetVitalsUi() {
        vitalsState.hp = null;
        vitalsState.mn = null;
        vitalsState.mv = null;
        vitalsState.hpMax = 1;
        vitalsState.mnMax = 1;
        vitalsState.mvMax = 1;
        renderVitals();
    }

    function isPlausibleRoomName(name) {
        if (!name || name.length < 2 || name.length > 90) {
            return false;
        }
        if (/[.!?]$/.test(name)) {
            return false;
        }
        if (REJECT_ROOM_PREFIX.test(name)) {
            return false;
        }
        if (/^Pf:\s*\d+/i.test(name)) {
            return false;
        }
        return true;
    }

    function roomNameFromLine(line) {
        const trimmed = line.trim();
        if (!trimmed) {
            return null;
        }

        const prompt = trimmed.match(PROMPT_LINE_RE);
        if (prompt) {
            const afterPrompt = prompt[1].trim();
            return isPlausibleRoomName(afterPrompt) ? afterPrompt : null;
        }

        return isPlausibleRoomName(trimmed) ? trimmed : null;
    }

    function updateLocationFromMudText(text) {
        consumeLocationChunk(text);
    }

    function consumeLocationChunk(plain) {
        if (!plain) {
            return;
        }
        const data = `${locationCarry}${plain}`;
        const lines = data.split(/\r?\n/);
        const events = [];
        let lastConsumedLine = -1;
        let skippedNoRoom = 0;

        for (let index = 0; index < lines.length; index += 1) {
            EXITS_LINE_RE.lastIndex = 0;
            const exitsMatch = EXITS_LINE_RE.exec(lines[index]);
            if (!exitsMatch) {
                continue;
            }

            const exits = exitsMatch[1].trim();
            let room = null;
            let above = "";
            for (let back = index - 1; back >= Math.max(0, index - 3); back -= 1) {
                if (!above) {
                    above = lines[back].trim().slice(0, 80);
                }
                room = roomNameFromLine(lines[back]);
                if (room) {
                    break;
                }
            }
            if (!room) {
                skippedNoRoom += 1;
                continue;
            }
            events.push({ room, exits });
            lastConsumedLine = index;
        }

        if (lastConsumedLine >= 0) {
            locationCarry = lines.slice(lastConsumedLine + 1).join("\n");
        } else {
            locationCarry = lines.slice(-3).join("\n");
            if (locationCarry.length > 1800) {
                locationCarry = locationCarry.slice(-1800);
            }
        }

        if (events.length > 1) {
        }

        for (const event of events) {
            locationEpoch += 1;
            const previousRoom = currentRoom;
            currentRoom = event.room;
            lastHandledLocationEpoch = locationEpoch;
            sceneCaption.textContent = currentRoom;
            roomChip.textContent = currentRoom;
            onSafeRoomChanged(previousRoom, currentRoom);
            onMapRoomChanged(currentRoom, locationEpoch);
            applyExits(event.exits);
        }
    }

    function clearPendingMapDirs() {
        mapState.pendingDirs = [];
        clearMapRunDir("queue-clear");
    }

    function clearMapRunDir(reason) {
        if (!mapState.runDir) {
            return;
        }
        mapState.runDir = null;
    }

    function dropPendingMapDir() {
        if (mapState.pendingDirs.length > 0) {
            mapState.pendingDirs.shift();
        }
    }

    function takePendingMapDir() {
        return mapState.pendingDirs.length > 0 ? mapState.pendingDirs.shift() : null;
    }

    /** Resolve dir for this room change: queued step, else sticky corri/run. */
    function resolveMapStepDir() {
        const queued = takePendingMapDir();
        if (queued) {
            return queued;
        }
        if (mapState.runDir && DIR_DELTA[mapState.runDir]) {
            return mapState.runDir;
        }
        return null;
    }

    function noteMapOutboundDir(dir, options = {}) {
        if (!dir || !DIR_DELTA[dir]) {
            return false;
        }
        // Cap in-flight dirs so map stays aligned. When full, caller must NOT
        // send the move to the MUD (rejected clicks are dropped, not desynced).
        if (!options.force && mapState.pendingDirs.length >= MAP_PENDING_DIR_MAX) {
            return false;
        }
        mapState.pendingDirs.push(dir);
        return true;
    }

    function mapCoordKey(x, y, z) {
        return `${x},${y},${z}`;
    }

    function findNodeAt(x, y, z) {
        const key = mapCoordKey(x, y, z);
        for (const node of mapState.nodes.values()) {
            if (mapCoordKey(node.x, node.y, node.z) === key) {
                return node;
            }
        }
        return null;
    }

    function findFreeMapCell(x, y, z) {
        if (!findNodeAt(x, y, z)) {
            return { x, y, z };
        }
        const spiral = [
            [1, 0], [0, 1], [-1, 0], [0, -1],
            [1, 1], [-1, 1], [-1, -1], [1, -1],
            [2, 0], [0, 2], [-2, 0], [0, -2],
        ];
        for (const [dx, dy] of spiral) {
            if (!findNodeAt(x + dx, y + dy, z)) {
                return { x: x + dx, y: y + dy, z };
            }
        }
        return { x: x + mapState.nodes.size + 1, y, z };
    }

    function findNeighborsByDir(fromId, dir) {
        const matches = [];
        if (!fromId || !dir) {
            return matches;
        }
        for (const edge of mapState.edges) {
            if (edge.from === fromId && edge.dir === dir) {
                const node = mapState.nodes.get(edge.to);
                if (node) {
                    matches.push(node);
                }
            } else if (edge.to === fromId && edge.dir && DIR_OPPOSITE[edge.dir] === dir) {
                const node = mapState.nodes.get(edge.from);
                if (node) {
                    matches.push(node);
                }
            }
        }
        return matches;
    }

    function findNeighborByDir(fromId, dir, expectedName) {
        const matches = findNeighborsByDir(fromId, dir);
        if (expectedName) {
            return matches.find((node) => node.name === expectedName) || null;
        }
        // Alone = safe to follow; multiple exits same dir = ambiguous (street vs tunnel).
        return matches.length === 1 ? matches[0] : null;
    }

    function layerHintFromName(roomName) {
        const text = String(roomName || "");
        if (/sotterr|tunnel|cantina|fogne|cripta|cloaca|sotto\b|under/i.test(text)) {
            return -1;
        }
        if (/tetto|torre|balcone|terrazza|piano\s*superiore|soffitta/i.test(text)) {
            return 1;
        }
        return 0;
    }

    function projectMapNode(node, cell = MAP_CELL) {
        return {
            x: node.x * cell + node.z * (cell * 0.28),
            y: node.y * cell - node.z * (cell * 0.28),
        };
    }

    function shortMapLabel(name, max = 18) {
        const trimmed = String(name || "").trim();
        if (trimmed.length <= max) {
            return trimmed;
        }
        return `${trimmed.slice(0, max - 1)}…`;
    }

    function abbreviateRoomName(name) {
        const trimmed = String(name || "").trim();
        if (!trimmed) {
            return "?";
        }
        const words = trimmed.split(/[\s'/]+/).filter(Boolean);
        if (words.length >= 3) {
            const initials = words.slice(0, 3).map((word) => word[0] || "").join("");
            return initials.toUpperCase();
        }
        if (words.length === 2) {
            return shortMapLabel(`${words[0].slice(0, 4)} ${words[1].slice(0, 3)}`, 9);
        }
        return shortMapLabel(trimmed, 8);
    }

    function labelOffsetForNode(node) {
        let hash = 0;
        const key = String(node.id || node.name || "");
        for (let index = 0; index < key.length; index += 1) {
            hash = ((hash << 5) - hash) + key.charCodeAt(index);
            hash |= 0;
        }
        const slots = [
            { x: 0, y: -10, anchor: "middle" },
            { x: 0, y: 13, anchor: "middle" },
            { x: 9, y: 3, anchor: "start" },
            { x: -9, y: 3, anchor: "end" },
            { x: 7, y: -8, anchor: "start" },
            { x: -7, y: 12, anchor: "end" },
        ];
        return slots[Math.abs(hash) % slots.length];
    }

    function mapSearchQuery() {
        return String(mapCamera.search || "").trim().toLowerCase();
    }

    function nodeMatchesSearch(node) {
        const query = mapSearchQuery();
        if (!query) {
            return false;
        }
        return String(node.name || "").toLowerCase().includes(query);
    }

    function linkMapNodes(fromId, toId, dir) {
        if (!fromId || !toId || fromId === toId) {
            return;
        }
        const existing = mapState.edges.find(
            (edge) => (edge.from === fromId && edge.to === toId)
                || (edge.from === toId && edge.to === fromId),
        );
        if (existing) {
            if (dir && !existing.dir) {
                if (existing.from === fromId) {
                    existing.dir = dir;
                } else if (DIR_OPPOSITE[dir]) {
                    existing.dir = DIR_OPPOSITE[dir];
                }
            }
            return;
        }
        mapState.edges.push({ from: fromId, to: toId, dir: dir || "" });
    }

    function selectMapNode(node) {
        mapState.currentId = node.id;
        mapState.focusId = node.id;
        mapState.awaitingSync = false;
        mapState.syncCandidateId = null;
        renderMinimap();
    }

    function selectSyncCandidate(node, options = {}) {
        if (!node) {
            return false;
        }
        mapState.syncCandidateId = node.id;
        mapState.focusId = node.id;
        clearPendingMapDirs();
        if (options.center !== false) {
            const pt = projectMapNode(node, MAP_CELL);
            mapCamera.panX = MAP_LARGE_W / 2 - pt.x * mapCamera.zoom;
            mapCamera.panY = MAP_LARGE_H / 2 - pt.y * mapCamera.zoom;
            applyLargeMapCamera();
        }
        renderMinimap();
        if (!options.silent) {
            showToast(`Selezionato: ${node.name} — premi Sync per confermare`);
        }
        return true;
    }

    /** Highlight a pallino without walking (for Rimuovi / inspect). */
    function focusMapNode(node, options = {}) {
        if (!node) {
            return false;
        }
        mapState.focusId = node.id;
        if (options.center !== false && mapExpand && !mapExpand.hidden) {
            const pt = projectMapNode(node, MAP_CELL);
            mapCamera.panX = MAP_LARGE_W / 2 - pt.x * mapCamera.zoom;
            mapCamera.panY = MAP_LARGE_H / 2 - pt.y * mapCamera.zoom;
            applyLargeMapCamera();
        }
        renderMinimap();
        if (!options.silent) {
            showToast(`Selezionato: ${node.name} — Rimuovi per cancellarlo`);
        }
        return true;
    }

    function removeMapNode(nodeId, options = {}) {
        const id = String(nodeId || "");
        const node = mapState.nodes.get(id);
        if (!node) {
            showToast("Nessuna stanza da rimuovere");
            return false;
        }
        if (!options.force) {
            const ok = window.confirm(
                `Eliminare “${node.name}” dalla mappa?\n(I collegamenti a questo pallino spariscono.)`,
            );
            if (!ok) {
                return false;
            }
        }
        mapState.nodes.delete(id);
        mapState.edges = mapState.edges.filter(
            (edge) => edge.from !== id && edge.to !== id,
        );
        if (mapState.currentId === id) {
            mapState.currentId = null;
            clearPendingMapDirs();
        }
        if (mapState.focusId === id) {
            mapState.focusId = mapState.currentId;
        }
        if (mapState.safeId === id) {
            mapState.safeId = null;
        }
        if (mapState.syncCandidateId === id) {
            mapState.syncCandidateId = null;
        }
        renderMinimap();
        if (!options.silent) {
            showToast(`Rimossa: ${node.name}`);
        }
        return true;
    }

    function removeFocusedMapNode() {
        const id = mapState.syncCandidateId || mapState.focusId || mapState.currentId;
        if (!id || !mapState.nodes.has(id)) {
            showToast("Seleziona un pallino (Shift+click o click destro)");
            return false;
        }
        return removeMapNode(id);
    }

    function findMapNodesByRoomName(roomName) {
        if (!roomName) {
            return [];
        }
        const key = normalizeRoomKey(roomName);
        return [...mapState.nodes.values()].filter(
            (node) => normalizeRoomKey(node.name) === key,
        );
    }

    function onMapRoomChanged(roomName, epoch) {
        // Loaded/imported map: never invent nodes until the player presses Sync.
        if (mapState.awaitingSync && mapState.nodes.size > 0) {
            clearPendingMapDirs();
            renderMinimap();
            return;
        }

        const previousId = mapState.currentId;
        const previous = previousId ? mapState.nodes.get(previousId) : null;
        const dir = resolveMapStepDir();

        // Follow a known exit only if the destination name still matches.
        // Prevents street/tunnel collisions from overwriting Midgaard rooms.
        if (previous && dir) {
            const known = findNeighborByDir(previousId, dir, roomName);
            if (known) {
                selectMapNode(known);
                return;
            }
        }

        if (previous && dir && DIR_DELTA[dir]) {
            const delta = DIR_DELTA[dir];
            let z = previous.z + delta.z;
            const layerHint = layerHintFromName(roomName);
            const previousHint = layerHintFromName(previous.name);
            if (dir !== "u" && dir !== "d") {
                if (layerHint < 0 && previous.z >= 0) {
                    z = Math.min(z, -1);
                } else if (layerHint > 0 && previous.z <= 0) {
                    z = Math.max(z, 1);
                } else if (previousHint < 0 && layerHint >= 0 && previous.z < 0) {
                    // Emerging from named underground toward surface names.
                    z = 0;
                }
            }
            const ideal = {
                x: previous.x + delta.x,
                y: previous.y + delta.y,
                z,
            };
            // Never merge by coordinates alone (same XY street vs tunnel below).
            const occupied = Boolean(findNodeAt(ideal.x, ideal.y, ideal.z));
            const spot = occupied
                ? findFreeMapCell(ideal.x, ideal.y, ideal.z)
                : ideal;
            const id = `m${epoch}`;
            mapState.nodes.set(id, {
                id,
                name: roomName,
                x: spot.x,
                y: spot.y,
                z: spot.z,
            });
            linkMapNodes(previousId, id, dir);
            selectMapNode(mapState.nodes.get(id));
            return;
        }

        // First room, or move without a direction (teleport / look).
        if (!previous) {
            const id = `m${epoch}`;
            mapState.nodes.set(id, {
                id,
                name: roomName,
                x: 0,
                y: 0,
                z: layerHintFromName(roomName) < 0 ? -1 : 0,
            });
            selectMapNode(mapState.nodes.get(id));
            return;
        }

        if (previous.name === roomName) {
            renderMinimap();
            return;
        }

        const free = findFreeMapCell(previous.x + 1, previous.y, previous.z);
        const id = `m${epoch}`;
        mapState.nodes.set(id, {
            id,
            name: roomName,
            x: free.x,
            y: free.y,
            z: free.z,
        });
        selectMapNode(mapState.nodes.get(id));
    }

    function clearMinimap() {
        mapState.nodes.clear();
        mapState.edges = [];
        mapState.currentId = null;
        mapState.safeId = null;
        clearPendingMapDirs();
        mapState.focusId = null;
        mapState.activeName = "";
        mapState.activeId = null;
        mapState.awaitingSync = false;
        mapState.syncCandidateId = null;
        mapCamera.search = "";
        if (mapSearchInput) {
            mapSearchInput.value = "";
        }
        hideMapTooltip();
        renderMinimap();
        showToast("Mappa pulita");
    }

    function readSavedMaps() {
        try {
            const raw = localStorage.getItem(SAVED_MAPS_KEY);
            if (!raw) {
                return [];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function writeSavedMaps(maps) {
        try {
            localStorage.setItem(SAVED_MAPS_KEY, JSON.stringify(maps));
            return true;
        } catch (error) {
            showToast("Salvataggio libreria non riuscito (storage pieno?)");
            return false;
        }
    }

    function normalizeRoomKey(name) {
        return String(name || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[`´’‘]/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    }

    function serializeActiveMap() {
        return {
            version: 1,
            nodes: [...mapState.nodes.values()].map((node) => ({
                id: node.id,
                name: node.name,
                x: node.x,
                y: node.y,
                z: node.z,
            })),
            edges: mapState.edges.map((edge) => ({
                from: edge.from,
                to: edge.to,
                dir: edge.dir || "",
            })),
            safeId: mapState.safeId,
        };
    }

    function slugifyMapName(name) {
        const slug = normalizeRoomKey(name)
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        return slug || "zona";
    }

    function applyMapPayload(entry, options = {}) {
        const nodes = Array.isArray(entry?.nodes) ? entry.nodes : [];
        const edges = Array.isArray(entry?.edges) ? entry.edges : [];
        if (nodes.length === 0) {
            showToast("Mappa vuota o non valida");
            return false;
        }
        mapState.nodes = new Map(
            nodes.map((node) => [String(node.id), {
                id: String(node.id),
                name: String(node.name || "???"),
                x: Number(node.x) || 0,
                y: Number(node.y) || 0,
                z: Number(node.z) || 0,
            }]),
        );
        mapState.edges = edges.map((edge) => ({
            from: String(edge.from),
            to: String(edge.to),
            dir: edge.dir || "",
        }));
        mapState.safeId = entry.safeId && mapState.nodes.has(String(entry.safeId))
            ? String(entry.safeId)
            : null;
        mapState.pendingDirs = [];
        mapState.runDir = null;
        mapState.activeId = entry.id || mapState.activeId || null;
        mapState.activeName = entry.name || mapState.activeName || "Zona";
        mapState.currentId = null;
        mapState.focusId = null;
        mapState.syncCandidateId = null;
        mapState.awaitingSync = true;
        if (mapSaveName) {
            mapSaveName.value = mapState.activeName;
        }
        if (options.refreshSelect) {
            refreshSavedMapsSelect(mapState.activeId);
        }
        fitLargeMap({ preferCurrent: false });
        renderMinimap();
        if (!options.silent) {
            showToast(
                `Mappa “${mapState.activeName}” caricata — vai nella stanza, click sul pallino, Sync`,
            );
        }
        return true;
    }

    function refreshSavedMapsSelect(selectedId) {
        if (!mapLoadSelect) {
            return;
        }
        const maps = readSavedMaps().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        mapLoadSelect.replaceChildren();
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = maps.length ? "— Mappe salvate —" : "— Nessuna mappa salvata —";
        mapLoadSelect.append(placeholder);
        for (const entry of maps) {
            const option = document.createElement("option");
            option.value = entry.id;
            option.textContent = `${entry.name} (${entry.nodes?.length || 0})`;
            if (selectedId && entry.id === selectedId) {
                option.selected = true;
            }
            mapLoadSelect.append(option);
        }
    }

    function saveCurrentMapZone() {
        const name = (mapSaveName?.value || mapState.activeName || "").trim();
        if (!name) {
            showToast("Dai un nome alla zona (es. Midgaard)");
            mapSaveName?.focus();
            return;
        }
        if (mapState.nodes.size === 0) {
            showToast("Esplora almeno una stanza prima di salvare");
            return;
        }
        const maps = readSavedMaps();
        const payload = serializeActiveMap();
        const existing = maps.find(
            (entry) => entry.id === mapState.activeId
                || entry.name.toLowerCase() === name.toLowerCase(),
        );
        const now = Date.now();
        if (existing) {
            existing.name = name;
            existing.updatedAt = now;
            existing.nodes = payload.nodes;
            existing.edges = payload.edges;
            existing.safeId = payload.safeId;
            mapState.activeId = existing.id;
        } else {
            const id = `map${now.toString(36)}`;
            maps.push({
                id,
                name,
                updatedAt: now,
                ...payload,
            });
            mapState.activeId = id;
        }
        mapState.activeName = name;
        if (!writeSavedMaps(maps)) {
            return;
        }
        refreshSavedMapsSelect(mapState.activeId);
        if (mapSaveName) {
            mapSaveName.value = name;
        }
        renderMinimap();
        showToast(`Mappa “${name}” salvata in libreria`);
    }

    function loadSavedMapZone(mapId) {
        const id = mapId || mapLoadSelect?.value || "";
        if (!id) {
            showToast("Scegli una mappa dal menu, poi Carica");
            return;
        }
        const entry = readSavedMaps().find((item) => item.id === id);
        if (!entry) {
            showToast("Mappa non trovata");
            refreshSavedMapsSelect();
            return;
        }
        applyMapPayload(entry, { refreshSelect: true });
    }

    function downloadCurrentMapFile() {
        if (mapState.nodes.size === 0) {
            showToast("Nessuna mappa da scaricare — esplora o carica prima");
            return;
        }
        const name = (mapSaveName?.value || mapState.activeName || "zona").trim() || "zona";
        const payload = {
            ...serializeActiveMap(),
            id: mapState.activeId || `map${Date.now().toString(36)}`,
            name,
            updatedAt: Date.now(),
        };
        const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `mappa-${slugifyMapName(name)}.json`;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        mapState.activeName = name;
        if (mapSaveName) {
            mapSaveName.value = name;
        }
        showToast(`Scaricata mappa-${slugifyMapName(name)}.json`);
    }

    function importMapFromFile(file) {
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result || ""));
                if (!parsed || !Array.isArray(parsed.nodes)) {
                    showToast("File mappa non valido");
                    return;
                }
                applyMapPayload({
                    id: parsed.id || `map${Date.now().toString(36)}`,
                    name: parsed.name || file.name.replace(/\.json$/i, "") || "Importata",
                    nodes: parsed.nodes,
                    edges: parsed.edges || [],
                    safeId: parsed.safeId || null,
                }, { refreshSelect: false });
            } catch {
                showToast("JSON mappa non leggibile");
            }
        };
        reader.onerror = () => showToast("Lettura file non riuscita");
        reader.readAsText(file);
    }

    function deleteSavedMapZone() {
        const id = mapLoadSelect?.value || "";
        if (!id) {
            showToast("Scegli una mappa da eliminare");
            return;
        }
        const maps = readSavedMaps();
        const entry = maps.find((item) => item.id === id);
        if (!entry) {
            refreshSavedMapsSelect();
            return;
        }
        if (!window.confirm(`Eliminare la mappa “${entry.name}”?`)) {
            return;
        }
        writeSavedMaps(maps.filter((item) => item.id !== id));
        if (mapState.activeId === id) {
            mapState.activeId = null;
        }
        refreshSavedMapsSelect();
        showToast(`Mappa “${entry.name}” eliminata`);
    }

    function requestMapSync() {
        if (mapState.nodes.size === 0) {
            showToast("Carica o importa prima una mappa");
            return;
        }
        if (!currentRoom) {
            showToast("Entra in una stanza in gioco, poi Sync");
            return;
        }

        const matches = findMapNodesByRoomName(currentRoom);
        if (matches.length === 0) {
            showToast(`Sync: “${currentRoom}” non è in questa mappa`);
            renderMinimap();
            return;
        }

        const candidate = mapState.syncCandidateId
            ? mapState.nodes.get(mapState.syncCandidateId)
            : null;

        // Never auto-pick by name alone: labels repeat (vie, stanze omonime).
        if (!candidate) {
            mapState.focusId = matches[0].id;
            const pt = projectMapNode(matches[0], MAP_CELL);
            mapCamera.panX = MAP_LARGE_W / 2 - pt.x * mapCamera.zoom;
            mapCamera.panY = MAP_LARGE_H / 2 - pt.y * mapCamera.zoom;
            renderMinimap();
            showToast(
                matches.length === 1
                    ? `Trovato “${currentRoom}” — click sul pallino evidenziato, poi Sync`
                    : `Sync: ${matches.length}× “${currentRoom}” — click sul pallino giusto, poi Sync`,
            );
            return;
        }

        if (normalizeRoomKey(candidate.name) !== normalizeRoomKey(currentRoom)) {
            showToast(
                `Nome non coincide: sei in “${currentRoom}”, pallino “${candidate.name}”`,
            );
            return;
        }

        mapState.currentId = candidate.id;
        mapState.focusId = candidate.id;
        mapState.syncCandidateId = null;
        mapState.awaitingSync = false;
        clearPendingMapDirs();
        centerLargeMapOnCurrent();
        renderMinimap();
        showToast(`Sync OK: ${candidate.name} — puoi esplorare`);
    }

    function centerMinimap() {
        mapState.focusId = mapState.currentId;
        renderMinimap();
    }

    function openMapExpand() {
        if (!mapExpand) {
            return;
        }
        if (mapHelpPop) {
            mapHelpPop.hidden = true;
            minimapHelpBtn?.setAttribute("aria-expanded", "false");
        }
        mapExpand.hidden = false;
        mapState.focusId = mapState.currentId;
        refreshSavedMapsSelect(mapState.activeId);
        if (mapSaveName && mapState.activeName && !mapSaveName.value) {
            mapSaveName.value = mapState.activeName;
        }
        ensureLargeMapInteractions();
        fitLargeMap({ preferCurrent: true });
        renderMinimap();
    }

    function closeMapExpand() {
        if (mapExpand) {
            mapExpand.hidden = true;
        }
        hideMapTooltip();
        mapCamera.dragging = false;
        if (mapExpandStage) {
            mapExpandStage.classList.remove("is-dragging");
        }
    }

    function neighborDirFromCurrent(targetId) {
        if (!mapState.currentId) {
            return null;
        }
        for (const edge of mapState.edges) {
            if (edge.from === mapState.currentId && edge.to === targetId && edge.dir) {
                return edge.dir;
            }
            if (edge.to === mapState.currentId && edge.from === targetId && edge.dir) {
                return DIR_OPPOSITE[edge.dir] || null;
            }
        }
        return null;
    }

    function applyLargeMapCamera() {
        const world = minimapSvgLarge?.querySelector("#map-world");
        if (!world) {
            return;
        }
        world.setAttribute(
            "transform",
            `translate(${mapCamera.panX} ${mapCamera.panY}) scale(${mapCamera.zoom})`,
        );
    }

    function boundsOfMapNodes() {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const node of mapState.nodes.values()) {
            const pt = projectMapNode(node, MAP_CELL);
            minX = Math.min(minX, pt.x);
            minY = Math.min(minY, pt.y);
            maxX = Math.max(maxX, pt.x);
            maxY = Math.max(maxY, pt.y);
        }
        if (!Number.isFinite(minX)) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }
        return { minX, minY, maxX, maxY };
    }

    function fitLargeMap(options = {}) {
        const count = mapState.nodes.size;
        if (count === 0) {
            mapCamera.zoom = 1;
            mapCamera.panX = MAP_LARGE_W / 2;
            mapCamera.panY = MAP_LARGE_H / 2;
            applyLargeMapCamera();
            return;
        }

        if (options.preferCurrent && mapState.currentId) {
            const current = mapState.nodes.get(mapState.currentId);
            if (current) {
                const pt = projectMapNode(current, MAP_CELL);
                mapCamera.zoom = count > 80 ? 0.85 : count > 30 ? 1.05 : 1.25;
                mapCamera.panX = MAP_LARGE_W / 2 - pt.x * mapCamera.zoom;
                mapCamera.panY = MAP_LARGE_H / 2 - pt.y * mapCamera.zoom;
                applyLargeMapCamera();
                return;
            }
        }

        const bounds = boundsOfMapNodes();
        const width = Math.max(MAP_CELL, bounds.maxX - bounds.minX);
        const height = Math.max(MAP_CELL, bounds.maxY - bounds.minY);
        const pad = 64;
        const zoom = Math.min(
            2.4,
            Math.max(0.25, Math.min(
                (MAP_LARGE_W - pad * 2) / width,
                (MAP_LARGE_H - pad * 2) / height,
            )),
        );
        const midX = (bounds.minX + bounds.maxX) / 2;
        const midY = (bounds.minY + bounds.maxY) / 2;
        mapCamera.zoom = zoom;
        mapCamera.panX = MAP_LARGE_W / 2 - midX * zoom;
        mapCamera.panY = MAP_LARGE_H / 2 - midY * zoom;
        applyLargeMapCamera();
    }

    function centerLargeMapOnCurrent() {
        const current = mapState.nodes.get(mapState.currentId);
        if (!current) {
            return;
        }
        const pt = projectMapNode(current, MAP_CELL);
        mapCamera.panX = MAP_LARGE_W / 2 - pt.x * mapCamera.zoom;
        mapCamera.panY = MAP_LARGE_H / 2 - pt.y * mapCamera.zoom;
        applyLargeMapCamera();
    }

    function zoomLargeMap(factor, originX, originY) {
        const prev = mapCamera.zoom;
        const next = Math.min(4, Math.max(0.2, prev * factor));
        if (next === prev) {
            return;
        }
        const ox = originX ?? MAP_LARGE_W / 2;
        const oy = originY ?? MAP_LARGE_H / 2;
        const worldX = (ox - mapCamera.panX) / prev;
        const worldY = (oy - mapCamera.panY) / prev;
        mapCamera.zoom = next;
        mapCamera.panX = ox - worldX * next;
        mapCamera.panY = oy - worldY * next;
        applyLargeMapCamera();
        // Re-evaluate which labels to show at this zoom.
        paintLargeMap();
    }

    function hideMapTooltip() {
        if (mapTooltip) {
            mapTooltip.hidden = true;
            mapTooltip.textContent = "";
        }
        mapCamera.hoverId = null;
    }

    function showMapTooltip(node, clientX, clientY) {
        if (!mapTooltip || !mapExpandStage || !node) {
            return;
        }
        mapCamera.hoverId = node.id;
        mapTooltip.textContent = node.name || "";
        mapTooltip.hidden = false;
        const stageRect = mapExpandStage.getBoundingClientRect();
        const tipW = mapTooltip.offsetWidth || 160;
        const tipH = mapTooltip.offsetHeight || 36;
        let left = clientX - stageRect.left + 14;
        let top = clientY - stageRect.top + 14;
        left = Math.min(Math.max(8, left), stageRect.width - tipW - 8);
        top = Math.min(Math.max(8, top), stageRect.height - tipH - 8);
        mapTooltip.style.left = `${left}px`;
        mapTooltip.style.top = `${top}px`;
    }

    function ensureLargeMapInteractions() {
        if (mapCamera.interactionsBound || !mapExpandStage || !minimapSvgLarge) {
            return;
        }
        mapCamera.interactionsBound = true;

        mapExpandStage.addEventListener("wheel", (event) => {
            event.preventDefault();
            const rect = minimapSvgLarge.getBoundingClientRect();
            const scaleX = MAP_LARGE_W / Math.max(1, rect.width);
            const scaleY = MAP_LARGE_H / Math.max(1, rect.height);
            const ox = (event.clientX - rect.left) * scaleX;
            const oy = (event.clientY - rect.top) * scaleY;
            const factor = event.deltaY > 0 ? 0.9 : 1.11;
            zoomLargeMap(factor, ox, oy);
        }, { passive: false });

        mapExpandStage.addEventListener("pointerdown", (event) => {
            if (event.target.closest(".minimap-node")) {
                return;
            }
            mapCamera.dragging = true;
            mapCamera.lastX = event.clientX;
            mapCamera.lastY = event.clientY;
            mapExpandStage.classList.add("is-dragging");
            mapExpandStage.setPointerCapture?.(event.pointerId);
        });

        mapExpandStage.addEventListener("pointermove", (event) => {
            if (mapCamera.dragging) {
                const rect = minimapSvgLarge.getBoundingClientRect();
                const scaleX = MAP_LARGE_W / Math.max(1, rect.width);
                const scaleY = MAP_LARGE_H / Math.max(1, rect.height);
                const dx = (event.clientX - mapCamera.lastX) * scaleX;
                const dy = (event.clientY - mapCamera.lastY) * scaleY;
                mapCamera.lastX = event.clientX;
                mapCamera.lastY = event.clientY;
                mapCamera.panX += dx;
                mapCamera.panY += dy;
                applyLargeMapCamera();
                return;
            }
            const nodeEl = event.target.closest?.(".minimap-node");
            if (nodeEl) {
                const node = mapState.nodes.get(nodeEl.dataset.nodeId);
                if (node) {
                    showMapTooltip(node, event.clientX, event.clientY);
                    return;
                }
            }
            hideMapTooltip();
        });

        const endDrag = (event) => {
            if (!mapCamera.dragging) {
                return;
            }
            mapCamera.dragging = false;
            mapExpandStage.classList.remove("is-dragging");
            try {
                mapExpandStage.releasePointerCapture?.(event.pointerId);
            } catch {
                // ignore
            }
        };
        mapExpandStage.addEventListener("pointerup", endDrag);
        mapExpandStage.addEventListener("pointercancel", endDrag);
        mapExpandStage.addEventListener("pointerleave", () => {
            if (!mapCamera.dragging) {
                hideMapTooltip();
            }
        });
    }

    function paintMapSvg(svg, viewW, viewH, options = {}) {
        if (!svg) {
            return;
        }
        const cell = options.cell || MAP_MINI_CELL;
        const ns = "http://www.w3.org/2000/svg";
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        const count = mapState.nodes.size;
        if (count === 0) {
            return;
        }

        const focus = mapState.nodes.get(mapState.focusId || mapState.currentId)
            || [...mapState.nodes.values()][0];
        const focusPt = projectMapNode(focus, cell);
        const centerY = options.padBottom ? viewH * 0.4 : viewH / 2;
        const originX = viewW / 2 - focusPt.x;
        const originY = centerY - focusPt.y;

        const edgesGroup = document.createElementNS(ns, "g");
        for (const edge of mapState.edges) {
            const a = mapState.nodes.get(edge.from);
            const b = mapState.nodes.get(edge.to);
            if (!a || !b) {
                continue;
            }
            const pa = projectMapNode(a, cell);
            const pb = projectMapNode(b, cell);
            const line = document.createElementNS(ns, "line");
            line.setAttribute("class", "minimap-edge");
            line.setAttribute("x1", String(pa.x + originX));
            line.setAttribute("y1", String(pa.y + originY));
            line.setAttribute("x2", String(pb.x + originX));
            line.setAttribute("y2", String(pb.y + originY));
            edgesGroup.append(line);
        }
        svg.append(edgesGroup);

        const nodesGroup = document.createElementNS(ns, "g");
        for (const node of mapState.nodes.values()) {
            const pt = projectMapNode(node, cell);
            const cx = pt.x + originX;
            const cy = pt.y + originY;
            const walkDir = neighborDirFromCurrent(node.id);
            const circle = document.createElementNS(ns, "circle");
            circle.setAttribute("class", "minimap-node");
            circle.setAttribute("cx", String(cx));
            circle.setAttribute("cy", String(cy));
            circle.setAttribute("r", node.id === mapState.currentId ? "6.5" : "5");
            circle.classList.toggle("is-current", node.id === mapState.currentId);
            circle.classList.toggle("is-safe", node.id === mapState.safeId);
            const nameMatch = mapState.awaitingSync
                && currentRoom
                && normalizeRoomKey(node.name) === normalizeRoomKey(currentRoom);
            const isCandidate = node.id === mapState.syncCandidateId;
            const isFocused = node.id === mapState.focusId && !isCandidate;
            circle.classList.toggle("is-walkable", Boolean(walkDir) || mapState.awaitingSync);
            circle.classList.toggle("is-match", Boolean(nameMatch));
            circle.classList.toggle("is-anchor", mapState.awaitingSync && !isCandidate);
            circle.classList.toggle("is-candidate", isCandidate);
            circle.classList.toggle("is-focused", isFocused && !mapState.awaitingSync);
            circle.dataset.nodeId = node.id;
            circle.addEventListener("click", (event) => {
                if (mapState.awaitingSync) {
                    selectSyncCandidate(node);
                    return;
                }
                if (event.shiftKey) {
                    focusMapNode(node, { center: false });
                    return;
                }
                if (walkDir) {
                    sendMudCommand(walkDir);
                }
            });
            circle.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                event.stopPropagation();
                removeMapNode(node.id);
            });
            nodesGroup.append(circle);

            if (node.id === mapState.currentId) {
                const label = document.createElementNS(ns, "text");
                label.setAttribute("class", "minimap-label is-emphasis");
                label.setAttribute("x", String(cx));
                label.setAttribute("y", String(cy - 10));
                label.setAttribute("text-anchor", "middle");
                label.textContent = abbreviateRoomName(node.name);
                nodesGroup.append(label);
            }
        }
        svg.append(nodesGroup);

        const current = mapState.nodes.get(mapState.currentId);
        if (current) {
            const pt = projectMapNode(current, cell);
            const you = document.createElementNS(ns, "circle");
            you.setAttribute("class", "minimap-you");
            you.setAttribute("cx", String(pt.x + originX));
            you.setAttribute("cy", String(pt.y + originY));
            you.setAttribute("r", "2.2");
            svg.append(you);
        }
    }

    function paintLargeMap() {
        if (!minimapSvgLarge) {
            return;
        }
        const ns = "http://www.w3.org/2000/svg";
        while (minimapSvgLarge.firstChild) {
            minimapSvgLarge.removeChild(minimapSvgLarge.firstChild);
        }

        const count = mapState.nodes.size;
        if (count === 0) {
            return;
        }

        const world = document.createElementNS(ns, "g");
        world.setAttribute("id", "map-world");

        const edgesGroup = document.createElementNS(ns, "g");
        for (const edge of mapState.edges) {
            const a = mapState.nodes.get(edge.from);
            const b = mapState.nodes.get(edge.to);
            if (!a || !b) {
                continue;
            }
            const pa = projectMapNode(a, MAP_CELL);
            const pb = projectMapNode(b, MAP_CELL);
            const line = document.createElementNS(ns, "line");
            line.setAttribute("class", "minimap-edge");
            line.setAttribute("x1", String(pa.x));
            line.setAttribute("y1", String(pa.y));
            line.setAttribute("x2", String(pb.x));
            line.setAttribute("y2", String(pb.y));
            edgesGroup.append(line);
        }
        world.append(edgesGroup);

        const searching = Boolean(mapSearchQuery());
        const nodesGroup = document.createElementNS(ns, "g");
        const showTinyLabels = mapCamera.zoom >= 0.75 && count <= 140;

        for (const node of mapState.nodes.values()) {
            const pt = projectMapNode(node, MAP_CELL);
            const walkDir = neighborDirFromCurrent(node.id);
            const isCurrent = node.id === mapState.currentId;
            const isSafe = node.id === mapState.safeId;
            const isNear = Boolean(walkDir);
            const isMatch = nodeMatchesSearch(node);
            const circle = document.createElementNS(ns, "circle");
            circle.setAttribute("class", "minimap-node");
            circle.setAttribute("cx", String(pt.x));
            circle.setAttribute("cy", String(pt.y));
            circle.setAttribute("r", isCurrent ? "8" : isNear || isSafe ? "6.5" : "5.5");
            circle.dataset.nodeId = node.id;
            circle.classList.toggle("is-current", isCurrent);
            circle.classList.toggle("is-safe", isSafe);
            const canSelect = mapState.awaitingSync;
            const nameMatch = canSelect
                && currentRoom
                && normalizeRoomKey(node.name) === normalizeRoomKey(currentRoom);
            const isCandidate = node.id === mapState.syncCandidateId;
            const isFocused = node.id === mapState.focusId && !isCandidate;
            circle.classList.toggle("is-walkable", isNear || canSelect);
            circle.classList.toggle("is-neighbor", isNear && !isCurrent);
            circle.classList.toggle("is-match", isMatch || nameMatch);
            circle.classList.toggle("is-anchor", canSelect && !isCandidate);
            circle.classList.toggle("is-candidate", isCandidate);
            circle.classList.toggle("is-focused", isFocused && !canSelect);
            circle.classList.toggle(
                "is-dim",
                (searching && !isMatch && !isCurrent && !isSafe)
                    || (canSelect && currentRoom && !nameMatch && !isCandidate),
            );
            circle.addEventListener("click", (event) => {
                event.stopPropagation();
                if (mapState.awaitingSync) {
                    selectSyncCandidate(node);
                    return;
                }
                if (event.shiftKey) {
                    focusMapNode(node);
                    return;
                }
                if (isNear) {
                    sendMudCommand(walkDir);
                    return;
                }
                focusMapNode(node, { silent: true });
            });
            circle.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                event.stopPropagation();
                removeMapNode(node.id);
            });
            nodesGroup.append(circle);

            const shouldLabel = isCurrent
                || isSafe
                || isMatch
                || isNear
                || showTinyLabels;
            if (shouldLabel) {
                const offset = labelOffsetForNode(node);
                const label = document.createElementNS(ns, "text");
                const emphasis = isCurrent || isMatch || isSafe;
                label.setAttribute(
                    "class",
                    `minimap-label${emphasis ? " is-emphasis" : " is-tiny"}`,
                );
                label.setAttribute("x", String(pt.x + offset.x));
                label.setAttribute("y", String(pt.y + offset.y));
                label.setAttribute("text-anchor", offset.anchor);
                label.textContent = emphasis
                    ? abbreviateRoomName(node.name)
                    : abbreviateRoomName(node.name);
                nodesGroup.append(label);
            }
        }
        world.append(nodesGroup);

        const current = mapState.nodes.get(mapState.currentId);
        if (current) {
            const pt = projectMapNode(current, MAP_CELL);
            const you = document.createElementNS(ns, "circle");
            you.setAttribute("class", "minimap-you");
            you.setAttribute("cx", String(pt.x));
            you.setAttribute("cy", String(pt.y));
            you.setAttribute("r", "2.6");
            world.append(you);
        }

        minimapSvgLarge.append(world);
        applyLargeMapCamera();
    }

    function renderMinimap() {
        const count = mapState.nodes.size;
        const label = `${count} ${count === 1 ? "stanza" : "stanze"}`;
        if (minimapMeta) {
            minimapMeta.textContent = label;
        }
        if (mapExpandTitle) {
            mapExpandTitle.textContent = mapState.activeName
                ? mapState.activeName
                : "Mappa di zona";
        }
        if (mapExpandSub) {
            mapExpandSub.textContent = searchingSummary(count);
        }
        if (minimapEmpty) {
            minimapEmpty.hidden = count > 0;
        }

        paintMapSvg(minimapSvg, MAP_VIEW_W, MAP_VIEW_H, {
            padBottom: false,
            cell: MAP_MINI_CELL,
        });

        if (mapExpand && !mapExpand.hidden) {
            paintLargeMap();
        }
    }

    function searchingSummary(count) {
        const zone = mapState.activeName ? ` · ${mapState.activeName}` : "";
        const waiting = mapState.awaitingSync ? " · in attesa Sync" : "";
        const query = mapSearchQuery();
        if (!query) {
            return `${count} ${count === 1 ? "stanza" : "stanze"}${zone}${waiting}`;
        }
        let matches = 0;
        for (const node of mapState.nodes.values()) {
            if (nodeMatchesSearch(node)) {
                matches += 1;
            }
        }
        return `${matches} risultati · ${count} stanze${zone}${waiting}`;
    }

    function jumpToSearchMatch() {
        const query = mapSearchQuery();
        if (!query) {
            renderMinimap();
            return;
        }
        let first = null;
        for (const node of mapState.nodes.values()) {
            if (nodeMatchesSearch(node)) {
                first = node;
                break;
            }
        }
        if (first) {
            mapState.focusId = first.id;
            const pt = projectMapNode(first, MAP_CELL);
            mapCamera.zoom = Math.max(mapCamera.zoom, 1.35);
            mapCamera.panX = MAP_LARGE_W / 2 - pt.x * mapCamera.zoom;
            mapCamera.panY = MAP_LARGE_H / 2 - pt.y * mapCamera.zoom;
        }
        renderMinimap();
    }

    function applyExits(exitsText) {
        const open = new Set();
        for (const token of exitsText.split(/[\s,]+/)) {
            const key = EXIT_ALIASES[token.toLowerCase()];
            if (key && key.length === 1) {
                open.add(key);
            }
        }

        const labels = exitsText.trim() || "—";
        hereExits.textContent = `Uscite: ${labels}`;

        document.querySelectorAll("#compass .exit-btn, #thumb-compass button").forEach((button) => {
            const dir = button.dataset.dir;
            const isOpen = open.has(dir);
            button.dataset.open = isOpen ? "1" : "0";
            button.classList.toggle("exit-dim", !isOpen);
        });
    }

    function normalizeDirCommand(value) {
        const token = value.trim().toLowerCase();
        return EXIT_ALIASES[token] || null;
    }

    /** "corri e" / "run est" — one command, many auto room changes on the MUD. */
    function parseRunCommand(value) {
        const match = String(value || "")
            .trim()
            .toLowerCase()
            .match(/^(?:corri|run)\s+(\S+)$/);
        if (!match) {
            return null;
        }
        const dir = EXIT_ALIASES[match[1]] || null;
        return dir && DIR_DELTA[dir] ? dir : null;
    }

    function mudCommandForDir(dirOrCommand) {
        const dir = normalizeDirCommand(dirOrCommand);
        if (!dir) {
            return dirOrCommand.trim();
        }
        return DIR_TO_MUD[dir] || dir;
    }

    function clearSafeTimers() {
        clearTimeout(safeState.stepTimer);
        clearTimeout(safeState.waitTimer);
        safeState.stepTimer = null;
        safeState.waitTimer = null;
    }

    function updateSafeUi() {
        const hasSafe = Boolean(safeState.room);
        const steps = safeState.path.length;
        safeBox.dataset.state = safeState.mode;
        safeRoomEl.textContent = hasSafe ? safeState.room : "Non impostato";
        safeMetaEl.textContent = `${steps} ${steps === 1 ? "passo" : "passi"}`;

        if (!hasSafe) {
            safeStatusEl.textContent = "Imposta un punto, poi muoviti: il percorso viene registrato.";
        } else if (safeState.mode === "returning") {
            safeStatusEl.textContent = `Ritorno in corso… restano ${steps} ${steps === 1 ? "passo" : "passi"}.`;
        } else if (safeState.mode === "paused") {
            const reason = safeState.pauseReason || "in pausa";
            safeStatusEl.textContent = `In pausa (${reason}). Premi Riprendi. Restano ${steps} passi.`;
        } else if (steps === 0) {
            safeStatusEl.textContent = "Sei al safe. Muoviti per registrare il percorso.";
        } else {
            safeStatusEl.textContent = "Percorso registrato. Torna per ripercorrerlo al contrario.";
        }

        safeReturnBtn.disabled = !hasSafe || steps === 0 || safeState.mode === "returning";
        safeResumeBtn.hidden = safeState.mode !== "paused";
        safeStopBtn.hidden = safeState.mode !== "returning" && safeState.mode !== "paused";
        safeSetBtn.disabled = safeState.mode === "returning";
    }

    function setSafePoint() {
        if (!currentRoom) {
            showToast("Aspetta di entrare in una stanza");
            return;
        }
        clearSafeTimers();
        safeState.room = currentRoom;
        safeState.path = [];
        safeState.mode = "idle";
        safeState.pendingDir = null;
        safeState.pendingReturn = false;
        safeState.pauseReason = "";
        mapState.safeId = mapState.currentId;
        updateSafeUi();
        renderMinimap();
        showToast(`Safe: ${currentRoom}`);
    }

    function stopSafeReturn(message) {
        clearSafeTimers();
        safeState.mode = "idle";
        safeState.pendingReturn = false;
        safeState.pendingDir = null;
        safeState.pauseReason = "";
        updateSafeUi();
        if (message) {
            showToast(message);
        }
    }

    function pauseSafeReturn(reason) {
        if (safeState.mode !== "returning" && safeState.mode !== "paused") {
            return;
        }
        clearSafeTimers();
        safeState.mode = "paused";
        safeState.pendingReturn = false;
        safeState.pendingDir = null;
        safeState.pauseReason = reason || "in pausa";
        updateSafeUi();
        showToast(reason || "Ritorno in pausa");
    }

    function onSafeExhausted() {
        if (safeState.mode === "returning" || safeState.pendingReturn) {
            pauseSafeReturn("esausto — recupera Mv");
            return;
        }
        if (safeState.pendingDir) {
            safeState.pendingDir = null;
            updateSafeUi();
        }
    }

    function scheduleSafeReturnStep() {
        clearTimeout(safeState.stepTimer);
        safeState.stepTimer = setTimeout(() => {
            performSafeReturnStep();
        }, SAFE_STEP_DELAY_MS);
    }

    function performSafeReturnStep() {
        if (safeState.mode !== "returning") {
            return;
        }
        if (safeState.path.length === 0) {
            stopSafeReturn("Sei tornato al safe");
            return;
        }
        if (safeState.room && currentRoom === safeState.room) {
            safeState.path = [];
            stopSafeReturn("Sei tornato al safe");
            return;
        }

        const lastDir = safeState.path[safeState.path.length - 1];
        const backDir = DIR_OPPOSITE[lastDir];
        if (!backDir) {
            pauseSafeReturn("Direzione non invertibile");
            return;
        }

        safeState.pendingReturn = true;
        updateSafeUi();
        if (!sendMudCommand(backDir, { fromSafeWalk: true })) {
            pauseSafeReturn("Connessione persa");
            return;
        }

        clearTimeout(safeState.waitTimer);
        safeState.waitTimer = setTimeout(() => {
            if (safeState.mode === "returning" && safeState.pendingReturn) {
                pauseSafeReturn("nessun passo rilevato — riprova Riprendi");
            }
        }, SAFE_STEP_TIMEOUT_MS);
    }

    function startSafeReturn() {
        if (!safeState.room) {
            showToast("Imposta prima un safe");
            return;
        }
        if (safeState.path.length === 0) {
            showToast("Nessun passo da ripercorrere");
            return;
        }
        if (currentRoom === safeState.room) {
            safeState.path = [];
            updateSafeUi();
            showToast("Sei già al safe");
            return;
        }
        clearSafeTimers();
        safeState.mode = "returning";
        safeState.pendingDir = null;
        safeState.pendingReturn = false;
        updateSafeUi();
        showToast("Ritorno al safe…");
        performSafeReturnStep();
    }

    function resumeSafeReturn() {
        if (safeState.mode !== "paused") {
            return;
        }
        if (safeState.path.length === 0) {
            stopSafeReturn("Percorso vuoto");
            return;
        }
        safeState.mode = "returning";
        updateSafeUi();
        showToast("Riprendo il ritorno…");
        performSafeReturnStep();
    }

    function onSafeRoomChanged(_previousRoom, nextRoom) {
        if (safeState.mode === "returning" && safeState.pendingReturn) {
            clearTimeout(safeState.waitTimer);
            safeState.waitTimer = null;
            safeState.pendingReturn = false;
            if (safeState.path.length > 0) {
                safeState.path.pop();
            }
            if (nextRoom === safeState.room || safeState.path.length === 0) {
                safeState.path = [];
                stopSafeReturn("Sei tornato al safe");
                return;
            }
            updateSafeUi();
            scheduleSafeReturnStep();
            return;
        }

        if (safeState.room && safeState.mode !== "returning") {
            const stepDir = safeState.pendingDir || mapState.runDir;
            if (stepDir) {
                safeState.path.push(stepDir);
                // While corri/run is sticky, keep recording each auto-step.
                safeState.pendingDir = mapState.runDir || null;
                if (safeState.mode === "paused") {
                    // Keep paused, but path grew if the player walked while resting.
                } else {
                    safeState.mode = "idle";
                }
                updateSafeUi();
            }
        }
    }

    function noteSafeOutboundDir(dir) {
        if (!safeState.room || safeState.mode === "returning") {
            return;
        }
        safeState.pendingDir = dir;
    }

    function resetLocationUi() {
        currentRoom = "";
        locationCarry = "";
        vitalsScanBuffer = "";
        sceneCaption.textContent = "In viaggio…";
        roomChip.textContent = "In attesa del luogo…";
        hereExits.textContent = "Uscite: —";
        document.querySelectorAll("#compass .exit-btn, #thumb-compass button").forEach((button) => {
            button.dataset.open = "1";
            button.classList.remove("exit-dim");
        });
        clearSafeTimers();
        safeState.room = null;
        safeState.path = [];
        safeState.mode = "idle";
        safeState.pendingDir = null;
        safeState.pendingReturn = false;
        safeState.pauseReason = "";
        locationEpoch = 0;
        lastHandledLocationEpoch = 0;
        // Keep explored/saved zone map across reconnect; only clear movement pending.
        clearPendingMapDirs();
        mapState.runDir = null;
        mapState.currentId = null;
        updateSafeUi();
        resetVitalsUi();
        renderMinimap();
    }

    function setConnected(connected, label) {
        statusLabel.textContent = label;
        status.dataset.connected = String(connected);
        command.disabled = !connected;
        send.disabled = !connected;
        recordingToggle.disabled = !connected || !recorder.available;
        if (connected) {
            focusCommandBar();
        }
    }

    function tryHandleSilmaNotice(raw) {
        const text = String(raw || "").trim();
        if (!text.startsWith("{") || !text.includes('"__silma"')) {
            return false;
        }
        try {
            const payload = JSON.parse(text);
            if (payload && payload.__silma === "notice" && payload.text) {
                showAdminNotice(String(payload.text));
                return true;
            }
        } catch {
            return false;
        }
        return false;
    }

    function showAdminNotice(message) {
        const trimmed = String(message || "").trim();
        if (!trimmed || !adminNotice || !adminNoticeText) {
            return;
        }
        adminNoticeText.textContent = trimmed;
        adminNotice.hidden = false;
    }

    function hideAdminNotice() {
        if (adminNotice) {
            adminNotice.hidden = true;
        }
    }

    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                return {
                    fontScale: 1,
                    reduceFx: false,
                    numpadDirs: true,
                    hidePromptBars: true,
                    ...JSON.parse(raw),
                };
            }
        } catch {
            // Keep defaults when preferences cannot be read.
        }
        return { fontScale: 1, reduceFx: false, numpadDirs: true, hidePromptBars: true };
    }

    function saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            // Settings still apply for this page even if they cannot be persisted.
        }
    }

    function applySettings() {
        document.documentElement.style.setProperty("--font-scale", String(settings.fontScale));
        app.classList.toggle("reduce-fx", Boolean(settings.reduceFx));
        setFont.value = String(settings.fontScale);
        setHidePrompt.checked = settings.hidePromptBars !== false;
    }

    function closePopovers() {
        settingsPop.hidden = true;
        shortcutsPop.hidden = true;
        feedbackPop.hidden = true;
        changelogPop.hidden = true;
        if (mapHelpPop) {
            mapHelpPop.hidden = true;
        }
        settingsBtn.setAttribute("aria-expanded", "false");
        changelogBtn.setAttribute("aria-expanded", "false");
        minimapHelpBtn?.setAttribute("aria-expanded", "false");
    }

    function formatChangelogWhen(value) {
        const secs = Number(value);
        if (!Number.isFinite(secs) || secs <= 0) {
            return "";
        }
        return new Date(secs * 1000).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function changelogKindLabel(kind) {
        if (kind === "feature") return "Nuovo";
        if (kind === "note") return "Nota";
        return "Fix";
    }

    function renderChangelog(releases) {
        if (!Array.isArray(releases) || releases.length === 0) {
            changelogList.replaceChildren();
            const empty = document.createElement("div");
            empty.className = "changelog-empty";
            empty.textContent = "Nessuna release pubblicata ancora.";
            changelogList.append(empty);
            return;
        }

        changelogList.replaceChildren(
            ...releases.map((release) => {
                const block = document.createElement("article");
                block.className = "changelog-release";

                const head = document.createElement("div");
                head.className = "changelog-release__head";

                const ver = document.createElement("span");
                ver.className = "changelog-release__ver";
                ver.textContent = `v${release.version}`;

                const when = document.createElement("span");
                when.className = "changelog-release__when";
                when.textContent = formatChangelogWhen(release.created_at);

                head.append(ver, when);
                block.append(head);

                for (const item of release.items || []) {
                    const row = document.createElement("div");
                    row.className = "changelog-item";
                    const kind = document.createElement("span");
                    kind.className = "changelog-item__kind";
                    kind.textContent = changelogKindLabel(item.kind);
                    const text = document.createElement("span");
                    text.textContent = item.text || "";
                    row.append(kind, text);
                    block.append(row);
                }
                return block;
            }),
        );
    }

    async function loadChangelog(markSeen) {
        try {
            const response = await fetch("/silmaclient/changelog", { cache: "no-store" });
            if (!response.ok) {
                throw new Error("changelog fetch failed");
            }
            const data = await response.json();
            const releases = Array.isArray(data.releases) ? data.releases : [];
            renderChangelog(releases);
            changelogLoaded = true;

            const latestId = releases[0] && releases[0].id ? String(releases[0].id) : "";
            const seenId = localStorage.getItem(CHANGELOG_SEEN_KEY) || "";
            if (markSeen && latestId) {
                localStorage.setItem(CHANGELOG_SEEN_KEY, latestId);
                changelogBtn.classList.remove("has-new");
            } else if (latestId && latestId !== seenId) {
                changelogBtn.classList.add("has-new");
            } else {
                changelogBtn.classList.remove("has-new");
            }
        } catch {
            if (!changelogLoaded) {
                changelogList.replaceChildren();
                const empty = document.createElement("div");
                empty.className = "changelog-empty";
                empty.textContent = "Impossibile caricare le novità.";
                changelogList.append(empty);
            }
        }
    }

    async function openChangelog() {
        const open = changelogPop.hidden;
        closePopovers();
        if (!open) {
            return;
        }
        changelogPop.hidden = false;
        changelogBtn.setAttribute("aria-expanded", "true");
        await loadChangelog(true);
    }

    function openFeedbackForm(kind) {
        feedbackKind = kind === "miglioria" ? "miglioria" : "bug";
        closePopovers();
        feedbackPop.hidden = false;
        if (feedbackKind === "bug") {
            feedbackTitle.textContent = "Segnala un bug";
            feedbackHint.textContent = "Descrivi cosa non funziona e, se puoi, come riprodurlo.";
        } else {
            feedbackTitle.textContent = "Proponi una miglioria";
            feedbackHint.textContent = "Descrivi l’idea o il miglioramento che vorresti.";
        }
        feedbackText.value = "";
        feedbackText.focus();
    }

    async function submitFeedback() {
        const text = feedbackText.value.trim();
        if (!text) {
            showToast("Scrivi un testo prima di inviare");
            feedbackText.focus();
            return;
        }
        feedbackSend.disabled = true;
        try {
            const response = await fetch("/silmaclient/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kind: feedbackKind,
                    text,
                    nick: feedbackNick.value.trim(),
                }),
            });
            if (!response.ok) {
                throw new Error("send failed");
            }
            feedbackPop.hidden = true;
            feedbackText.value = "";
            showToast("Segnalazione inviata, grazie!");
        } catch {
            showToast("Invio non riuscito, riprova");
        } finally {
            feedbackSend.disabled = false;
        }
    }

    function latencyLevel(ms) {
        if (ms == null) {
            return "";
        }
        if (ms < 80) {
            return "ok";
        }
        if (ms < 200) {
            return "mid";
        }
        return "slow";
    }

    function renderLatencyChip() {
        if (!latencyChip) {
            return;
        }
        if (latencyState.pendingAt != null) {
            latencyChip.textContent = "… ms";
            latencyChip.dataset.level = "wait";
            latencyChip.title = "In attesa della risposta MUD…";
            return;
        }
        if (latencyState.lastMs == null) {
            latencyChip.textContent = "— ms";
            latencyChip.dataset.level = "";
            latencyChip.title =
                "Tempo comando → prima risposta MUD (browser↔gateway↔MUD). Confronta locale vs VPS.";
            return;
        }
        const samples = latencyState.samples;
        const avg = samples.length
            ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length)
            : latencyState.lastMs;
        latencyChip.textContent = `${latencyState.lastMs} ms`;
        latencyChip.dataset.level = latencyLevel(latencyState.lastMs);
        latencyChip.title =
            `Ultimo: ${latencyState.lastMs} ms · media (${samples.length}): ${avg} ms\n`
            + "Misura: invio comando → primo pezzo di output MUD.";
    }

    function markLatencyProbe() {
        latencyState.pendingAt = performance.now();
        renderLatencyChip();
    }

    function settleLatencyProbe() {
        if (latencyState.pendingAt == null) {
            return;
        }
        const ms = Math.max(0, Math.round(performance.now() - latencyState.pendingAt));
        latencyState.pendingAt = null;
        latencyState.lastMs = ms;
        latencyState.samples.push(ms);
        if (latencyState.samples.length > LATENCY_SAMPLE_MAX) {
            latencyState.samples.shift();
        }
        renderLatencyChip();
    }

    function resetLatencyProbe() {
        latencyState.pendingAt = null;
        latencyState.samples = [];
        latencyState.lastMs = null;
        renderLatencyChip();
    }

    function sendMudCommand(value, options = {}) {
        const fromSafeWalk = Boolean(options.fromSafeWalk);
        if (socket?.readyState !== WebSocket.OPEN) {
            showToast("Non connesso");
            return false;
        }

        if (!fromSafeWalk && (safeState.mode === "returning" || safeState.pendingReturn)) {
            pauseSafeReturn("Ritorno interrotto");
        }

        const runDir = parseRunCommand(value);
        const dir = normalizeDirCommand(value);
        if (runDir) {
            mapState.runDir = runDir;
            if (!fromSafeWalk) {
                noteSafeOutboundDir(runDir);
            }
        } else if (dir) {
            if (mapState.runDir) {
                clearMapRunDir("manual-dir");
            }
            // Safe return may force-queue; user spam is dropped when full so the
            // MUD never runs ahead of the map.
            const queuedForMap = noteMapOutboundDir(dir, { force: fromSafeWalk });
            if (!queuedForMap) {
                return false;
            }
            if (!fromSafeWalk) {
                noteSafeOutboundDir(dir);
            }
        }

        // Path interno: n/s/e/w/u/d. Verso il MUD: su/giu (mai "d" = dormi).
        const toSend = dir ? mudCommandForDir(dir) : value;
        if (toSend.trim() !== "") {
            markLatencyProbe();
        }
        socket.send(`${toSend}\r\n`);
        recorder.append(formatRecordedCommand(toSend)).catch(showRecordingError);
        recentMudText = "";
        if (toSend.trim() !== "" && !fromSafeWalk) {
            rememberCommand(toSend);
            keepCommandInBar(toSend);
        }
        return true;
    }

    function keepCommandInBar(value) {
        command.value = value;
        focusCommandBar();
        command.setSelectionRange(0, value.length);
    }

    function isEditableTypingTarget(el) {
        if (!(el instanceof Element)) {
            return false;
        }
        if (el === command || command.contains(el)) {
            return true;
        }
        if (el.closest?.("[contenteditable=''], [contenteditable='true']")) {
            return true;
        }
        const tag = el.tagName;
        if (tag === "TEXTAREA" || tag === "SELECT") {
            return true;
        }
        if (tag === "INPUT") {
            const type = (el.getAttribute("type") || "text").toLowerCase();
            return ![
                "button",
                "submit",
                "reset",
                "checkbox",
                "radio",
                "file",
                "image",
                "hidden",
                "range",
                "color",
            ].includes(type);
        }
        return false;
    }

    function focusCommandBar() {
        if (!command || command.disabled) {
            return;
        }
        try {
            command.focus({ preventScroll: true });
        } catch {
            command.focus();
        }
    }

    function clearTerminal() {
        terminal.replaceChildren();
        ansi.reset();
        showToast("Cronaca pulita");
    }

    function websocketUrl() {
        const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
        return `${scheme}//${window.location.host}/silmaclient/ws`;
    }

    function connect() {
        if (socket?.readyState === WebSocket.CONNECTING
            || socket?.readyState === WebSocket.OPEN) {
            return;
        }

        setConnected(false, "Connessione…");
        reconnect.disabled = true;
        const nextSocket = new WebSocket(websocketUrl());
        socket = nextSocket;
        nextSocket.binaryType = "arraybuffer";

        nextSocket.addEventListener("open", async () => {
            reconnect.hidden = true;
            reconnect.textContent = "Riconnetti";
            resetLocationUi();
            resetLatencyProbe();
            setConnected(true, "In gioco");
            if (recordingPreference()) {
                recordingToggle.disabled = true;
                try {
                    await recorder.start();
                    updateRecordingControls();
                    await refreshSessionArchive();
                } catch (error) {
                    showRecordingError(error);
                } finally {
                    recordingToggle.disabled = socket?.readyState !== WebSocket.OPEN
                        || !recorder.available;
                }
            }
        });

        nextSocket.addEventListener("message", (event) => {
            if (typeof event.data === "string") {
                if (tryHandleSilmaNotice(event.data)) {
                    return;
                }
                appendMudOutput(event.data);
                return;
            }
            appendMudOutput(decoder.decode(event.data, { stream: true }));
        });

        nextSocket.addEventListener("close", async () => {
            if (socket !== nextSocket) {
                return;
            }

            setConnected(false, "Disconnesso");
            resetLatencyProbe();
            reconnect.hidden = false;
            reconnect.disabled = false;
            reconnect.textContent = "Riconnetti";
            try {
                const remainingText = decoder.decode();
                if (remainingText !== "") {
                    appendMudOutput(remainingText);
                }
                await recorder.stop();
                updateRecordingControls();
                await refreshSessionArchive();
            } catch (error) {
                showRecordingError(error);
            }
        });

        nextSocket.addEventListener("error", () => {
            appendOutput("\r\n[gateway] Errore di connessione WebSocket.\r\n");
        });
    }

    reconnect.addEventListener("click", () => {
        reconnect.textContent = "Riconnessione…";
        connect();
    });

    async function loadClientConfig() {
        try {
            const response = await fetch("/silmaclient/config");
            if (!response.ok) {
                loadCommandHistory();
                return;
            }

            const config = await response.json();
            if (Number.isInteger(config.command_history_size) && config.command_history_size > 0) {
                commandHistorySize = config.command_history_size;
            }
        } catch {
            // Keep the built-in default when the public configuration is unavailable.
        }
        loadCommandHistory();
    }

    function loadCommandHistory() {
        try {
            const raw = localStorage.getItem(COMMAND_HISTORY_KEY);
            if (!raw) {
                return;
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return;
            }
            commandHistory.length = 0;
            for (const entry of parsed) {
                if (typeof entry === "string" && entry.trim() !== "") {
                    commandHistory.push(entry);
                }
            }
            if (commandHistory.length > commandHistorySize) {
                commandHistory.splice(0, commandHistory.length - commandHistorySize);
            }
            if (commandHistory.length > 0 && command.value === "") {
                const last = commandHistory[commandHistory.length - 1];
                command.value = last;
                historyDraft = last;
            }
        } catch {
            // Keep an empty in-memory history when storage is unavailable.
        }
    }

    function saveCommandHistory() {
        try {
            localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(commandHistory));
        } catch {
            // History still works for this tab even if it cannot be persisted.
        }
    }

    function rememberCommand(value) {
        const trimmed = value.trim();
        if (trimmed !== "") {
            if (commandHistory[commandHistory.length - 1] !== trimmed) {
                commandHistory.push(trimmed);
            }
            if (commandHistory.length > commandHistorySize) {
                commandHistory.splice(0, commandHistory.length - commandHistorySize);
            }
            saveCommandHistory();
        }
        // Dopo l'invio resti sulla riga corrente (comando ancora in barra).
        historyIndex = -1;
        historyDraft = trimmed;
    }

    function showHistoryValue(value) {
        command.value = value;
        command.focus();
        const cursor = value.length;
        command.setSelectionRange(cursor, cursor);
    }

    function enterCommandHistory() {
        historyDraft = command.value;
        let index = commandHistory.length - 1;
        // Se in barra c'è già l'ultimo comando inviato, parti da quello prima.
        if (index >= 0 && commandHistory[index] === historyDraft && index > 0) {
            index -= 1;
        }
        historyIndex = index;
        showHistoryValue(commandHistory[historyIndex]);
    }

    function onCommandHistoryKey(event) {
        const isUp = event.key === "ArrowUp" || event.code === "ArrowUp";
        const isDown = event.key === "ArrowDown" || event.code === "ArrowDown";
        if (!isUp && !isDown) {
            return;
        }
        if (commandHistory.length === 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (historyIndex < 0) {
            // ↑ o ↓ dalla riga corrente → entra in cronologia (comandi precedenti).
            enterCommandHistory();
            return;
        }

        if (isUp) {
            if (historyIndex > 0) {
                historyIndex -= 1;
                showHistoryValue(commandHistory[historyIndex]);
            } else {
                showHistoryValue(commandHistory[0]);
            }
            return;
        }

        // ↓ verso comandi più recenti, poi torna alla riga corrente.
        if (historyIndex < commandHistory.length - 1) {
            historyIndex += 1;
            showHistoryValue(commandHistory[historyIndex]);
            return;
        }

        historyIndex = -1;
        showHistoryValue(historyDraft);
    }

    command.addEventListener("keydown", onCommandHistoryKey, true);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        sendMudCommand(command.value);
    });

    function formatRecordedCommand(value) {
        const lastLine = recentMudText.split(/\r?\n/).at(-1)?.trim() ?? "";
        const passwordPrompt = /(?:password|passphrase|parola\s+d['’]?ordine)\s*:?\s*$/i;
        const passwordCommand = /^\s*(?:password|passwd|passphrase|change\s*password|cambia\s*password)\b/i;
        const displayedValue = passwordPrompt.test(lastLine) || passwordCommand.test(value)
            ? "[input hidden]"
            : value;
        return `[command] ${displayedValue}\r\n`;
    }

    recordingToggle.addEventListener("click", async () => {
        recordingToggle.disabled = true;
        try {
            if (recorder.active) {
                await recorder.stop();
                setRecordingPreference(false);
                showToast("Registrazione fermata");
            } else {
                await recorder.start();
                setRecordingPreference(true);
                showToast("Registrazione avviata");
            }
            updateRecordingControls();
            await refreshSessionArchive();
        } catch (error) {
            showRecordingError(error);
        } finally {
            recordingToggle.disabled = socket?.readyState !== WebSocket.OPEN || !recorder.available;
        }
    });

    sessionList.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }

        button.disabled = true;
        const sessionId = button.dataset.sessionId;
        try {
            if (button.dataset.action === "download") {
                await recorder.download(sessionId);
            } else if (button.dataset.action === "delete") {
                await recorder.remove(sessionId);
                await refreshSessionArchive();
            }
        } catch (error) {
            showArchiveError(error);
        } finally {
            button.disabled = false;
        }
    });

    applySettings();
    renderMacros();
    updateSafeUi();
    renderVitals();
    renderMinimap();
    renderLatencyChip();
    void loadChangelog(false);

    if (minimapCenterBtn) {
        minimapCenterBtn.addEventListener("click", centerMinimap);
    }
    if (minimapClearBtn) {
        minimapClearBtn.addEventListener("click", clearMinimap);
    }
    if (minimapExpandBtn) {
        minimapExpandBtn.addEventListener("click", openMapExpand);
    }
    if (minimapHelpBtn && mapHelpPop) {
        minimapHelpBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            const open = mapHelpPop.hidden;
            closePopovers();
            mapHelpPop.hidden = !open;
            minimapHelpBtn.setAttribute("aria-expanded", String(open));
        });
        mapHelpPop.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }
    if (mapHelpClose) {
        mapHelpClose.addEventListener("click", closePopovers);
    }
    try {
        localStorage.removeItem("silmaclient.map-debug-log");
    } catch {
        // ignore
    }
    if (mapExpandClose) {
        mapExpandClose.addEventListener("click", closeMapExpand);
    }
    if (mapExpand) {
        mapExpand.addEventListener("click", (event) => {
            if (event.target === mapExpand) {
                closeMapExpand();
            }
        });
    }
    if (mapZoomInBtn) {
        mapZoomInBtn.addEventListener("click", () => zoomLargeMap(1.2));
    }
    if (mapZoomOutBtn) {
        mapZoomOutBtn.addEventListener("click", () => zoomLargeMap(1 / 1.2));
    }
    if (mapFitBtn) {
        mapFitBtn.addEventListener("click", () => {
            fitLargeMap({ preferCurrent: false });
            paintLargeMap();
        });
    }
    if (mapGotoMeBtn) {
        mapGotoMeBtn.addEventListener("click", () => {
            mapCamera.zoom = Math.max(mapCamera.zoom, 1.15);
            centerLargeMapOnCurrent();
            paintLargeMap();
        });
    }
    if (mapSearchInput) {
        mapSearchInput.addEventListener("input", () => {
            mapCamera.search = mapSearchInput.value;
            jumpToSearchMatch();
        });
        mapSearchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                jumpToSearchMatch();
            }
        });
    }
    if (mapSaveBtn) {
        mapSaveBtn.addEventListener("click", saveCurrentMapZone);
    }
    if (mapLoadBtn) {
        mapLoadBtn.addEventListener("click", () => loadSavedMapZone());
    }
    if (mapDeleteBtn) {
        mapDeleteBtn.addEventListener("click", deleteSavedMapZone);
    }
    if (mapDownloadBtn) {
        mapDownloadBtn.addEventListener("click", downloadCurrentMapFile);
    }
    if (mapImportBtn && mapImportFile) {
        mapImportBtn.addEventListener("click", () => mapImportFile.click());
        mapImportFile.addEventListener("change", () => {
            const file = mapImportFile.files && mapImportFile.files[0];
            importMapFromFile(file);
            mapImportFile.value = "";
        });
    }
    if (mapSyncBtn) {
        mapSyncBtn.addEventListener("click", requestMapSync);
    }
    if (mapRemoveRoomBtn) {
        mapRemoveRoomBtn.addEventListener("click", () => {
            removeFocusedMapNode();
        });
    }
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Delete") {
            return;
        }
        if (!mapExpand || mapExpand.hidden) {
            return;
        }
        if (event.target.closest?.("input, textarea, select, [contenteditable='true']")) {
            return;
        }
        event.preventDefault();
        removeFocusedMapNode();
    });
    if (mapSaveName) {
        mapSaveName.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                saveCurrentMapZone();
            }
        });
    }
    refreshSavedMapsSelect();

    safeSetBtn.addEventListener("click", setSafePoint);
    safeReturnBtn.addEventListener("click", startSafeReturn);
    safeResumeBtn.addEventListener("click", resumeSafeReturn);
    safeStopBtn.addEventListener("click", () => {
        stopSafeReturn("Ritorno fermato");
    });

    clearTerminalBtn.addEventListener("click", clearTerminal);

    document.querySelectorAll("#compass .exit-btn, #thumb-compass button").forEach((button) => {
        button.addEventListener("click", () => {
            sendMudCommand(button.dataset.dir);
        });
    });

    macrosEditToggle.addEventListener("click", () => {
        const opening = !macrosEditMode;
        setMacrosEditMode(opening);
        if (opening) {
            macrosEditor.scrollIntoView({ block: "nearest", behavior: "smooth" });
            macrosCategoryName.focus();
        }
    });

    document.querySelector("#macros-suggestions").addEventListener("click", (event) => {
        const suggestion = event.target.closest("[data-suggest-category]");
        if (!suggestion) {
            return;
        }
        addCategory(suggestion.dataset.suggestCategory);
    });

    macrosFilter.addEventListener("input", () => {
        macrosFilterText = macrosFilter.value.trim().toLowerCase();
        renderMacros();
    });

    function onMacrosClick(event) {
        const deleteButton = event.target.closest("[data-delete-button]");
        if (deleteButton) {
            event.preventDefault();
            event.stopPropagation();
            const category = macros.categories.find(
                (entry) => entry.id === deleteButton.dataset.categoryId,
            );
            if (!category) {
                return;
            }
            category.buttons = category.buttons.filter(
                (button) => button.id !== deleteButton.dataset.deleteButton,
            );
            saveMacros();
            renderMacros();
            showToast("Pulsante eliminato");
            return;
        }

        const toggleFavorite = event.target.closest("[data-toggle-favorite]");
        if (toggleFavorite) {
            event.preventDefault();
            event.stopPropagation();
            const found = findButton(toggleFavorite.dataset.toggleFavorite);
            if (!found) {
                return;
            }
            found.button.favorite = !found.button.favorite;
            saveMacros();
            renderMacros();
            return;
        }

        const deleteCategory = event.target.closest("[data-delete-category]");
        if (deleteCategory) {
            event.preventDefault();
            macros.categories = macros.categories.filter(
                (entry) => entry.id !== deleteCategory.dataset.deleteCategory,
            );
            saveMacros();
            renderMacros();
            showToast("Categoria eliminata");
            return;
        }

        if (macrosEditMode) {
            return;
        }

        const action = event.target.closest(".macros-btn[data-cmd]");
        if (!action) {
            return;
        }
        runMacroCommand(action.dataset.cmd);
    }

    macrosRoot.addEventListener("click", onMacrosClick);
    macrosFavoritesList.addEventListener("click", onMacrosClick);

    macrosRoot.addEventListener("change", (event) => {
        const select = event.target.closest("[data-edit-hotkey]");
        if (!select) {
            return;
        }
        const found = findButton(select.dataset.editHotkey);
        if (!found) {
            return;
        }
        const taken = allMacroButtons().some(
            ({ button }) => button.id !== found.button.id && button.hotkey === select.value && select.value,
        );
        if (taken) {
            showToast("Tasto già usato da un altro pulsante");
            select.value = found.button.hotkey;
            return;
        }
        found.button.hotkey = normalizeHotkey(select.value);
        saveMacros();
        showToast(
            found.button.hotkey
                ? `Keybind salvata: ${found.button.hotkey}`
                : "Keybind rimossa",
        );
        renderMacros();
    });

    macrosAddCategory.addEventListener("submit", (event) => {
        event.preventDefault();
        if (addCategory(macrosCategoryName.value)) {
            macrosCategoryName.value = "";
        }
    });

    macrosAddButton.addEventListener("submit", (event) => {
        event.preventDefault();
        const category = macros.categories.find(
            (entry) => entry.id === macrosButtonCategory.value,
        );
        const label = macrosButtonLabel.value.trim();
        const cmd = macrosButtonCommand.value.trim();
        const hotkey = macrosButtonHotkey.value;
        if (!category || !cmd) {
            showToast("Serve almeno il comando");
            return;
        }
        if (hotkey && allMacroButtons().some(({ button }) => button.hotkey === hotkey)) {
            showToast("Tasto già usato da un altro pulsante");
            return;
        }
        category.buttons.push(normalizeButton({
            label: label || cmd,
            command: cmd,
            hotkey,
            favorite: macrosButtonFavorite.checked,
        }));
        macrosButtonLabel.value = "";
        macrosButtonCommand.value = "";
        macrosButtonHotkey.value = "";
        macrosButtonFavorite.checked = false;
        saveMacros();
        renderMacros();
        showToast("Pulsante aggiunto");
    });

    macrosExportBtn.addEventListener("click", exportMacrosJson);

    macrosImportBtn.addEventListener("click", () => {
        macrosImportFile.value = "";
        macrosImportFile.click();
    });

    macrosImportFile.addEventListener("change", async () => {
        const file = macrosImportFile.files?.[0];
        if (!file) {
            return;
        }
        try {
            const text = await file.text();
            importMacrosJsonText(text);
        } catch (error) {
            console.error("Macro import error", error);
            showToast("Import fallito: file non valido");
        }
    });

    mobileTabs.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-tab]");
        if (!button) {
            return;
        }

        const tab = button.dataset.tab;
        mobileTabs.querySelectorAll("button").forEach((tabButton) => {
            tabButton.classList.toggle("active", tabButton === button);
        });
        document.querySelectorAll(".panel[data-panel]").forEach((panel) => {
            panel.classList.toggle("tab-active", panel.dataset.panel === tab);
        });
    });

    settingsBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = settingsPop.hidden;
        closePopovers();
        settingsPop.hidden = !open;
        settingsBtn.setAttribute("aria-expanded", String(open));
    });

    shortcutsBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = shortcutsPop.hidden;
        closePopovers();
        shortcutsPop.hidden = !open;
    });

    shortcutsClose.addEventListener("click", closePopovers);

    changelogBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        void openChangelog();
    });

    changelogClose.addEventListener("click", closePopovers);

    changelogPop.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    if (adminNoticeClose) {
        adminNoticeClose.addEventListener("click", hideAdminNotice);
    }

    reportBugBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openFeedbackForm("bug");
    });

    reportIdeaBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        openFeedbackForm("miglioria");
    });

    feedbackCancel.addEventListener("click", () => {
        feedbackPop.hidden = true;
    });

    feedbackSend.addEventListener("click", () => {
        void submitFeedback();
    });

    feedbackPop.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    setFont.addEventListener("change", () => {
        settings.fontScale = Number(setFont.value) || 1;
        saveSettings();
        applySettings();
    });

    setHidePrompt.addEventListener("change", () => {
        settings.hidePromptBars = setHidePrompt.checked;
        if (!settings.hidePromptBars && promptHoldBuffer) {
            appendOutput(promptHoldBuffer);
            promptHoldBuffer = "";
        }
        saveSettings();
        showToast(
            settings.hidePromptBars
                ? "Prompt Pf/Mn nascosto in cronaca"
                : "Prompt Pf/Mn visibile in cronaca",
        );
    });

    // Keep the command bar focused on clicks, except when typing in another field.
    document.addEventListener("pointerdown", (event) => {
        if (command.disabled) {
            return;
        }
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        if (isEditableTypingTarget(event.target)) {
            return;
        }
        event.preventDefault();
        focusCommandBar();
    }, true);

    document.addEventListener("click", (event) => {
        if (
            !settingsPop.hidden
            && !settingsPop.contains(event.target)
            && event.target !== settingsBtn
        ) {
            settingsPop.hidden = true;
            settingsBtn.setAttribute("aria-expanded", "false");
        }
        if (
            !shortcutsPop.hidden
            && !shortcutsPop.contains(event.target)
            && event.target !== shortcutsBtn
        ) {
            shortcutsPop.hidden = true;
        }
        if (
            !feedbackPop.hidden
            && !feedbackPop.contains(event.target)
            && event.target !== reportBugBtn
            && event.target !== reportIdeaBtn
        ) {
            feedbackPop.hidden = true;
        }
        if (
            !changelogPop.hidden
            && !changelogPop.contains(event.target)
            && event.target !== changelogBtn
        ) {
            changelogPop.hidden = true;
            changelogBtn.setAttribute("aria-expanded", "false");
        }
        if (
            mapHelpPop
            && !mapHelpPop.hidden
            && !mapHelpPop.contains(event.target)
            && event.target !== minimapHelpBtn
        ) {
            mapHelpPop.hidden = true;
            minimapHelpBtn?.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (mapExpand && !mapExpand.hidden) {
                closeMapExpand();
                return;
            }
            closePopovers();
            if (macrosEditMode) {
                setMacrosEditMode(false);
            }
            return;
        }

        const typingInField = event.target === command
            || event.target.tagName === "INPUT"
            || event.target.tagName === "TEXTAREA"
            || event.target.tagName === "SELECT";

        if ((event.key === "?" || (event.ctrlKey && event.key === "/")) && !event.altKey) {
            if (typingInField && event.key === "?" && command.value !== "") {
                return;
            }
            event.preventDefault();
            const open = shortcutsPop.hidden;
            closePopovers();
            shortcutsPop.hidden = !open;
            return;
        }

        if (event.ctrlKey && !event.altKey && event.key.toLowerCase() === "l") {
            event.preventDefault();
            clearTerminal();
            return;
        }

        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "r") {
            event.preventDefault();
            if (!recordingToggle.disabled) {
                recordingToggle.click();
            }
            return;
        }

        if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === "r") {
            if (!reconnect.hidden && !reconnect.disabled) {
                event.preventDefault();
                reconnect.click();
            }
            return;
        }

        // Macro hotkeys (F1–F12 / Alt+digit) work even while the command field is focused.
        if (!typingInField || event.key.startsWith("F") || event.altKey) {
            if (handleMacroHotkey(event)) {
                return;
            }
        }

        if (
            settings.numpadDirs !== false
            && !event.ctrlKey
            && !event.altKey
            && !event.metaKey
            && NUMPAD_DIRS[event.code]
            && !(typingInField && event.target !== command)
        ) {
            event.preventDefault();
            sendMudCommand(NUMPAD_DIRS[event.code]);
        }
    });

    Promise.all([loadClientConfig(), recorder.initialize(), hydrateMacrosFromServer()])
        .then(() => {
            updateRecordingControls();
            return refreshSessionArchive();
        })
        .catch(showRecordingError)
        .finally(connect);

    function recordingPreference() {
        try {
            return localStorage.getItem(RECORDING_PREFERENCE_KEY) === "true";
        } catch {
            return false;
        }
    }

    function setRecordingPreference(enabled) {
        try {
            localStorage.setItem(RECORDING_PREFERENCE_KEY, String(enabled));
        } catch {
            // Recording still works for this page even if preferences cannot be persisted.
        }
    }

    function updateRecordingControls() {
        recordingToggle.textContent = recorder.active ? "Ferma" : "Registra";
        recordingToggle.setAttribute("aria-pressed", String(recorder.active));
        recordingStatus.textContent = recorder.active ? "REC" : "";
        recordingStatus.dataset.recording = String(recorder.active);
    }

    async function refreshSessionArchive() {
        if (!recorder.available) {
            sessionArchive.hidden = true;
            return;
        }

        const sessions = await recorder.list();
        sessionCount.textContent = String(sessions.length);
        sessionList.replaceChildren(...sessions.map(createSessionListItem));
        sessionArchiveMessage.hidden = sessions.length !== 0;
        sessionArchiveMessage.textContent = sessions.length === 0
            ? "Nessuna sessione salvata."
            : "";
    }

    function createSessionListItem(session) {
        const item = document.createElement("li");
        item.className = "session-list__item";

        const description = document.createElement("div");
        description.className = "session-list__description";
        const title = document.createElement("span");
        title.textContent = new Date(session.startedAt).toLocaleString();
        const metadata = document.createElement("small");
        metadata.className = "session-list__metadata";
        metadata.textContent = `${formatByteCount(session.byteCount)} · ${formatDuration(session)}`;
        description.append(title, metadata);

        const actions = document.createElement("div");
        actions.className = "session-list__actions";
        const download = createSessionButton("Scarica .txt", "download", session.id);
        const remove = createSessionButton("Elimina", "delete", session.id);
        actions.append(download, remove);
        item.append(description, actions);
        return item;
    }

    function createSessionButton(label, action, sessionId) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.dataset.action = action;
        button.dataset.sessionId = sessionId;
        return button;
    }

    function formatByteCount(bytes) {
        if (bytes < 1_024) {
            return `${bytes} B`;
        }
        if (bytes < 1_048_576) {
            return `${(bytes / 1_024).toFixed(1)} KB`;
        }
        return `${(bytes / 1_048_576).toFixed(1)} MB`;
    }

    function formatDuration(session) {
        const end = session.endedAt ?? Date.now();
        const seconds = Math.max(0, Math.round((end - session.startedAt) / 1_000));
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    }

    function showRecordingError(error) {
        console.error("Session recording error", error);
        recordingStatus.textContent = "REC non disponibile";
        recordingStatus.dataset.recording = "false";
        recordingToggle.disabled = true;
    }

    function showArchiveError(error) {
        console.error("Saved session error", error);
        sessionArchiveMessage.textContent = "Operazione sulla sessione non riuscita.";
        sessionArchiveMessage.hidden = false;
        sessionArchive.open = true;
    }

    function stripTerminalSequences(text) {
        return text.replace(
            /\x1b(?:\[[0-?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1b\\)|.)/g,
            "",
        );
    }

    function createSessionRecorder() {
        const DATABASE_NAME = "silmaclient-sessions";
        const DATABASE_VERSION = 1;
        const encoder = new TextEncoder();
        let database = null;
        let currentSession = null;
        let pendingWrite = Promise.resolve();

        return {
            get active() {
                return currentSession !== null;
            },
            get available() {
                return database !== null;
            },
            initialize,
            start,
            append,
            stop,
            list,
            download,
            remove,
        };

        function initialize() {
            if (!("indexedDB" in window)) {
                return Promise.reject(new Error("IndexedDB is not supported"));
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
                request.addEventListener("upgradeneeded", () => {
                    const db = request.result;
                    db.createObjectStore("sessions", { keyPath: "id" });
                    const chunks = db.createObjectStore(
                        "chunks",
                        { keyPath: ["sessionId", "sequence"] },
                    );
                    chunks.createIndex("by-session", "sessionId");
                });
                request.addEventListener("success", () => {
                    database = request.result;
                    finalizeInterruptedSessions().then(resolve, reject);
                });
                request.addEventListener("error", () => reject(request.error));
                request.addEventListener("blocked", () => {
                    reject(new Error("The session database is blocked by another page"));
                });
            });
        }

        async function start() {
            if (currentSession) {
                return;
            }
            requireDatabase();
            const startedAt = Date.now();
            currentSession = {
                id: globalThis.crypto?.randomUUID?.() ?? `${startedAt}-${Math.random()}`,
                startedAt,
                endedAt: null,
                lastUpdatedAt: startedAt,
                byteCount: 0,
                nextSequence: 0,
            };
            await requestResult(
                database.transaction("sessions", "readwrite")
                    .objectStore("sessions")
                    .add({ ...currentSession }),
            );
        }

        function append(text) {
            if (!currentSession || text === "") {
                return Promise.resolve();
            }

            const session = currentSession;
            const chunk = {
                sessionId: session.id,
                sequence: session.nextSequence,
                text,
            };
            session.nextSequence += 1;
            session.byteCount += encoder.encode(text).byteLength;
            session.lastUpdatedAt = Date.now();
            const sessionSnapshot = { ...session };
            pendingWrite = pendingWrite.then(() => {
                const transaction = database.transaction(
                    ["sessions", "chunks"],
                    "readwrite",
                );
                transaction.objectStore("chunks").add(chunk);
                transaction.objectStore("sessions").put(sessionSnapshot);
                return transactionComplete(transaction);
            });
            return pendingWrite;
        }

        async function stop() {
            if (!currentSession) {
                return;
            }

            const session = currentSession;
            currentSession = null;
            await pendingWrite;
            session.endedAt = Date.now();
            session.lastUpdatedAt = session.endedAt;
            await requestResult(
                database.transaction("sessions", "readwrite")
                    .objectStore("sessions")
                    .put({ ...session }),
            );
        }

        async function list() {
            requireDatabase();
            const sessions = await requestResult(
                database.transaction("sessions")
                    .objectStore("sessions")
                    .getAll(),
            );
            return sessions.sort((left, right) => right.startedAt - left.startedAt);
        }

        async function finalizeInterruptedSessions() {
            const transaction = database.transaction("sessions", "readwrite");
            const store = transaction.objectStore("sessions");
            const cursorRequest = store.openCursor();
            cursorRequest.addEventListener("success", () => {
                const cursor = cursorRequest.result;
                if (!cursor) {
                    return;
                }
                if (cursor.value.endedAt === null) {
                    cursor.update({
                        ...cursor.value,
                        endedAt: cursor.value.lastUpdatedAt ?? cursor.value.startedAt,
                    });
                }
                cursor.continue();
            });
            await transactionComplete(transaction);
        }

        async function download(sessionId) {
            requireDatabase();
            const transaction = database.transaction(["sessions", "chunks"]);
            const sessionRequest = transaction.objectStore("sessions").get(sessionId);
            const chunksRequest = transaction
                .objectStore("chunks")
                .index("by-session")
                .getAll(sessionId);
            const [session, chunks] = await Promise.all([
                requestResult(sessionRequest),
                requestResult(chunksRequest),
            ]);
            if (!session) {
                throw new Error("Saved session not found");
            }

            chunks.sort((left, right) => left.sequence - right.sequence);
            const plainText = stripTerminalSequences(
                chunks.map((chunk) => chunk.text).join(""),
            );
            const blobUrl = URL.createObjectURL(new Blob([plainText], {
                type: "text/plain;charset=utf-8",
            }));
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `mud-session-${filenameTimestamp(session.startedAt)}.txt`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
        }

        async function remove(sessionId) {
            requireDatabase();
            if (currentSession?.id === sessionId) {
                throw new Error("The active recording cannot be deleted");
            }

            const transaction = database.transaction(["sessions", "chunks"], "readwrite");
            transaction.objectStore("sessions").delete(sessionId);
            const index = transaction.objectStore("chunks").index("by-session");
            const cursorRequest = index.openKeyCursor(IDBKeyRange.only(sessionId));
            cursorRequest.addEventListener("success", () => {
                const cursor = cursorRequest.result;
                if (cursor) {
                    transaction.objectStore("chunks").delete(cursor.primaryKey);
                    cursor.continue();
                }
            });
            await transactionComplete(transaction);
        }

        function requireDatabase() {
            if (!database) {
                throw new Error("The session database is unavailable");
            }
        }

        function filenameTimestamp(timestamp) {
            return new Date(timestamp).toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
        }

        function requestResult(request) {
            return new Promise((resolve, reject) => {
                request.addEventListener("success", () => resolve(request.result));
                request.addEventListener("error", () => reject(request.error));
            });
        }

        function transactionComplete(transaction) {
            return new Promise((resolve, reject) => {
                transaction.addEventListener("complete", resolve);
                transaction.addEventListener("abort", () => reject(transaction.error));
                transaction.addEventListener("error", () => reject(transaction.error));
            });
        }
    }

    function createAnsiRenderer(container) {
        const defaultState = () => ({
            foreground: null,
            background: null,
            bold: false,
            dim: false,
            italic: false,
            underline: false,
            blink: false,
            inverse: false,
            hidden: false,
            strike: false,
        });
        let state = defaultState();
        let pendingSequence = "";

        function write(input) {
            const text = pendingSequence + input;
            pendingSequence = "";
            let textStart = 0;
            let position = 0;
            const fragment = document.createDocumentFragment();

            while (position < text.length) {
                if (text.charCodeAt(position) !== 0x1b) {
                    position += 1;
                    continue;
                }

                appendStyledText(fragment, text.slice(textStart, position));
                const sequence = readEscapeSequence(text, position);
                if (!sequence.complete) {
                    pendingSequence = text.slice(position);
                    if (fragment.childNodes.length > 0) {
                        container.append(fragment);
                    }
                    return;
                }

                if (sequence.kind === "csi" && sequence.finalByte === "m") {
                    applySgr(sequence.parameters);
                }

                position = sequence.end;
                textStart = position;
            }

            appendStyledText(fragment, text.slice(textStart));
            if (fragment.childNodes.length > 0) {
                container.append(fragment);
            }
        }

        function appendStyledText(target, text) {
            if (!text) {
                return;
            }

            const span = document.createElement("span");
            span.append(document.createTextNode(text));
            applyTextStyle(span);
            target.append(span);
        }

        function applyTextStyle(span) {
            let foreground = state.foreground;
            let background = state.background;

            if (state.bold && foreground?.type === "palette" && foreground.value < 8) {
                foreground = { type: "palette", value: foreground.value + 8 };
            }
            if (state.inverse) {
                [foreground, background] = [background, foreground];
                foreground ??= { type: "css", value: "var(--mud-background)" };
                background ??= { type: "css", value: "var(--mud-foreground)" };
            }

            if (foreground) {
                span.style.color = colorValue(foreground);
            }
            if (background) {
                span.style.backgroundColor = colorValue(background);
            }
            if (state.bold) {
                span.style.fontWeight = "700";
            }
            if (state.dim) {
                span.style.opacity = "0.7";
            }
            if (state.italic) {
                span.style.fontStyle = "italic";
            }

            const decorations = [];
            if (state.underline) {
                decorations.push("underline");
            }
            if (state.blink) {
                span.classList.add("ansi-blink");
            }
            if (state.strike) {
                decorations.push("line-through");
            }
            if (decorations.length > 0) {
                span.style.textDecoration = decorations.join(" ");
            }
            if (state.hidden) {
                span.style.visibility = "hidden";
            }
        }

        function applySgr(parameterText) {
            const parameters = parameterText === ""
                ? [0]
                : parameterText.split(";").map((value) => value === "" ? 0 : Number(value));

            for (let index = 0; index < parameters.length; index += 1) {
                const code = parameters[index];

                if (code === 0) {
                    state = defaultState();
                } else if (code === 1) {
                    state.bold = true;
                } else if (code === 2) {
                    state.dim = true;
                } else if (code === 3) {
                    state.italic = true;
                } else if (code === 4) {
                    state.underline = true;
                } else if (code === 5 || code === 6) {
                    state.blink = true;
                } else if (code === 7) {
                    state.inverse = true;
                } else if (code === 8) {
                    state.hidden = true;
                } else if (code === 9) {
                    state.strike = true;
                } else if (code === 22) {
                    state.bold = false;
                    state.dim = false;
                } else if (code === 23) {
                    state.italic = false;
                } else if (code === 24) {
                    state.underline = false;
                } else if (code === 25) {
                    state.blink = false;
                } else if (code === 27) {
                    state.inverse = false;
                } else if (code === 28) {
                    state.hidden = false;
                } else if (code === 29) {
                    state.strike = false;
                } else if (code >= 30 && code <= 37) {
                    state.foreground = paletteColor(code - 30);
                } else if (code === 38) {
                    const extended = readExtendedColor(parameters, index);
                    if (extended) {
                        state.foreground = extended.color;
                        index = extended.end;
                    }
                } else if (code === 39) {
                    state.foreground = null;
                } else if (code >= 40 && code <= 47) {
                    state.background = paletteColor(code - 40);
                } else if (code === 48) {
                    const extended = readExtendedColor(parameters, index);
                    if (extended) {
                        state.background = extended.color;
                        index = extended.end;
                    }
                } else if (code === 49) {
                    state.background = null;
                } else if (code >= 90 && code <= 97) {
                    state.foreground = paletteColor(code - 90 + 8);
                } else if (code >= 100 && code <= 107) {
                    state.background = paletteColor(code - 100 + 8);
                }
            }
        }

        function reset() {
            state = defaultState();
            pendingSequence = "";
        }

        return { write, reset };
    }

    function readEscapeSequence(text, start) {
        if (start + 1 >= text.length) {
            return { complete: false };
        }

        if (text[start + 1] === "[") {
            for (let position = start + 2; position < text.length; position += 1) {
                const code = text.charCodeAt(position);
                if (code >= 0x40 && code <= 0x7e) {
                    return {
                        complete: true,
                        kind: "csi",
                        parameters: text.slice(start + 2, position),
                        finalByte: text[position],
                        end: position + 1,
                    };
                }
            }
            return { complete: false };
        }

        if (text[start + 1] === "]") {
            for (let position = start + 2; position < text.length; position += 1) {
                if (text.charCodeAt(position) === 0x07) {
                    return { complete: true, kind: "osc", end: position + 1 };
                }
                if (
                    text.charCodeAt(position) === 0x1b
                    && text[position + 1] === "\\"
                ) {
                    return { complete: true, kind: "osc", end: position + 2 };
                }
            }
            return { complete: false };
        }

        return { complete: true, kind: "escape", end: start + 2 };
    }

    function readExtendedColor(parameters, start) {
        if (parameters[start + 1] === 5 && Number.isInteger(parameters[start + 2])) {
            return {
                color: paletteColor(clamp(parameters[start + 2], 0, 255)),
                end: start + 2,
            };
        }

        if (
            parameters[start + 1] === 2
            && Number.isInteger(parameters[start + 2])
            && Number.isInteger(parameters[start + 3])
            && Number.isInteger(parameters[start + 4])
        ) {
            return {
                color: {
                    type: "rgb",
                    value: parameters
                        .slice(start + 2, start + 5)
                        .map((component) => clamp(component, 0, 255)),
                },
                end: start + 4,
            };
        }

        return null;
    }

    function paletteColor(index) {
        return { type: "palette", value: index };
    }

    function colorValue(color) {
        if (color.type === "css") {
            return color.value;
        }
        if (color.type === "rgb") {
            return `rgb(${color.value.join(" ")})`;
        }
        if (color.value < 16) {
            return `var(--ansi-color-${color.value})`;
        }
        if (color.value < 232) {
            const offset = color.value - 16;
            const red = Math.floor(offset / 36);
            const green = Math.floor((offset % 36) / 6);
            const blue = offset % 6;
            return `rgb(${cubeComponent(red)} ${cubeComponent(green)} ${cubeComponent(blue)})`;
        }

        const gray = 8 + ((color.value - 232) * 10);
        return `rgb(${gray} ${gray} ${gray})`;
    }

    function cubeComponent(value) {
        return value === 0 ? 0 : 55 + (value * 40);
    }

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }
})();
