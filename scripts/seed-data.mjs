/**
 * All demo content for the wedding site, in one place.
 *
 * Consumed by scripts/seed.mjs. Everything here is fabricated: the hotels,
 * the guest list, the shuttle times and the room-block codes are invented for
 * the demo. Registry links point at real store search pages so the outbound
 * links behave, but no product is real.
 */

// ── Editable page copy ───────────────────────────────────────────────────────

export const contentBlocks = [
  {
    key: "home_welcome",
    label: "Home — welcome note",
    eyebrow: "Welcome",
    title: "We're so glad you're here",
    body: `Two summers ago, on a quiet stretch of sand at the end of a very long day, one of us asked a question and the other one cried before answering. Everything since has been paperwork and joy in roughly equal measure.

On the seventeenth of September we would like to gather every person who got us here — the ones who set us up, talked us down, fed us, and told us the truth — into one old stone inn in New Jersey, and then dance with all of them.

This little site has everything you need: where to sleep, how to get there, what to wear, and what we could possibly still need for a kitchen we have already over-equipped. Thank you for coming. Truly.`,
    sort_order: 10,
  },
  {
    key: "story_intro",
    label: "Our Story — introduction",
    eyebrow: "Our Story",
    title: "It is a truth universally acknowledged",
    body: `Our story is, we are told, not an original one. A bad first impression, a long stretch of being wrong about each other, and then a slow and total correction. We are told this happens to a lot of people. We remain convinced it has never happened quite like this.`,
    sort_order: 20,
  },
  {
    key: "story_ch1",
    label: "Our Story — chapter 1",
    eyebrow: "2019 · The Assembly",
    title: "A very poor first impression",
    body: `They met at a wedding neither of them wanted to attend. Tom stood near the bar for most of the evening with the specific expression of a man calculating how early he could leave, and Jenna — overhearing him describe the dance floor as "tolerable" — decided within four minutes that she had his whole character mapped.

She told her roommate that night that he was the proudest, most disagreeable man in the world, and that she hoped never to be seated near him again. She has since had this quoted back to her at every major holiday.

What she did not know was that he had gone home and told his brother about the woman who argued with him about the seating chart for twenty minutes and won.`,
    sort_order: 21,
  },
  {
    key: "story_ch2",
    label: "Our Story — chapter 2",
    eyebrow: "2021 · The Letter",
    title: "Being thoroughly wrong",
    body: `They ran into each other for two years the way you do in a city — at a bookstore, at somebody's baby shower, once memorably in the rain outside a train station where neither had an umbrella and both refused to admit it.

Then came the email. Four paragraphs long, sent at 1:00 a.m., correcting a misunderstanding that Jenna had been carrying around like a stone since the night they met. She read it standing up in her kitchen. She read it again sitting down.

"I write not to renew the argument," it began, "but because I would rather be understood than be right." She has it printed. It is in a drawer. She will show anyone who asks.`,
    sort_order: 22,
  },
  {
    key: "story_ch3",
    label: "Our Story — chapter 3",
    eyebrow: "2023 · The Long Walk",
    title: "Everything, gradually",
    body: `After that it was almost embarrassingly easy. They were terrible at pretending otherwise. There was a summer of very long walks, an apartment with a radiator that sounded like a small animal, and a shared and completely unearned confidence in their own cooking.

Their families met and, against all reasonable odds, liked each other. Jenna's mother cried. Tom's brother made a toast at an ordinary Tuesday dinner. Nobody objected to anything, which everyone agreed was disappointing.`,
    sort_order: 23,
  },
  {
    key: "story_ch4",
    label: "Our Story — chapter 4",
    eyebrow: "2025 · The Question",
    title: "She said yes before he finished",
    body: `He had a plan and a speech and a ring in a jacket he had been carrying for six days. What he got was a beach at golden hour, a wave over both their shoes, and Jenna saying "yes, yes, obviously yes" somewhere around the third sentence.

The photos on this site are from that afternoon. You can see the exact moment he realized he was not going to get to finish.

And so: September seventeenth, two thousand twenty-seven. David's Country Inn. We would love you there.`,
    sort_order: 24,
  },
  {
    key: "gallery_intro",
    label: "Gallery — introduction",
    eyebrow: "Photographs",
    title: "The afternoon she said yes",
    body: `A few favorites from our engagement session — one long golden hour, two pairs of ruined shoes, and a photographer with extraordinary patience.`,
    sort_order: 30,
  },
  {
    key: "travel_intro",
    label: "Travel — introduction",
    eyebrow: "Getting There",
    title: "Come to the country for a weekend",
    body: `Hackettstown sits in the hills of northwest New Jersey, about an hour from Newark and a little over an hour from Manhattan. Below you'll find written directions from every direction, the hotel holding a block of rooms for us, and a shuttle that means nobody has to think about driving.`,
    sort_order: 40,
  },
  {
    key: "travel_outro",
    label: "Travel — parking & airports note",
    eyebrow: "Also Worth Knowing",
    title: "Airports, trains & parking",
    body: `Flying: Newark Liberty (EWR) is the closest at roughly 50 miles and the easiest for connections. Lehigh Valley (ABE) is closer at 35 miles with fewer flights. Both have rental counters.

Train: NJ Transit's Morristown Line runs to Hackettstown station, a seven-minute walk from the inn. Service is sparse on weekends — check the schedule before you commit to it.

Parking: the inn has a free lot with about eighty spaces, and overnight parking is fine if you'd rather collect your car on Saturday morning. We'd genuinely prefer that.`,
    sort_order: 41,
  },
  {
    key: "schedule_intro",
    label: "Schedule — introduction",
    eyebrow: "The Weekend",
    title: "Three days, if you can spare them",
    body: `The wedding itself is Friday evening, but we've built a weekend around it and we would love for you to stay for the whole thing. Nothing outside of Friday is obligatory — come to what you can.`,
    sort_order: 50,
  },
  {
    key: "faq_intro",
    label: "Q&A — introduction",
    eyebrow: "Questions & Answers",
    title: "Everything people have asked us so far",
    body: `We've collected the questions we keep getting. If yours isn't here, email us — we answer faster than you'd expect for people planning a wedding.`,
    sort_order: 60,
  },
  {
    key: "registry_intro",
    label: "Registry — introduction",
    eyebrow: "Registry",
    title: "Only if you'd like to",
    body: `Your presence is genuinely the gift — several of you are flying a long way for a Friday. But people kept asking, so here is a list. It spans three stores and a wide range of prices, and anything already claimed is marked so nobody doubles up.`,
    sort_order: 70,
  },
  {
    key: "rsvp_intro",
    label: "RSVP — introduction",
    eyebrow: "RSVP",
    title: "Will you join us?",
    body: `Please respond by August 1, 2027. Start by finding your invitation below — search the first or last name of anyone in your party and we'll pull up everyone on your invitation.`,
    sort_order: 80,
  },
];

