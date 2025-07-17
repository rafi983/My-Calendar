# Calendar App

A modern, interactive calendar web application built with Next.js and Tailwind CSS. This app allows users to view, create, edit, and delete events in a weekly calendar view, with a clean and responsive UI.

## Features

- **Weekly Calendar View:** See your week at a glance, with time slots and days clearly displayed.
- **Event Management:**
  - Add new events by clicking on a day in the mini calendar or the main view.
  - Edit or delete existing events directly from the calendar.
  - Event details include title, description, time, date, color, location, attendees, and organizer.
- **Persistent Storage:** Events are saved in your browser's localStorage, so your data stays even after a refresh.
- **Responsive Design:** Works well on both desktop and mobile devices.
- **Mini Calendar Sidebar:** Quickly navigate to any day of the week.
- **Theming:** Uses Tailwind CSS for a modern, accessible look.
- **AI Productivity Popup:** A playful popup suggests music for focus if your day is light on meetings.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/rafi983/My-Calendar
   cd My-Calendar
   ```
2. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```
3. **Run the development server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Project Structure

- `app/`
  - `page.tsx`: Main calendar page and logic.
  - `globals.css`: Global styles (Tailwind CSS).
  - `layout.tsx`, `loading.tsx`: App shell and loading UI.
- `public/`: Static assets (images, logos, etc).
- `tailwind.config.js`, `postcss.config.mjs`: Tailwind and PostCSS configuration.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project metadata and scripts.

## Customization

- **Event Colors:** You can pick a color for each event.
- **Attendees:** Add multiple attendees by separating emails with commas.
- **Organizer:** Specify the event organizer.

## Known Issues / Limitations

- Events are only stored locally (in your browser). There is no backend or cloud sync.
- No authentication or user accounts.
- Only a weekly view is implemented (no full month/year view).

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- Unsplash for demo background images

---

*Made with ❤️ for productivity lovers.*
