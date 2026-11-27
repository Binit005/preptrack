# PrepTrack

PrepTrack is a free, offline-first study-session and mock-test tracker. It runs in a modern browser and stores records locally on the device.

## Features

- Log study sessions by subject, date, duration and notes.
- Record mock tests, correct/wrong answers and optional score.
- View study totals and average mock accuracy.
- Export a JSON backup and import it later.
- Download study-session and mock-test CSV files.
- Delete individual records.
- No account, server, analytics or third-party runtime dependencies.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Start adding sessions and mock tests.

For a local development server, run `python -m http.server 8000` from the project directory and open `http://localhost:8000`.

## Privacy and data

Records are stored in the browser's `localStorage`. They are not automatically uploaded anywhere. Clearing browser data can erase records, so use **Export backup** regularly. Do not import a backup from an untrusted source.

## Project status

This is an initial community release. It has not yet been independently audited or tested across every browser/device combination. Please report reproducible bugs with browser and operating-system details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports, accessibility improvements, documentation and translations are welcome.

## Licence

MIT. See [LICENSE](LICENSE).
