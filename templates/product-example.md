# Product spec: example

A filled-in [product spec](./product.md). It continues the
[idea note example](../../day-2/templates/idea-example.md) from day 2: same
headings, with data, technical choices and out of scope added. The feature
files it links to are not in this example.

---

# Weekweather

Plan your outdoor week. Weekweather shows the weather for the next seven days
in the cities you care about. It is for people who plan a bike ride, a
football match or a day at the beach and want to see which day is dry.

## Core action

Pick a city and see which days are dry.

## Features

1. [Search a city](./features/search-city.md): type a name, pick a city from the results.
2. [Week forecast](./features/week-forecast.md): seven days with temperature, rain and wind per day.
3. [Day detail](./features/day-detail.md): the weather per hour for one day.
4. [My places](./features/my-places.md): save a city, remove it again, still there after a restart.
5. [Share a day](./features/share-day.md): send the forecast of one day to a friend.

## Data

- **API**: [Open-Meteo](https://open-meteo.com/en/docs). Public, no login, no key.
- **Endpoints**:
  - `geocoding-api.open-meteo.com/v1/search?name=...`: city search (name, country, latitude, longitude).
  - `api.open-meteo.com/v1/forecast?...&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max`: week forecast.
  - The same endpoint with `hourly=temperature_2m,precipitation`: day detail.
- **Stored on the phone**: table `places` in SQLite: `id` (from the geocoding API), `name`, `country`, `latitude`, `longitude`, `created_at`.

## Technical choices

- **Stored in SQLite**: my places, not the forecasts, because a forecast is old
  after a day. SQLite, not AsyncStorage, because I sort places by date added
  and check for duplicates on `id`.
- **Native feature**: Share on the day detail screen. It sends a text, not a
  screenshot, so it works in every chat app.

## Technical core

- [ ] Runs in Expo Go
- [ ] Live data through TanStack Query
- [ ] At least 2 screens with Expo Router
- [ ] Something in SQLite that survives a restart
- [ ] Loading and error state on every load
- [ ] One native feature: Share, on the day detail screen
- [ ] TypeScript and ESLint without errors
- [ ] UI, data and logic in separate files

## Optional

- [ ] Three different Reanimated animations, each with a purpose
- [x] Dark mode: every screen looks right, all colours from the theme
- [ ] Pagination: page by page while you scroll, not all at once
- [x] Clean TypeScript: no `any`, no `as` casts, no `@ts-ignore`
- [ ] Design (not Pokédex): a consistent own style with your own font
- [ ] Localization: two languages
- [ ] No warnings: no `console.log`, none in the terminal or on screen
- [x] Offline: works in airplane mode with the last data
- [ ] Tests: one per feature on the logic, `npm test` passes
- [ ] CI: lint and tsc on every push
- [ ] Accessibility: button labels, largest text size
- [ ] Optimistic update

## Out of scope

- Accounts or sync between phones.
- Your current location (GPS).
- Weather alerts or notifications.
- More than seven days ahead, or weather from the past.
- A web version.
