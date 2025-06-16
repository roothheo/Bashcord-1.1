/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
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
        // Patch spécifique pour ligne 89 : label header
        {
            find: "section: SectionTypes.HEADER,",
            replacement: {
                match: /section:\s*SectionTypes\.HEADER,\s*label:\s*"Bashcord",/,
                replace: "section: SectionTypes.HEADER, label: $self.getCustomName(),"
            }
        },
        // Patch spécifique pour ligne 94 : label EquicordSettings
        {
            find: "section: \"EquicordSettings\",",
            replacement: {
                match: /section:\s*"EquicordSettings",\s*label:\s*"Bashcord",/,
                replace: "section: \"EquicordSettings\", label: $self.getCustomName(),"
            }
        },
        // Patch spécifique pour ligne 95 : searchableTitles
        {
            find: "searchableTitles: [\"Bashcord\", \"Settings\", \"Bashcord Settings\"]",
            replacement: {
                match: /searchableTitles:\s*\["Bashcord",\s*"Settings",\s*"Bashcord Settings"\]/,
                replace: "searchableTitles: [$self.getCustomNameQuoted(), \"Settings\", $self.getCustomName() + \" Settings\"]"
            }
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
