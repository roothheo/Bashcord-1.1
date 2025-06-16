/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { onceDefined } from "@shared/onceDefined";
import electron, { app, BrowserWindowConstructorOptions, Menu } from "electron";
import { dirname, join } from "path";

import { initIpc } from "./ipcMain";
import { RendererSettings } from "./settings";
import { IS_VANILLA } from "./utils/constants";

console.log("[Equicord] Starting up...");

// Our injector file at app/index.js
const injectorPath = require.main!.filename;

// The original app.asar
const asarPath = join(dirname(injectorPath), "..", "_app.asar");

const discordPkg = require(join(asarPath, "package.json"));
require.main!.filename = join(asarPath, discordPkg.main);
if (IS_VESKTOP || IS_EQUIBOP) require.main!.filename = join(dirname(injectorPath), "..", "..", "package.json");

// @ts-ignore Untyped method? Dies from cringe
app.setAppPath(asarPath);

if (!IS_VANILLA) {
    const settings = RendererSettings.store;
    // Repatch after host updates on Windows
    if (process.platform === "win32") {
        require("./patchWin32Updater");

        if (settings.winCtrlQ) {
            const originalBuild = Menu.buildFromTemplate;
            Menu.buildFromTemplate = function (template) {
                if (template[0]?.label === "&File") {
                    const { submenu } = template[0];
                    if (Array.isArray(submenu)) {
                        submenu.push({
                            label: "Quit (Hidden)",
                            visible: false,
                            acceleratorWorksWhenHidden: true,
                            accelerator: "Control+Q",
                            click: () => app.quit()
                        });
                    }
                }
                return originalBuild.call(this, template);
            };
        }
    }

    class BrowserWindow extends electron.BrowserWindow {
        constructor(options: BrowserWindowConstructorOptions) {
            if (options?.webPreferences?.preload && options.title) {
                const original = options.webPreferences.preload;
                options.webPreferences.preload = join(__dirname, "preload.js");
                options.webPreferences.sandbox = false;
                // work around discord unloading when in background
                options.webPreferences.backgroundThrottling = false;

                if (settings.frameless) {
                    options.frame = false;
                } else if (process.platform === "win32" && settings.winNativeTitleBar) {
                    delete options.frame;
                }

                if (settings.transparent) {
                    options.transparent = true;
                    options.backgroundColor = "#00000000";
                }

                if (settings.disableMinSize) {
                    options.minWidth = 0;
                    options.minHeight = 0;
                }

                const needsVibrancy = process.platform === "darwin" && settings.macosVibrancyStyle;

                if (needsVibrancy) {
                    options.backgroundColor = "#00000000";
                    if (settings.macosVibrancyStyle) {
                        options.vibrancy = settings.macosVibrancyStyle;
                    }
                }

                process.env.DISCORD_PRELOAD = original;

                super(options);

                if (settings.disableMinSize) {
                    // Disable the Electron call entirely so that Discord can't dynamically change the size
                    this.setMinimumSize = (width: number, height: number) => { };
                }

                initIpc(this);
            } else super(options);
        }
    }
    Object.assign(BrowserWindow, electron.BrowserWindow);
    // esbuild may rename our BrowserWindow, which leads to it being excluded
    // from getFocusedWindow(), so this is necessary
    // https://github.com/discord/electron/blob/13-x-y/lib/browser/api/browser-window.ts#L60-L62
    Object.defineProperty(BrowserWindow, "name", { value: "BrowserWindow", configurable: true });

    // Replace electrons exports with our custom BrowserWindow
    const electronPath = require.resolve("electron");
    delete require.cache[electronPath]!.exports;
    require.cache[electronPath]!.exports = {
        ...electron,
        BrowserWindow
    };

    // Patch appSettings to force enable devtools
    onceDefined(global, "appSettings", s => {
        s.set("DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING", true);
    });

    process.env.DATA_DIR = join(app.getPath("userData"), "..", "Equicord");

    // Fix for net::ERR_QUIC_PROTOCOL_ERROR - Add these flags very early and aggressively
    console.log("[Equicord] Applying aggressive QUIC protocol fixes...");
    app.commandLine.appendSwitch("disable-quic");
    app.commandLine.appendSwitch("disable-http2");
    app.commandLine.appendSwitch("disable-http3");
    app.commandLine.appendSwitch("disable-web-security");
    app.commandLine.appendSwitch("disable-features", "QuicTransport,HTTP3Transport,VizDisplayCompositor");
    app.commandLine.appendSwitch("enable-features", "NetworkService,NetworkServiceLogging");
    app.commandLine.appendSwitch("force-renderer-accessibility");
    app.commandLine.appendSwitch("disable-dev-shm-usage");
    app.commandLine.appendSwitch("no-sandbox");
    app.commandLine.appendSwitch("disable-software-rasterizer");
    app.commandLine.appendSwitch("disable-background-networking");
    app.commandLine.appendSwitch("disable-default-apps");
    app.commandLine.appendSwitch("force-fieldtrials", "WebRTC-DataChannel-Dcsctp/Enabled/");
    app.commandLine.appendSwitch("use-gl", "desktop");

    // Monkey patch commandLine to:
    // - disable WidgetLayering: Fix DevTools context menus https://github.com/electron/electron/issues/38790
    // - disable UseEcoQoSForBackgroundProcess: Work around Discord unloading when in background
    // - disable VizDisplayCompositor: Fix QUIC protocol errors
    // - disable all QUIC/HTTP3 related features aggressively
    const originalAppend = app.commandLine.appendSwitch;
    app.commandLine.appendSwitch = function (...args) {
        // Block any attempts to enable QUIC
        if (args[0] === "enable-quic" || args[0] === "enable-http3") {
            console.log("[Equicord] Blocked attempt to enable:", args[0]);
            return;
        }

        if (args[0] === "disable-features") {
            const disabledFeatures = new Set((args[1] ?? "").split(","));
            disabledFeatures.add("WidgetLayering");
            disabledFeatures.add("UseEcoQoSForBackgroundProcess");
            disabledFeatures.add("VizDisplayCompositor");
            disabledFeatures.add("QuicTransport");
            disabledFeatures.add("HTTP3Transport");
            disabledFeatures.add("QuicUdpProxyConnectHelper");
            disabledFeatures.add("WebSocketStream");
            disabledFeatures.add("NetworkServiceInProcess");
            args[1] = [...disabledFeatures].join(",");
        }

        if (args[0] === "enable-features") {
            // Ensure NetworkService is always enabled but remove any QUIC features
            const enabledFeatures = new Set((args[1] ?? "").split(","));
            enabledFeatures.delete("QuicTransport");
            enabledFeatures.delete("HTTP3Transport");
            enabledFeatures.add("NetworkService");
            enabledFeatures.add("NetworkServiceLogging");
            args[1] = [...enabledFeatures].join(",");
        }

        return originalAppend.apply(this, args);
    };

    // disable renderer backgrounding to prevent the app from unloading when in the background
    // https://github.com/electron/electron/issues/2822
    // https://github.com/GoogleChrome/chrome-launcher/blob/5a27dd574d47a75fec0fb50f7b774ebf8a9791ba/docs/chrome-flags-for-tools.md#task-throttling
    // Work around discord unloading when in background
    // Discord also recently started adding these flags but only on windows for some reason dunno why, it happens on Linux too
    app.commandLine.appendSwitch("disable-renderer-backgrounding");
    app.commandLine.appendSwitch("disable-background-timer-throttling");
    app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
} else {
    console.log("[Equicord] Running in vanilla mode. Not loading Equicord");
}

console.log("[Equicord] Loading original Discord app.asar");
require(require.main!.filename);