// ── Photo captions, applied in order to the 16 gallery selections ────────────

export const galleryCaptions = [
  "The last quiet minute before the question",
  "Trunk Bay, about an hour before sunset",
  "She said yes before he finished the sentence",
  "The ring, and the hand that would not stop shaking",
  "Golden hour did most of the work",
  "Both pairs of shoes were a total loss",
  "Laughing at something the photographer said",
  "The walk back",
  "Somebody's hair had opinions about the wind",
  "This is our favorite one",
  "A wave neither of us saw coming",
  "Sixty-eight photos of this exact moment exist",
  "The dip was entirely his idea",
  "Salt, sand, and a very good afternoon",
  "The light going gold over the point",
  "Last frame of the day",
];

export const carouselCaptions = [
  "September 17, 2027",
  "David's Country Inn · Hackettstown, New Jersey",
  "Join us",
];

// ── Travel ───────────────────────────────────────────────────────────────────

export const hotels = [
  {
    name: "Hanover Marriott",
    address: "1401 NJ-10 E, Whippany, NJ 07981",
    phone: "(973) 555-0240",
    rate: "$189 / night",
    block_code: "REIDWED27",
    cutoff: "Book by August 17, 2027",
    distance: "24 miles from the venue — about 30 minutes by car",
    booking_url: "https://example.com/hanover-marriott/reserve?block=REIDWED27",
    notes:
      "The single block for the weekend, and where the whole party is staying — family, wedding party, and the shuttle all start here. Full-service hotel off Route 10 with a bar that will stay open late for us, free parking, and suites that sleep four if you are travelling with kids. Mention the block code by phone or use the link — the discounted rate does not appear on the public booking page.",
    sort_order: 1,
  },
];

export const directions = [
  {
    heading: "From the North",
    summary: "Sussex County, upstate New York, New England",
    body: `Take I-84 west to I-380 south, then pick up I-80 east at Scranton.
Follow I-80 east to Exit 19 (Route 517, Hackettstown / Allamuchy).
At the end of the ramp turn right onto Route 517 south and continue 3.4 miles.
Route 517 becomes High Street as you enter Hackettstown — stay on it through two lights.
Turn left onto Main Street; the inn is 0.3 miles ahead on the right, just past the stone church.
Coming down Route 206 instead? Take it south to Route 46 west and follow the directions from the East.`,
    sort_order: 1,
  },
  {
    heading: "From the South",
    summary: "Central & South Jersey, Philadelphia, the shore",
    body: `Take I-95 or the New Jersey Turnpike north to I-287 north.
Follow I-287 north to Exit 30 and merge onto I-80 west.
Continue on I-80 west about 18 miles to Exit 26 (Route 46 west, Hackettstown).
Follow Route 46 west for 4.1 miles into town, staying right where the road splits at the Willow Grove light.
Turn left onto Main Street; the inn is 0.5 miles down on the right.
From Philadelphia it is often faster to take I-476 to I-78 east, then Route 31 north to Route 46 east.`,
    sort_order: 2,
  },
  {
    heading: "From the East",
    summary: "New York City, Newark, Morristown, EWR",
    body: `From Manhattan take the Lincoln Tunnel or George Washington Bridge to I-80 west.
From Newark Airport take I-78 west to I-287 north, then I-80 west.
Stay on I-80 west to Exit 26 (Route 46 west, Hackettstown / Budd Lake).
Follow Route 46 west for 4.1 miles — you'll pass the reservoir on your right.
Turn left onto Main Street at the second traffic light in town.
The inn is 0.5 miles ahead on the right. Allow 75 to 90 minutes from midtown, and more on a Friday afternoon.`,
    sort_order: 3,
  },
  {
    heading: "From the West",
    summary: "Pennsylvania, the Poconos, Lehigh Valley, ABE",
    body: `Take I-80 east across the Delaware Water Gap into New Jersey.
Continue east about 22 miles to Exit 12 (Route 521 south, Hope / Blairstown).
Turn right onto Route 521 south and follow it 5.8 miles to Route 46 east.
Turn left onto Route 46 east and continue 6.2 miles into Hackettstown.
Turn right onto Main Street at the light by the firehouse; the inn is a quarter mile down on the left.
From Allentown or ABE, Route 22 east to I-78 east to Route 31 north is the prettier drive and roughly the same time.`,
    sort_order: 4,
  },
];

// ── Schedule ─────────────────────────────────────────────────────────────────

