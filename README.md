# Auto Dark Switch

A small GNOME Shell extension that keeps `gtk-theme` in sync with GNOME's dark style, with an optional light/dark schedule.

GNOME already has a Dark Style toggle, and libadwaita (GTK4) apps follow it. Legacy GTK3 apps, including GTK3 Flatpak apps, do not: they follow the `gtk-theme` name instead. With a theme like [adw-gtk3](https://github.com/lassekongo83/adw-gtk3) that means switching between `adw-gtk3` and `adw-gtk3-dark` by hand. This extension does that for you.

## Features

- **Follows GNOME's dark style.** Whenever `color-scheme` changes (the Quick Settings toggle, the Settings app, a schedule, anything else), `gtk-theme` is updated to match.
- **Optional schedule.** Switch to light mode and dark mode at hours you choose (default: light from 06:00, dark from 18:00). A manual change via GNOME's toggle holds until the next scheduled boundary.
- **Configurable theme names.** Defaults are `adw-gtk3` (light) and `adw-gtk3-dark` (dark), but any installed GTK theme pair works.
- **No UI clutter.** No panel icon and no extra Quick Settings toggle. Only a preferences window.
- **No subprocesses.** Everything goes through `Gio.Settings`, so the extension never spawns external commands.

## Requirements

- GNOME Shell **51**
- A GTK3 theme with light and dark variants, for example `adw-gtk3`
- For **Flatpak** apps: the matching Flatpak theme extensions

  ```bash
  flatpak install flathub org.gtk.Gtk3theme.adw-gtk3 org.gtk.Gtk3theme.adw-gtk3-dark
  ```

  Flatpak picks the theme extension that matches the host `gtk-theme`, so no `GTK_THEME` override is needed.

## Installation

### From a release zip

```bash
gnome-extensions install --force auto-dark-switch@local.zip
```

Then **log out and log in again**. On Wayland, GNOME Shell only discovers new extensions at session start. After that:

```bash
gnome-extensions enable auto-dark-switch@local
```

### From source

```bash
git clone https://github.com/<your-username>/auto-dark-switch.git
cd auto-dark-switch
glib-compile-schemas schemas
mkdir -p ~/.local/share/gnome-shell/extensions/auto-dark-switch@local
cp -r extension.js prefs.js metadata.json schemas ~/.local/share/gnome-shell/extensions/auto-dark-switch@local/
```

Log out and in, then enable it as above.

## Configuration

```bash
gnome-extensions prefs auto-dark-switch@local
```

| Setting | Default | Description |
|---|---|---|
| Switch automatically by time | on | Enables the schedule |
| Light mode starts at (hour) | 6 | Hour (0–23) when light mode begins |
| Dark mode starts at (hour) | 18 | Hour (0–23) when dark mode begins |
| Theme in light mode | `adw-gtk3` | Value written to `gtk-theme` in light mode |
| Theme in dark mode | `adw-gtk3-dark` | Value written to `gtk-theme` in dark mode |

To use only the `gtk-theme` sync and skip the schedule, turn off **Switch automatically by time**.

You can also change settings from the command line:

```bash
gsettings --schemadir ~/.local/share/gnome-shell/extensions/auto-dark-switch@local/schemas \
  set org.gnome.shell.extensions.auto-dark-switch light-hour 7
```

## How it works

1. On enable, and whenever `org.gnome.desktop.interface color-scheme` changes, the extension sets `org.gnome.desktop.interface gtk-theme` to the configured light or dark theme.
2. If the schedule is on, a 30-second timer checks the time. When the schedule crosses a boundary, it sets `color-scheme` to `prefer-dark` or `default`, and step 1 updates `gtk-theme`.

Apps that are already running keep their current theme. GTK3 apps pick up the change the next time they are started. libadwaita/GTK4 apps update immediately.

## Troubleshooting

**`Extension "auto-dark-switch@local" does not exist`**
GNOME Shell has not scanned the extension yet. Log out and back in, then enable it.

**GTK3 Flatpak app title bar stays light**
Make sure the Flatpak theme extensions are installed (see Requirements), restart the app fully (`flatpak kill <app-id>`), and check that `~/.config/gtk-3.0/settings.ini` does not force `gtk-theme-name` or `gtk-application-prefer-dark-theme` to a fixed value.

**Other theme-switching extensions**
Disable them, or they will overwrite `gtk-theme` and `color-scheme`.

**Extension shows an error**

```bash
gnome-extensions info auto-dark-switch@local
journalctl --user -b | grep -i auto-dark-switch | tail -20
```

## Uninstall

```bash
gnome-extensions disable auto-dark-switch@local
rm -rf ~/.local/share/gnome-shell/extensions/auto-dark-switch@local
```

## Development

Build a zip for installation:

```bash
glib-compile-schemas schemas
zip -r auto-dark-switch@local.zip extension.js prefs.js metadata.json schemas
```

Layout:

```
extension.js   # logic: sync gtk-theme with color-scheme, optional schedule
prefs.js       # preferences window (libadwaita)
metadata.json  # extension metadata (shell-version: 51)
schemas/       # GSettings schema
```

## Credits

Written in collaboration with [Claude](https://www.anthropic.com/claude) (Anthropic), which also helped track down the GNOME Shell crashes that motivated this extension: a `GSubprocess` assertion (`gsubprocess.c:279`) triggered by another theme-switching extension.

To credit a contributor on GitHub, add a trailer to the commit message:

```
Co-authored-by: Claude <noreply@anthropic.com>
```

## License

Add a license of your choice (for example MIT or GPL-2.0-or-later) and update this section. GNOME Shell extensions are commonly released under GPL-2.0-or-later.
