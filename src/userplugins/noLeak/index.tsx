/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    customName: {
        type: OptionType.STRING,
        description: "Nom personnalisé à afficher au lieu de 'Bashcord'",
        default: "Discord",
        placeholder: "Entrez votre nom personnalisé"
    },
    enabled: {
        type: OptionType.BOOLEAN,
        description: "Activer le masquage du nom Bashcord",
        default: true
    },
    hideFromAbout: {
        type: OptionType.BOOLEAN,
        description: "Masquer aussi dans les informations système",
        default: true
    }
});

export default definePlugin({
    name: "noLeak",
    description: "Masque les références à 'Bashcord' et les remplace par un nom personnalisé",
    authors: [{
        name: "Bash",
        id: 1327483363518582784n
    }],
    settings,

    patches: [
        // Patch pour les labels dans les paramètres
        {
            find: "Bashcord",
            replacement: [
                {
                    match: /label:\s*"Bashcord"/g,
                    replace: `label: $self.getCustomName()`
                },
                {
                    match: /section:\s*(.{0,20}),\s*label:\s*"Bashcord"/g,
                    replace: `section: $1, label: $self.getCustomName()`
                }
            ]
        },
        // Patch pour les headers
        {
            find: "className: \"vc-settings-header\"",
            replacement: {
                match: /label:\s*"Bashcord",\s*className:\s*"vc-settings-header"/,
                replace: `label: $self.getCustomName(), className: "vc-settings-header"`
            }
        },
        // Patch pour les informations de version
        {
            find: "gitHash",
            replacement: [
                {
                    match: /`Bashcord \${gitHash}\${additionalInfo}`/,
                    replace: "`${$self.getCustomName()} ${gitHash}${additionalInfo}`"
                },
                {
                    match: /rows = \[\`Bashcord/,
                    replace: "rows = [`${$self.getCustomName()}"
                }
            ]
        },
        // Patch pour les searchable titles
        {
            find: "searchableTitles:",
            replacement: [
                {
                    match: /searchableTitles:\s*\["Bashcord",\s*"Settings",\s*"Bashcord Settings"\]/,
                    replace: `searchableTitles: [$self.getCustomNameArray(), "Settings", $self.getCustomName() + " Settings"]`
                }
            ]
        }
    ],

    start() {
        // Optionnel : log au démarrage
        console.log(`[noLeak] Plugin démarré - Bashcord masqué par: ${this.getCustomName()}`);
    },

    stop() {
        console.log("[noLeak] Plugin arrêté");
    },

    getCustomName(): string {
        if (!settings.store.enabled) return "Bashcord";
        return settings.store.customName || "Discord";
    },

    getCustomNameArray(): string {
        return `"${this.getCustomName()}"`;
    },

    // Méthode pour obtenir le nom personnalisé avec guillemets pour les arrays
    getCustomNameQuoted(): string {
        return `"${this.getCustomName()}"`;
    }
}); 