export const scheduleEvents = [
  {
    day_label: "Thursday, September 16",
    day_order: 1,
    time_label: "5:00 PM",
    title: "Welcome Drinks",
    location: "Hanover Marriott — the lobby bar",
    description:
      "Anybody in town early, come find us. No program, no toasts, no seating chart. We'll be the two people who cannot stop checking the weather app.",
    attire: "Whatever you travelled in",
    sort_order: 1,
  },
  {
    day_label: "Thursday, September 16",
    day_order: 1,
    time_label: "7:00 PM",
    title: "Rehearsal Dinner",
    location: "Fossetti's Trattoria, 88 Main Street, Hackettstown",
    description:
      "Immediate family and the wedding party — you'll have received a separate note. Family-style, four courses, and a toast from Tom's brother that we have asked him to keep under four minutes.",
    attire: "Smart casual",
    sort_order: 2,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "3:15 PM",
    title: "First shuttle departs the Hanover Marriott",
    location: "Hanover Marriott — main entrance",
    description:
      "First coach. About 30 minutes to the venue, so this one has you there with time to spare. Please be outside five minutes early.",
    attire: "",
    sort_order: 3,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "3:40 PM",
    title: "Second shuttle departs the Hanover Marriott",
    location: "Hanover Marriott — main entrance",
    description:
      "Second and last coach from the hotel, arriving at the inn around 4:10. Miss it and you are driving yourself.",
    attire: "",
    sort_order: 4,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "4:00 PM",
    title: "Guests Arrive",
    location: "David's Country Inn — front lawn",
    description:
      "Lemonade, iced tea, and something stronger if you need it. Find your name on the escort board and take a walk through the garden.",
    attire: "",
    sort_order: 5,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "4:30 PM",
    title: "Ceremony",
    location: "The garden terrace, weather permitting",
    description:
      "Please be seated by 4:25. It runs about 25 minutes. We're asking everyone to keep phones away for this part — our photographer has it covered and we'd rather see your faces.",
    attire: "Garden formal",
    sort_order: 6,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "5:15 PM",
    title: "Cocktail Hour",
    location: "The stone veranda & lower lawn",
    description:
      "An hour and a quarter of passed hors d'oeuvres, a raw bar, and two drinks we made up and named after our dog. Lawn games for anyone avoiding small talk.",
    attire: "",
    sort_order: 7,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "6:30 PM",
    title: "Reception & Dinner",
    location: "The Grand Ballroom",
    description:
      "Doors open, first dance, then a plated dinner — your meal choice from the RSVP form. Toasts between the second and third course.",
    attire: "",
    sort_order: 8,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "8:45 PM",
    title: "Cake & Dancing",
    location: "The Grand Ballroom",
    description:
      "Cake cutting, parent dances, and then the floor is open. The band plays two sets with a DJ filling the gap.",
    attire: "",
    sort_order: 9,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "10:45 PM",
    title: "Last Dance",
    location: "The Grand Ballroom",
    description:
      "You'll know the song. Sparklers on the front drive immediately after, handed out by the door.",
    attire: "",
    sort_order: 10,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "11:00 PM & 11:45 PM",
    title: "Return Shuttles",
    location: "David's Country Inn — front drive",
    description:
      "Two runs back to the Hanover Marriott. The 11:45 is the last one — after that it's a fifteen-minute cab and a long wait for it.",
    attire: "",
    sort_order: 11,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "11:15 PM — late",
    title: "After Party",
    location: "Hanover Marriott — the lobby bar",
    description:
      "The bar is ours until it isn't. There will be a grilled cheese situation around midnight. No obligation whatsoever, but this is historically where the good stories come from.",
    attire: "Ties optional and, frankly, discouraged",
    sort_order: 12,
  },
  {
    day_label: "Saturday, September 18",
    day_order: 3,
    time_label: "9:30 AM — 11:30 AM",
    title: "Farewell Brunch",
    location: "Hanover Marriott — the atrium",
    description:
      "Drop-in, come as you are, no program at all. Coffee, eggs, and a chance to say a proper goodbye before the drive home. Collect your car from the venue lot any time before noon.",
    attire: "Pajamas would be a bold choice",
    sort_order: 13,
  },
];

// ── Q&A ──────────────────────────────────────────────────────────────────────

export const faqItems = [
  {
    question: "What is the dress code?",
    answer:
      "Garden formal. For most people that means a suit and tie or a cocktail dress; a floor-length gown would not be out of place. The ceremony is on grass and the veranda is stone, so we'd steer you away from a stiletto heel — block heels, wedges, and flats will make your evening much better. Colors: anything but white, and we'd love to see you in something you actually like.",
    category: "Attire",
    sort_order: 1,
  },
  {
    question: "Is the ceremony outdoors? What happens if it rains?",
    answer:
      "The ceremony is on the garden terrace, outdoors, on grass. If the weather turns, we move inside to the ballroom's east room — same time, same ceremony, one fewer view. We'll make the call by noon that day and post it here and text anyone who's given us a number. Bring a wrap either way; September evenings in the hills get cool once the sun goes down.",
    category: "Logistics",
    sort_order: 2,
  },
  {
    question: "When should I RSVP by?",
    answer:
      "August 1, 2027. The venue needs final numbers three weeks out and we need a little runway to build the seating chart. If we haven't heard from you by the first, expect a very friendly text.",
    category: "RSVP",
    sort_order: 3,
  },
  {
    question: "Can I bring a plus one?",
    answer:
      "If your invitation includes one, they'll show up by name when you look up your invitation on the RSVP page. We wish we could invite everybody's everybody, but the ballroom holds 140 and we are already doing arithmetic we don't enjoy. If you think we've made a mistake, please just ask — sometimes we have.",
    category: "RSVP",
    sort_order: 4,
  },
  {
    question: "Are children invited?",
    answer:
      "Children who are named on your invitation are absolutely invited, and there's a kids' meal option on the RSVP form. Beyond that we're keeping the evening mostly adults — the reception runs late and the bar is central to the plan. The hotel can recommend sitters, and a few families are splitting one; email us and we'll connect you.",
    category: "RSVP",
    sort_order: 5,
  },
  {
    question: "Wait — the wedding is on a Friday?",
    answer:
      "It is. September 17, 2027 is a Friday. It's the date the inn had, and honestly we came to love it: you get a whole weekend afterward instead of a Sunday scramble home. Thursday welcome drinks and Saturday brunch are our attempt to make the trip worth the day off.",
    category: "Logistics",
    sort_order: 6,
  },
  {
    question: "How do I get there, and where should I stay?",
    answer:
      "Everything lives on the Travel page: written directions from all four directions, an embedded map, and the hotel holding discounted rooms for us. Book through the block before the cutoff date — the rate isn't available on the public booking page.",
    category: "Travel",
    sort_order: 7,
  },
  {
    question: "Is there a shuttle?",
    answer:
      "Yes, and please use it. Two coaches run from the Hanover Marriott before the ceremony and make two return trips at 11:00 and 11:45 PM. Exact times are on the Schedule page. It's free, it's included, and it means nobody has to make a decision about driving at eleven o'clock at night.",
    category: "Travel",
    sort_order: 8,
  },
  {
    question: "Where do I park?",
    answer:
      "The inn has a free lot with about eighty spaces. Overnight parking is allowed and encouraged — take the shuttle back to your hotel and collect the car before noon on Saturday.",
    category: "Travel",
    sort_order: 9,
  },
  {
    question: "I have a dietary restriction. Can you accommodate it?",
    answer:
      "Yes, and please tell us. There's a notes field next to every meal choice on the RSVP form — use it for allergies, intolerances, vegan, kosher, halal, or anything else. The kitchen is genuinely good about this, but they need to know by August 1 to do it well. When in doubt, over-explain.",
    category: "Food & Drink",
    sort_order: 10,
  },
  {
    question: "What's for dinner?",
    answer:
      "A plated dinner with four choices: filet of beef, herb roasted chicken, pan seared salmon, and a wild mushroom risotto that is vegetarian and quietly the best thing on the menu. Kids get their own option. You'll pick when you RSVP. Cocktail hour has a raw bar and enough passed food that nobody should arrive at dinner hungry.",
    category: "Food & Drink",
    sort_order: 11,
  },
  {
    question: "Is there an open bar?",
    answer:
      "There is, from cocktail hour through the last dance — beer, wine, a full spirits list, two signature cocktails, and real non-alcoholic options that aren't just soda. Nobody should feel like an afterthought at the bar.",
    category: "Food & Drink",
    sort_order: 12,
  },
  {
    question: "Can I take photos?",
    answer:
      "Everywhere except the ceremony, where we're asking for phones away for all 25 minutes. We hired a photographer we trust so that the people we love could be present instead of filming. After that, please take everything — and share it with the hashtag so we get to see the night from your side of the room.",
    category: "Logistics",
    sort_order: 13,
  },
  {
    question: "Are you registered anywhere? Do you want gifts?",
    answer:
      "Your being there is the gift, and we mean that — several of you are flying for a Friday wedding. But people asked, so there's a registry page with a range of prices across three stores. Anything already bought is marked so nobody doubles up. There is no gift table at the venue; anything sent will find us.",
    category: "Gifts",
    sort_order: 14,
  },
  {
    question: "What time should I actually arrive?",
    answer:
      "Aim for 4:00 PM, be seated by 4:25. The ceremony starts at 4:30 and we are told the doors genuinely close. The shuttles are timed to land you there around 3:55 with room to spare.",
    category: "Logistics",
    sort_order: 15,
  },
  {
    question: "Who do I contact if something comes up?",
    answer:
      "Email jenna.and.tom@example.com — it goes to both of us and one of us always answers. For anything day-of and urgent, call or text (908) 555-0142; on the wedding day itself that phone is with our coordinator, Renée, who is far more capable than either of us.",
    category: "General",
    sort_order: 16,
  },
];

