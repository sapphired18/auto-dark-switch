import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class AutoDarkSwitch extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._iface = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
        this._lastScheduled = null;

        // Keep gtk-theme in sync with color-scheme, whoever changes it
        // (GNOME's Dark Style toggle, the schedule, Settings app, ...).
        this._ifaceId = this._iface.connect('changed::color-scheme', () => this._syncGtkTheme());
        this._settingsId = this._settings.connect('changed', () => this._syncGtkTheme());
        this._syncGtkTheme();

        // Apply the schedule on enable (e.g. at login), then check every 30 s.
        this._tick();
        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
            this._tick();
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        if (this._ifaceId) {
            this._iface.disconnect(this._ifaceId);
            this._ifaceId = null;
        }
        if (this._settingsId) {
            this._settings.disconnect(this._settingsId);
            this._settingsId = null;
        }
        this._iface = null;
        this._settings = null;
    }

    _isDarkNow() {
        const light = this._settings.get_int('light-hour');
        const dark = this._settings.get_int('dark-hour');
        const h = GLib.DateTime.new_now_local().get_hour();
        if (light === dark)
            return false;
        const isLight = light < dark
            ? (h >= light && h < dark)
            : (h >= light || h < dark);
        return !isLight;
    }

    _tick() {
        if (!this._settings.get_boolean('auto-enabled'))
            return;
        const dark = this._isDarkNow();
        // Only act when the schedule flips, so a manual change via GNOME's
        // toggle sticks until the next light/dark boundary.
        if (this._lastScheduled === dark)
            return;
        this._lastScheduled = dark;
        this._iface.set_string('color-scheme', dark ? 'prefer-dark' : 'default');
        // gtk-theme follows via the changed::color-scheme handler.
    }

    _syncGtkTheme() {
        if (!this._iface)
            return;
        const dark = this._iface.get_string('color-scheme') === 'prefer-dark';
        const theme = this._settings.get_string(dark ? 'dark-gtk-theme' : 'light-gtk-theme');
        if (this._iface.get_string('gtk-theme') !== theme)
            this._iface.set_string('gtk-theme', theme);
    }
}
