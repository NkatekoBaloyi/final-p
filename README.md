# Adventure Escape South Africa

A six-page escape-room booking website built with HTML, CSS and JavaScript. The layout follows the Figma wireframes for desktop and is responsive for mobile.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: hero, featured rooms, how it works, testimonials, FAQ |
| `rooms.html` | All escape rooms with category filter |
| `room-detail.html` | The Lost Temple: story, what to expect, rules, booking card |
| `booking.html` | Room, date and time selection with live booking summary |
| `about.html` | Our story, numbers and team |
| `contact.html` | Contact form, details, opening hours and map |

## Project structure

```
project/
├── index.html
├── rooms.html
├── room-detail.html
├── booking.html
├── about.html
├── contact.html
├── styles.css      shared styles for every page
├── script.js       shared behaviour for every page
├── images/         logo, room photos, team and map images
└── README.md
```

## Setup

1. Keep all files in one folder, with the images in an `images/` subfolder.
2. Make sure every HTML page has these two lines inside `<head>`:
   ```html
   <link rel="stylesheet" href="styles.css">
   <script src="script.js" defer></script>
   ```
3. Use relative image paths such as `images/lost-temple.jpg`. Paths that start with `C:\` only work on your own computer and will break once published.
4. Open `index.html` in a browser to run the site locally. No build step or install is needed.

## Features

- **Drop-down menu:** the "Rooms" link opens a list of all six rooms. On mobile the navigation collapses behind a menu button.
- **Tables:** the clickable booking calendar and the opening-hours table.
- **Booking form:**
  - Live summary of room, date, time, players and total price.
  - Player limits per room, for example Haunted Mansion 4 to 8 players.
  - Promo codes: `ESCAPE10` (10% off) and `TEAM15` (15% off).
  - Confirmation message on a successful booking.
- **Error handling:**
  - Contact form validates name, email format and message length.
  - Booking form requires a date and a time slot.
  - Invalid promo codes and out-of-range player counts show clear messages.
  - Broken images fall back to a dark green placeholder.
- **Rooms page:** category pills (Horror, Mystery, Adventure, Sci-Fi) filter the room cards.
- **FAQ:** accordion questions.
- **Accessibility:** visible keyboard focus, labelled form fields, error messages announced to screen readers, and reduced-motion support.

## Design

- **Colours:** forest green `#2d4d3d`, cream `#faf8f2`, sage `#eef0e6`.
- **Fonts:** Playfair Display for headings and Inter for body text, loaded from Google Fonts.
- **Breakpoint:** the layout switches to a single column at 860px wide.

## Known limitations

- The calendar is a static March 2026 view, matching the Figma design. Update it if you want live dates.
- The forms do not send data anywhere yet. Connect them to a backend or a form service such as Formspree to receive real bookings and messages.
- Prices and player limits are stored in `script.js` (the `ROOMS` object). Change them there to update the booking summary.
- Contact page opening hours should be checked against the Figma (weekdays 08:00 to 18:00, weekends 09:00 to 16:00).

## Publishing

The site is plain static files, so it can be hosted for free:

- **GitHub Pages:** push the folder to a repository, then enable Pages in the repository settings.
- **Netlify:** drag and drop the project folder onto the Netlify dashboard.

After publishing, open every page on the live link and check that images, the menu and both forms work.

## Credits

Built for the Phase 1 group web development project. Wireframes designed in Figma. Escape-room names, prices and testimonial text are illustrative.
