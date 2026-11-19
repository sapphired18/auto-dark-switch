import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class AutoDarkPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();

        const group = new Adw.PreferencesGroup({
            title: 'Schedule',
            description: 'Switch GNOME dark style automatically at fixed hours.',
        });
        page.add(group);

        const auto = new Adw.SwitchRow({title: 'Switch automatically by time'});
        settings.bind('auto-enabled', auto, 'active', Gio.SettingsBindFlags.DEFAULT);
        group.add(auto);

        const spin = (title, key) => {
            const row = new Adw.SpinRow({
                title,
                adjustment: new Gtk.Adjustment({lower: 0, upper: 23, step_increment: 1}),
            });
            settings.bind(key, row, 'value', Gio.SettingsBindFlags.DEFAULT);
            return row;
        };
        group.add(spin('Light mode starts at (hour)', 'light-hour'));
        group.add(spin('Dark mode starts at (hour)', 'dark-hour'));

        const themes = new Adw.PreferencesGroup({
            title: 'GTK theme',
            description: 'Applied to gtk-theme whenever dark style changes.',
        });
        page.add(themes);
        const entry = (title, key) => {
            const row = new Adw.EntryRow({title});
            settings.bind(key, row, 'text', Gio.SettingsBindFlags.DEFAULT);
            return row;
        };
        themes.add(entry('Theme in light mode', 'light-gtk-theme'));
        themes.add(entry('Theme in dark mode', 'dark-gtk-theme'));

        window.add(page);
    }
}