// ── Registry: 40 items across 3 stores ───────────────────────────────────────
// `purchased: true` items sort to the end of the public grid.

const CB = "Crate & Barrel";
const WS = "Williams Sonoma";
const TG = "Target";

/** Store search URL builders — outbound links land on a real store search page. */
const storeUrl = {
  [CB]: (q) => `https://www.crateandbarrel.com/search?query=${encodeURIComponent(q)}`,
  [WS]: (q) => `https://www.williams-sonoma.com/search/results.html?words=${encodeURIComponent(q)}`,
  [TG]: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
};

const rawRegistry = [
  // ── Crate & Barrel ──
  [CB, "Marin Dinnerware, 8-Piece Set", "dining", 8995, "Matte white stoneware with an unglazed rim. Service for four, and the plates we'd actually use on a Tuesday.", "marin dinnerware set", true],
  [CB, "Aspen Enameled Dutch Oven, 5.5 qt", "kitchen", 14900, "Cast iron with a cream enamel interior. Bread, braises, and the chili recipe we argue about.", "enameled dutch oven", false],
  [CB, "Hue Cotton Percale Sheet Set, Queen", "bedding", 12900, "400-thread-count percale in bone. Crisp rather than silky, which is the correct preference.", "percale sheet set queen", false],
  [CB, "Tour Stemless Wine Glasses, Set of 8", "glassware", 5995, "Thin-walled, dishwasher-safe, and forgiving of a crowded sink. Eight because six is never eight.", "stemless wine glasses set", true],
  [CB, "Olsen Walnut Cutting Board", "kitchen", 7900, "End-grain walnut, 18 by 12 inches, with a juice groove. Heavy enough to stay put.", "walnut cutting board", false],
  [CB, "Bianca Ceramic Vase, Tall", "decor", 4995, "Sixteen inches of hand-thrown matte ceramic for the branches Jenna keeps bringing home.", "tall ceramic vase", false],
  [CB, "Copeland Brass & Glass Bar Cart", "furniture", 39900, "Two tiers, antiqued brass frame, and casters that lock. The centerpiece of every party we intend to host.", "brass bar cart", false],
  [CB, "Kina Linen Napkins, Set of 8", "dining", 3995, "Washed European flax in sage. They soften every wash and hide a great deal of red wine.", "linen napkins set of 8", true],
  [CB, "Otto Stainless Flatware, 20-Piece", "dining", 11995, "Brushed 18/10 with a satin finish. Service for four, weighted properly in the hand.", "stainless flatware set", false],
  [CB, "Torres Mango Wood Serving Bowl", "dining", 6995, "A fourteen-inch turned bowl for salads, bread, and the fruit we optimistically buy.", "mango wood serving bowl", false],
  [CB, "Aria Turkish Cotton Towels, 6-Piece", "bath", 8900, "Two bath, two hand, two wash, in a soft oat. Absorbent from the first wash, which is rare.", "turkish cotton towel set", true],
  [CB, "Hendrick Ceramic Table Lamp", "decor", 17900, "A glazed ivory base with a natural linen drum shade. Warm, low, and good for reading in bed.", "ceramic table lamp", false],
  [CB, "Blake Cast Iron Skillet, 12 in", "kitchen", 6995, "Pre-seasoned, oven-safe to 500°F, and the only pan either of us reaches for at breakfast.", "cast iron skillet 12", false],
  [CB, "Vale Chunky Knit Throw", "decor", 9900, "Hand-knit cotton in fog grey, fifty by seventy inches. Immediately claimed by the dog.", "chunky knit throw blanket", false],

  // ── Williams Sonoma ──
  [WS, "All-Clad D3 Cookware, 10-Piece Set", "kitchen", 89995, "Tri-ply stainless, made in Pennsylvania, and genuinely the last set we'll ever need. The big one on the list.", "all-clad d3 cookware set", false],
  [WS, "Semi-Automatic Espresso Machine", "kitchen", 119900, "Dual boiler, PID temperature control, and a steam wand Tom has been researching for eleven months.", "espresso machine dual boiler", false],
  [WS, "Stand Mixer, 5 qt", "kitchen", 44995, "Tilt-head, ten speeds, in matte cream. For the sourdough phase we are both pretending won't happen.", "stand mixer 5 quart", true],
  [WS, "Damascus Chef's Knife, 8 in", "kitchen", 18900, "Sixty-seven layers of folded steel with a pakkawood handle. Frighteningly sharp; worth it.", "damascus chef knife 8 inch", false],
  [WS, "Marble Salt & Pepper Mill Set", "kitchen", 7995, "Carrara marble with ceramic burrs and a grind you can actually adjust.", "marble salt pepper mill", false],
  [WS, "Copper Moscow Mule Mugs, Set of 4", "glassware", 11995, "Hammered solid copper with a lacquered exterior. Cold in about four seconds.", "copper moscow mule mugs", true],
  [WS, "Marble Pastry Board", "kitchen", 12995, "Sixteen by twenty inches of cool white marble, for pie dough and, realistically, cheese.", "marble pastry board", false],
  [WS, "Enameled Roasting Pan with Rack", "kitchen", 15900, "Big enough for a fourteen-pound turkey, which we have now volunteered to host.", "enameled roasting pan rack", false],
  [WS, "Olive Wood Utensil Set, 5-Piece", "kitchen", 5495, "Spoon, slotted spoon, spatula, turner, and a spurtle we had to look up.", "olive wood utensil set", false],
  [WS, "Crystal Champagne Flutes, Set of 6", "glassware", 14995, "Lead-free crystal, pulled stems, absurdly thin rims. For anniversaries and ordinary Wednesdays.", "crystal champagne flutes set", true],
  [WS, "Waffle Weave Robes, Pair", "bath", 19800, "Two Turkish cotton robes in white, monogrammed if you'd like. One will be stolen immediately.", "waffle weave bath robe", false],
  [WS, "Cold Brew Coffee Maker", "kitchen", 4495, "A borosilicate carafe and a fine steel filter. Makes a week of Jenna's mornings at once.", "cold brew coffee maker", true],
  [WS, "Nesting Mixing Bowls, Set of 5", "kitchen", 9995, "Stainless with silicone bases and pour spouts. They nest, which our cabinets require.", "nesting mixing bowls set", false],

  // ── Target ──
  [TG, "Cotton Bath Mat Set, 2-Piece", "bath", 2799, "Tufted cotton with a non-slip backing, in a warm grey. Machine washable, which matters.", "cotton bath mat set", false],
  [TG, "Linen Storage Ottoman", "furniture", 8999, "Upholstered in oatmeal linen with a lift-off lid that hides an unflattering quantity of blankets.", "linen storage ottoman", false],
  [TG, "Weighted Blanket, 15 lb", "bedding", 5999, "Glass-bead fill with a removable minky cover. Jenna sleeps through thunderstorms now.", "weighted blanket 15 lb", true],
  [TG, "Air Fryer, 6 qt", "kitchen", 7999, "Digital, with a basket that fits a whole chicken. We were skeptical; we were wrong.", "air fryer 6 quart", false],
  [TG, "Bamboo Dish Drying Rack", "kitchen", 2499, "A slatted bamboo rack with a removable drip tray. Handsome enough to leave on the counter.", "bamboo dish drying rack", true],
  [TG, "Cordless Stick Vacuum", "home", 19999, "Forty minutes of runtime and a head that gets under the couch. We have a shedding dog.", "cordless stick vacuum", false],
  [TG, "Waterproof Picnic Blanket", "outdoor", 3499, "Woven top, sealed backing, folds into its own handle. For the concerts we keep meaning to go to.", "waterproof picnic blanket", false],
  [TG, "Ceramic Planter Trio", "decor", 3299, "Three glazed planters in graduated sizes with drainage and matching saucers.", "ceramic planter set", false],
  [TG, "Brushed Brass Robe Hooks, Set of 2", "bath", 1799, "The least expensive thing on this list and somehow the one we most need.", "brass robe hook set", false],
  [TG, "Acacia Cutting Board Set, 3-Piece", "kitchen", 2299, "Small, medium, and large, for the nights when one board is not enough.", "acacia cutting board set", true],
  [TG, "Arc Reading Floor Lamp", "decor", 10999, "A brushed brass arc that reaches over an armchair, with a dimmer on the cord.", "arc floor lamp brass", false],
  [TG, "Outdoor String Lights, 48 ft", "outdoor", 3999, "Shatterproof Edison bulbs on a weatherproof cord. The entire aesthetic of our future patio.", "outdoor string lights 48ft", false],
  [TG, "Steel Bowl Fire Pit", "outdoor", 14999, "A thirty-inch bowl with a spark screen and a poker. Where we intend to spend every October.", "steel fire pit bowl", false],
];

