# Photos

Drop AKKI photos here (only ones AKKI owns or has permission to use). File name = slot; extension can be jpg, jpeg, png, webp or avif. Restart `npm run dev` after adding files.

| File name | Where it appears |
| --- | --- |
| `hero` | Home hero background (landscape, ~1920px wide) |
| `gallery-riding` | Home gallery, large square tile |
| `gallery-coaching`, `gallery-kids`, `gallery-events`, `gallery-trails` | Home gallery tiles (4:3) |
| `gallery-community` | Home gallery wide banner tile |
| `social-1` … `social-6` | Home social preview (square) |
| `location-map` | Home location panel (4:3) |
| `event-race`, `event-clinic`, `event-beginner_day`, `event-kids_camp`, `event-holiday`, `event-community`, `event-demo`, `event-school`, `event-corporate` | Event cards / detail by event type (16:10) |
| `event-default` | Fallback for any event without its own photo |
| `event-<slug>` (e.g. `event-demo-community-race`) | One specific event |

Keep each file under ~500 KB.