export const registryItems = rawRegistry.map(
  ([store, title, category, price_cents, description, query, purchased], index) => ({
    title,
    description,
    price_cents,
    store,
    category,
    external_url: storeUrl[store](query),
    purchased: purchased ? 1 : 0,
    purchased_by: purchased ? "" : "",
    sort_order: index + 1,
  }),
);

export const registryStores = [CB, WS, TG];

// ── Guest list: 20 parties, 47 guests ────────────────────────────────────────
// The invitation list is a deliberate crowd of fictional households — the
// Gilmores, the Griffins, the Hecks, the Rosewood six, Hawkins, Schitt's Creek
// and the Addamses — a demo guest list made of invented strangers is impossible
// to hold in your head while clicking around the admin. Recognisable names make
// a mis-sorted row, a lost group or a guest moved to the wrong table obvious at
// a glance, which invented ones never did.
//
// `status` values seed a realistic mix so the admin dashboard has real numbers.
// A party with any responded guest also gets an rsvp_submissions row, so the
// three all-pending groups here (Sinclair, Henderson, Schitt) are what proves
// the "no submission on record" path renders at all.
//
// Several specific shapes below are load-bearing for tests/e2e — change them and
// read the failures before assuming flake:
//   · Roland & Jocelyn Schitt is the only three-person all-pending group, and
//     the public RSVP round trip submits against it.
//   · Joyce Byers & Jim Hopper is the only four-person group and deliberately
//     has no `envelope`, so it covers both the inherit-from-name fallback and
//     the "4 guests will be removed" cascade warning.
//   · Zoë Washburne is the only accented name, so searching "zoe" is the one
//     assertion that would catch accent folding regressing in lib/search.

export const parties = [
  {
    name: "Lorelai & Rory Gilmore",
    invite_code: "GILM01",
    // Optional: `envelope` overrides the addressee line on the invitation.
    // Groups without one inherit their name — see envelopeName() in lib/format.
    envelope: "Ms. Lorelai Gilmore & Ms. Rory Gilmore",
    address: "37 Maple Street, Stars Hollow, CT 06776",
    side: "bride",
    notes: "Jenna's oldest friends. Luke is Lorelai's plus one and has already offered to caffeinate the entire cocktail hour. Rory may be filing something from the reception.",
    message:
      "We are in, all three of us. Luke says he will bring coffee, which is not a joke and not negotiable. Rory may be on a deadline, so please forgive one laptop under the table.",
    guests: [
      { first: "Lorelai", last: "Gilmore", status: "attending", meal: "filet", dietary: "" },
      { first: "Rory", last: "Gilmore", status: "attending", meal: "salmon", dietary: "" },
      { first: "Luke", last: "Danes", status: "attending", meal: "filet", dietary: "Coffee at the table from the moment we sit down, if the kitchen can manage it." },
    ],
  },
  {
    name: "The Griffin Family",
    invite_code: "GRIFF02",
    envelope: "Mr. & Mrs. Peter Griffin",
    address: "31 Spooner Street, Quahog, RI 02911",
    side: "groom",
    notes: "Tom's cousins. Four coming and Meg staying home, which Lois was firm about. Stewie is a baby and goes to the kids' table under protest.",
    message:
      "Four of us are coming and Meg is watching the house, which she has been told is an honour. Peter has questions about the open bar. Stewie has questions about the seating chart.",
    guests: [
      { first: "Peter", last: "Griffin", status: "attending", meal: "filet", dietary: "" },
      { first: "Lois", last: "Griffin", status: "attending", meal: "chicken", dietary: "" },
      { first: "Chris", last: "Griffin", status: "attending", meal: "filet", dietary: "" },
      { first: "Stewie", last: "Griffin", status: "attending", meal: "kids", child: true, dietary: "No nuts of any kind — Lois carries the EpiPen." },
      { first: "Meg", last: "Griffin", status: "declined", meal: null, dietary: "" },
    ],
  },
  {
    name: "Aria Montgomery & Ezra Fitz",
    invite_code: "MONT03",
    address: "112 Hollis Road, Rosewood, PA 19087",
    side: "bride",
    notes: "Jenna's Rosewood crowd. All six of them asked to be seated together, so Table 3 is theirs — see initialSeating below.",
    message:
      "Wouldn't miss it. Put us with Spencer and Emily or there will be a group chat about it.",
    guests: [
      { first: "Aria", last: "Montgomery", status: "attending", meal: "salmon", dietary: "" },
      { first: "Ezra", last: "Fitz", status: "attending", meal: "filet", dietary: "" },
    ],
  },
  {
    name: "Spencer Hastings & Toby Cavanaugh",
    invite_code: "HAST04",
    address: "1465 Radley Lane, Rosewood, PA 19087",
    side: "bride",
    notes: "Rosewood, at Table 3 with Aria and Emily. Spencer has already audited the timeline and sent notes on it.",
    message:
      "Confirmed for both of us. I have read the schedule twice and have only two questions, which I will send separately.",
    guests: [
      { first: "Spencer", last: "Hastings", status: "attending", meal: "chicken", dietary: "" },
      { first: "Toby", last: "Cavanaugh", status: "attending", meal: "filet", dietary: "" },
    ],
  },
  {
    name: "Emily Fields & Maya St. Germain",
    invite_code: "FIEL05",
    address: "204 Willow Court, Rosewood, PA 19087",
    side: "bride",
    notes: "Rosewood, Table 3 with the others. Maya's gluten allergy is medical, not a preference — flag it to the kitchen.",
    message:
      "Two yeses. Maya is celiac so a genuinely gluten free plate would be a real kindness — otherwise she is easy.",
    guests: [
      { first: "Emily", last: "Fields", status: "attending", meal: "salmon", dietary: "" },
      { first: "Maya", last: "St. Germain", status: "attending", meal: "vegetarian", dietary: "Gluten free — celiac, not a preference." },
    ],
  },
  {
    name: "Joyce Byers & Jim Hopper",
    invite_code: "HAWK06",
    // No `envelope` on purpose: the group name is already how they would want to
    // be addressed, and leaving it blank keeps the inherit-from-name fallback
    // exercised by seeded data rather than only by entries added in the demo.
    address: "Cabin 3, Mirkwood Road, Hawkins, IN 47331",
    side: "groom",
    notes: "Tom's side, from the Hawkins years. Will and Jane are at the kids' table. Hop has asked twice how long the ceremony runs.",
    message:
      "All four of us are coming. Hop wants it on the record that he is not dancing. Jane has informed us that he is.",
    guests: [
      { first: "Joyce", last: "Byers", status: "attending", meal: "chicken", dietary: "" },
      { first: "Jim", last: "Hopper", status: "attending", meal: "filet", dietary: "" },
      { first: "Will", last: "Byers", status: "attending", meal: "kids", child: true, dietary: "" },
      { first: "Jane", last: "Hopper", status: "attending", meal: "kids", child: true, dietary: "No mushrooms in anything, please." },
    ],
  },
  {
    name: "Jonathan Byers & Nancy Wheeler",
    invite_code: "HAWK07",
    address: "88 Cornwallis Street, Apt 2, Boston, MA 02116",
    side: "groom",
    notes: "Jonathan is Joyce's eldest. Nancy is named on the invitation rather than listed as a guest of — she asked, in writing.",
    message:
      "Both of us, and we can help with anything that needs carrying or photographing.",
    guests: [
      { first: "Jonathan", last: "Byers", status: "attending", meal: "filet", dietary: "" },
      { first: "Nancy", last: "Wheeler", status: "attending", meal: "salmon", dietary: "" },
    ],
  },
  {
    name: "Steve Harrington",
    invite_code: "HAWK08",
    envelope: "Mr. Steve Harrington",
    address: "615 Loch Nora Drive, Hawkins, IN 47331",
    side: "groom",
    notes: "Flying solo and has volunteered to drive anyone who needs it. A one-person group, so the envelope override is the only thing that makes it read like an invitation.",
    message:
      "Solo, and I am the designated driver for whoever needs one. Seat me near the bar and far from the speakers.",
    guests: [
      { first: "Steve", last: "Harrington", status: "attending", meal: "filet", dietary: "" },
    ],
  },
  {
    name: "Robin Buckley",
    invite_code: "HAWK09",
    envelope: "Ms. Robin Buckley",
    address: "615 Loch Nora Drive, Apt B, Hawkins, IN 47331",
    side: "groom",
    notes: "Coming alone. Vegetarian, and will mention it herself about four more times before September.",
    message: "In! Vegetarian, and I will bring it up again closer to the date.",
    guests: [
      { first: "Robin", last: "Buckley", status: "attending", meal: "vegetarian", dietary: "Vegetarian — no fish either." },
    ],
  },
  {
    name: "Lucas Sinclair",
    invite_code: "HAWK10",
    address: "4819 Sycamore Lane, Hawkins, IN 47331",
    side: "groom",
    notes: "Hasn't answered yet — there is a basketball tournament that weekend he is still waiting on.",
    message: "",
    guests: [
      { first: "Lucas", last: "Sinclair", status: "pending", meal: null, dietary: "" },
    ],
  },
  {
    name: "Dustin Henderson",
    invite_code: "HAWK11",
    address: "21 Cherry Oak Drive, Hawkins, IN 47331",
    side: "groom",
    notes: "Still deciding. Every follow-up has come back as another question about the sound system.",
    message: "",
    guests: [
      { first: "Dustin", last: "Henderson", status: "pending", meal: null, dietary: "" },
    ],
  },
  {
    name: "Johnny & Moira Rose",
    invite_code: "ROSE12",
    envelope: "Mr. & Mrs. Johnny Rose",
    address: "Rosebud Motel, Room 6, Schitt's Creek, ON L0K 1A0",
    side: "both",
    notes: "Known to both of us. Moira introduced them at a benefit and has claimed full credit at every opportunity since.",
    message:
      "We accept, with bells on. Moira would like the wine list in advance and a note on whether the lighting is warm or cool.",
    guests: [
      { first: "Johnny", last: "Rose", status: "attending", meal: "filet", dietary: "" },
      { first: "Moira", last: "Rose", status: "attending", meal: "salmon", dietary: "No garnish on the plate. This has been raised more than once." },
    ],
  },
  {
    name: "David Rose & Patrick Brewer",
    invite_code: "ROSE13",
    address: "1 Elm Street, Apt 2, Schitt's Creek, ON L0K 1A0",
    side: "groom",
    notes: "David has asked about the dress code three times. Patrick has answered on his behalf three times.",
    message:
      "Both of us, obviously. David would like to know the dress code again. Patrick would like you to ignore that.",
    guests: [
      { first: "David", last: "Rose", status: "attending", meal: "vegetarian", dietary: "No cheese of any kind — a texture thing, not an allergy." },
      { first: "Patrick", last: "Brewer", status: "attending", meal: "chicken", dietary: "" },
    ],
  },
  {
    name: "Alexis Rose & Ted Mullens",
    invite_code: "ROSE14",
    address: "Rosebud Motel, Room 7, Schitt's Creek, ON L0K 1A0",
    side: "groom",
    notes: "One yes and one regret inside the same group — Ted is in the Galápagos through the autumn and cannot move it.",
    message:
      "Just me! Ted is still in the Galápagos with the turtles, which is a sentence I say a lot now. I will be there and I am bringing energy.",
    guests: [
      { first: "Alexis", last: "Rose", status: "attending", meal: "salmon", dietary: "" },
      { first: "Ted", last: "Mullens", status: "declined", meal: null, dietary: "" },
    ],
  },
  {
    name: "Stevie Budd",
    invite_code: "CREEK15",
    envelope: "Ms. Stevie Budd",
    address: "Rosebud Motel, Front Desk, Schitt's Creek, ON L0K 1A0",
    side: "groom",
    notes: "Coming alone and has said, in writing, that she will not be doing a reading.",
    message:
      "Yes. I am not doing a reading, giving a toast, or appearing in any photograph that has been staged.",
    guests: [
      { first: "Stevie", last: "Budd", status: "attending", meal: "filet", dietary: "" },
    ],
  },
  {
    name: "Roland & Jocelyn Schitt",
    invite_code: "SCHITT16",
    envelope: "Mayor & Mrs. Roland Schitt",
    address: "3 Fifth Avenue, Schitt's Creek, ON L0K 1A0",
    side: "both",
    notes: "Three pending — the mayor keeps saying he will confirm this week. Roland Jr. would be at the kids' table.",
    message: "",
    guests: [
      { first: "Roland", last: "Schitt", status: "pending", meal: null, dietary: "" },
      { first: "Jocelyn", last: "Schitt", status: "pending", meal: null, dietary: "" },
      { first: "Roland Jr.", last: "Schitt", status: "pending", meal: null, child: true, dietary: "" },
    ],
  },
  {
    name: "The Addams Family",
    invite_code: "ADDAMS17",
    envelope: "Mr. & Mrs. Gomez Addams",
    address: "0001 Cemetery Lane, Westfield, NJ 07090",
    side: "bride",
    notes: "Jenna's godparents. Wednesday and Pugsley are at the kids' table. Thing needs no chair — only a tray beside Morticia.",
    message:
      "We accept with enormous pleasure. Thing is coming and requires no chair, only a small tray beside Morticia. Gomez has asked whether there will be a sword.",
    guests: [
      { first: "Gomez", last: "Addams", status: "attending", meal: "filet", dietary: "" },
      { first: "Morticia", last: "Addams", status: "attending", meal: "salmon", dietary: "Nothing brightly coloured on the plate." },
      { first: "Wednesday", last: "Addams", status: "attending", meal: "kids", child: true, dietary: "She will ask what died. Answering honestly works best." },
      { first: "Pugsley", last: "Addams", status: "attending", meal: "kids", child: true, dietary: "" },
      { first: "Thing", last: "Addams", status: "attending", meal: "vegetarian", dietary: "No chair required — a small tray beside Morticia is plenty." },
    ],
  },
  {
    name: "Fester Addams",
    invite_code: "ADDAMS18",
    envelope: "Mr. Fester Addams",
    address: "0001 Cemetery Lane, Coach House, Westfield, NJ 07090",
    side: "bride",
    notes: "On his own invitation at Morticia's request, and a whole-party regret. He expects to be incarcerated that weekend and did not elaborate.",
    message:
      "Devastated to miss it. I will be detained — literally — through the end of September. Kindly save me a slice and do not ask which facility.",
    guests: [
      { first: "Fester", last: "Addams", status: "declined", meal: null, dietary: "" },
    ],
  },
  {
    name: "Zoë & Hoban Washburne",
    invite_code: "SEREN19",
    envelope: "Mr. & Mrs. Hoban Washburne",
    address: "Hangar 12, Eavesdown Docks, Persephone",
    side: "groom",
    notes:
      "Tom's flying friends, and the only accented name on the list: searching \"zoe\" has to reach \"Zoë\", which is the whole reason lib/search folds diacritics in JS instead of leaning on SQLite's LIKE.",
    message:
      "Both of us, weather and engine permitting. Wash would like it known that he is available to fly anyone anywhere afterwards.",
    guests: [
      { first: "Zoë", last: "Washburne", status: "attending", meal: "filet", dietary: "" },
      { first: "Hoban", last: "Washburne", status: "attending", meal: "chicken", dietary: "" },
    ],
  },
  {
    name: "The Heck Family",
    invite_code: "HECK20",
    envelope: "Mr. & Mrs. Mike Heck",
    address: "61 Arcadia Drive, Orson, IN 47374",
    side: "groom",
    notes: "Tom's cousins from Orson. Frankie has confirmed twice and changed the headcount both times, so treat the next email as the real one. Axl has been told in writing that a shirt is part of the dress code and that boxers are not trousers — somebody should sweep the parking lot before the ceremony. Sue will volunteer for anything offered and several things that were not; give her a job or she will invent one and it will involve a clipboard. Brick reads at the table and whispers the last word of his own sentences, which is not a problem, just a thing.",
    message:
      "All five of us! Mike says he does not need to be told twice about the tie, which means he needs to be told twice about the tie. Sue has already asked whether there is a committee she can be on. Brick would like to know whether there is a quiet room with a lamp. Axl will be dressed — I am putting that in writing so it is on the record. — Frankie",
    guests: [
      { first: "Mike", last: "Heck", status: "attending", meal: "filet", dietary: "" },
      { first: "Frankie", last: "Heck", status: "attending", meal: "chicken", dietary: "" },
      { first: "Axl", last: "Heck", status: "attending", meal: "filet", dietary: "Will eat whatever is nearest, including someone else's." },
      { first: "Sue", last: "Heck", status: "attending", meal: "salmon", dietary: "New braces — nothing that needs real chewing, and no caramel." },
      { first: "Brick", last: "Heck", status: "attending", meal: "kids", child: true, dietary: "He will be reading. A plate left beside him is fine." },
    ],
  },
];

// ── Seating ──────────────────────────────────────────────────────────────────

export const seatingTables = [
  { name: "Head Table", shape: "rect", capacity: 8, sort_order: 1 },
  { name: "Table 1", shape: "round", capacity: 10, sort_order: 2 },
  { name: "Table 2", shape: "round", capacity: 10, sort_order: 3 },
  { name: "Table 3", shape: "round", capacity: 10, sort_order: 4 },
  { name: "Table 4", shape: "round", capacity: 10, sort_order: 5 },
  { name: "Table 5", shape: "round", capacity: 8, sort_order: 6 },
  { name: "Table 6", shape: "round", capacity: 8, sort_order: 7 },
  { name: "Table 7", shape: "round", capacity: 8, sort_order: 8 },
  { name: "Sweetheart Nook", shape: "rect", capacity: 4, sort_order: 9 },
  { name: "Kids' Table", shape: "round", capacity: 6, sort_order: 10 },
];

/**
 * A few guests start pre-seated so the seating board isn't empty on first load,
 * but most are left unseated so there's something to drag. Matched by full name,
 * and seed.mjs warns when a name here matches nobody — so a typo is loud rather
 * than a silently empty table.
 *
 * Table 3 is the Rosewood six, who asked to sit together; the kids' table is
 * every guest flagged `child` except Roland Jr., whose group hasn't replied yet.
 */
export const initialSeating = {
  "Head Table": ["Lorelai Gilmore", "Luke Danes", "Rory Gilmore"],
  "Table 1": ["Gomez Addams", "Morticia Addams", "Thing Addams"],
  "Table 3": [
    "Aria Montgomery",
    "Ezra Fitz",
    "Spencer Hastings",
    "Toby Cavanaugh",
    "Emily Fields",
    "Maya St. Germain",
  ],
  "Kids' Table": [
    "Stewie Griffin",
    "Wednesday Addams",
    "Pugsley Addams",
    "Will Byers",
    "Jane Hopper",
  ],
};
