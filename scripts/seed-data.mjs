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
    body: `Hackettstown sits in the hills of northwest New Jersey, about an hour from Newark and a little over an hour from Manhattan. Below you'll find written directions from every direction, two hotels holding rooms for us, and a shuttle that means nobody has to think about driving.`,
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
    name: "The Warren House Inn",
    address: "412 Mountain Avenue, Hackettstown, NJ 07840",
    phone: "(908) 555-0188",
    rate: "$179 / night",
    block_code: "REIDWED27",
    cutoff: "Book by August 17, 2027",
    distance: "0.6 miles from the venue — about a 12-minute walk",
    booking_url: "https://example.com/warren-house-inn/reserve?block=REIDWED27",
    notes:
      "Our recommendation, and where most of the family is staying. A restored 1890s brick hotel on the edge of town with 42 rooms, a decent bar that will stay open late for us, and breakfast included. Mention the block code by phone or use the link — the discounted rate does not appear on the public booking page.",
    sort_order: 1,
  },
  {
    name: "Musconetcong Lodge & Suites",
    address: "1900 Route 46 East, Netcong, NJ 07857",
    phone: "(973) 555-0264",
    rate: "$139 / night",
    block_code: "JT0917",
    cutoff: "Book by August 24, 2027",
    distance: "6.4 miles from the venue — about 11 minutes by car",
    booking_url: "https://example.com/musconetcong-lodge/reserve?group=JT0917",
    notes:
      "The practical option: newer, larger rooms, free parking, an indoor pool, and suites that sleep four if you're travelling with kids. Slightly out of town, but it's the second shuttle stop so you're covered either way.",
    sort_order: 2,
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
    location: "The Warren House Inn — the back bar",
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
    title: "Shuttle departs the Musconetcong Lodge",
    location: "Musconetcong Lodge & Suites — main entrance",
    description:
      "First pickup. Two coaches, about 25 minutes to the venue with the Warren House stop in between. Please be outside five minutes early.",
    attire: "",
    sort_order: 3,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "3:40 PM",
    title: "Shuttle departs The Warren House Inn",
    location: "The Warren House Inn — Mountain Avenue entrance",
    description:
      "Second pickup, arriving at the inn around 3:55. If you'd rather walk it, it's twelve flat minutes down High Street.",
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
      "Two runs back to both hotels, Warren House first. The 11:45 is the last one — after that it's a fifteen-minute cab and a long wait for it.",
    attire: "",
    sort_order: 11,
  },
  {
    day_label: "Friday, September 17 — Wedding Day",
    day_order: 2,
    time_label: "11:15 PM — late",
    title: "After Party",
    location: "The Warren House Inn — the back bar",
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
    location: "The Warren House Inn — the sun room",
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
      "Children who are named on your invitation are absolutely invited, and there's a kids' meal option on the RSVP form. Beyond that we're keeping the evening mostly adults — the reception runs late and the bar is central to the plan. Both hotels can recommend sitters, and a few families are splitting one; email us and we'll connect you.",
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
      "Everything lives on the Travel page: written directions from all four directions, an embedded map, and the two hotels holding discounted rooms for us. Book through those blocks before the cutoff dates — the rates aren't available on the public booking pages.",
    category: "Travel",
    sort_order: 7,
  },
  {
    question: "Is there a shuttle?",
    answer:
      "Yes, and please use it. Two coaches run from both hotels before the ceremony and make two return trips at 11:00 and 11:45 PM. Exact times are on the Schedule page. It's free, it's included, and it means nobody has to make a decision about driving at eleven o'clock at night.",
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

// ── Guest list: 14 parties, 41 guests ────────────────────────────────────────
// `status` values seed a realistic mix so the admin dashboard has real numbers.
// A party with any responded guest also gets an rsvp_submissions row.

export const parties = [
  {
    name: "The Mitchell Family",
    invite_code: "MITCH01",
    address: "18 Ridgeview Terrace, Morristown, NJ 07960",
    side: "bride",
    notes: "Jenna's aunt and uncle. Uncle David will ask about the open bar. Emma is 9.",
    message:
      "We would not miss this for anything in the world. David is already talking about the bar. Emma has asked twice whether there will be a dance floor — please confirm there will be a dance floor.",
    guests: [
      { first: "Sarah", last: "Mitchell", status: "attending", meal: "salmon", dietary: "" },
      { first: "David", last: "Mitchell", status: "attending", meal: "filet", dietary: "" },
      { first: "Emma", last: "Mitchell", status: "attending", meal: "kids", child: true, dietary: "No nuts of any kind — she carries an EpiPen." },
    ],
  },
  {
    name: "Margaret Whitfield",
    invite_code: "WHITF02",
    address: "7 Chestnut Lane, Chatham, NJ 07928",
    side: "bride",
    notes: "Jenna's grandmother. Seat her near the family and away from the band's speakers.",
    message:
      "Of course I am coming. I have had the dress since March. Put me somewhere I can see everything and hear something.",
    guests: [
      { first: "Margaret", last: "Whitfield", status: "attending", meal: "chicken", dietary: "Low sodium if the kitchen can manage it." },
    ],
  },
  {
    name: "Daniel & Priya Rao",
    invite_code: "RAO03",
    address: "2214 W Cortland Street, Chicago, IL 60647",
    side: "groom",
    notes: "Tom's college roommate. Flying in Thursday; Priya is the one who set them up, indirectly.",
    message:
      "Flying in Thursday afternoon so count us in for welcome drinks. Priya maintains that she is responsible for this entire relationship and honestly the record supports her.",
    guests: [
      { first: "Daniel", last: "Rao", status: "attending", meal: "filet", dietary: "" },
      { first: "Priya", last: "Rao", status: "attending", meal: "vegetarian", dietary: "Vegetarian, no egg." },
    ],
  },
  {
    name: "The Okonkwo Family",
    invite_code: "OKON04",
    address: "51 Harborview Road, Stamford, CT 06902",
    side: "groom",
    notes: "Tom's cousin. Twins are 7 — both kids' meals.",
    message:
      "All four of us are in. The twins have been informed that this is a fancy party and are taking it extremely seriously.",
    guests: [
      { first: "Chidi", last: "Okonkwo", status: "attending", meal: "chicken", dietary: "" },
      { first: "Amara", last: "Okonkwo", status: "attending", meal: "salmon", dietary: "Shellfish allergy — cocktail hour raw bar is a problem." },
      { first: "Zara", last: "Okonkwo", status: "attending", meal: "kids", child: true, dietary: "" },
      { first: "Kene", last: "Okonkwo", status: "attending", meal: "kids", child: true, dietary: "" },
    ],
  },
  {
    name: "Robert & Linda Callahan",
    invite_code: "CALLA05",
    address: "912 Beech Street, Bethlehem, PA 18018",
    side: "groom",
    notes: "Tom's parents' oldest friends. Robert is walking with a cane since March.",
    message:
      "Wouldn't dream of missing it. Robert is using a cane these days so a table with a short walk from the door would be a real kindness.",
    guests: [
      { first: "Robert", last: "Callahan", status: "attending", meal: "filet", dietary: "" },
      { first: "Linda", last: "Callahan", status: "attending", meal: "vegetarian", dietary: "Gluten free — celiac, not a preference." },
    ],
  },
  {
    name: "Elena Vasquez & Marcus Webb",
    invite_code: "VASQ06",
    address: "440 Dean Street, Apt 5C, Brooklyn, NY 11217",
    side: "bride",
    notes: "Jenna's closest friend from grad school. Elena is a bridesmaid.",
    message:
      "Obviously. Let me know what you need me to carry, hold, or fix on the day — I am extremely available.",
    guests: [
      { first: "Elena", last: "Vasquez", status: "attending", meal: "salmon", dietary: "" },
      { first: "Marcus", last: "Webb", status: "attending", meal: "filet", dietary: "" },
    ],
  },
  {
    name: "James Whitfield",
    invite_code: "WHITF07",
    address: "88 Larkspur Avenue, Denver, CO 80206",
    side: "bride",
    notes: "Jenna's cousin. Was a maybe for months because of a work trip.",
    message:
      "I am so sorry — the Singapore rotation lands exactly that week and I cannot move it. I will be insufferable about wanting photos. Save me a slice of something.",
    guests: [
      { first: "James", last: "Whitfield", status: "declined", meal: null, dietary: "" },
    ],
  },
  {
    name: "The Brennan Family",
    invite_code: "BREN08",
    address: "33 Oakhurst Drive, Wayne, NJ 07470",
    side: "bride",
    notes: "Family friends. Sean's plus one is named on the invitation.",
    message: "Three yeses and one regret — Colleen has a conflict she cannot get out of. The rest of us will make up for her.",
    guests: [
      { first: "Patrick", last: "Brennan", status: "attending", meal: "chicken", dietary: "" },
      { first: "Colleen", last: "Brennan", status: "declined", meal: null, dietary: "" },
      { first: "Sean", last: "Brennan", status: "attending", meal: "filet", dietary: "" },
      { first: "Nora", last: "Brennan", status: "attending", meal: "vegetarian", dietary: "Vegan if that's possible — happy with whatever if not." },
    ],
  },
  {
    name: "Dr. Yusuf & Hana Demir",
    invite_code: "DEMIR09",
    address: "76 Fairfield Road, Princeton, NJ 08540",
    side: "groom",
    notes: "Tom's mentor from his first job. No pork, and they don't drink.",
    message:
      "We are honored to be asked and will be there. No alcohol for either of us — a good non-alcoholic option would be very welcome.",
    guests: [
      { first: "Yusuf", last: "Demir", status: "attending", meal: "salmon", dietary: "Halal — no pork, no alcohol in the sauces." },
      { first: "Hana", last: "Demir", status: "attending", meal: "chicken", dietary: "Halal." },
    ],
  },
  {
    name: "Katie O'Sullivan & Guest",
    invite_code: "OSULL10",
    address: "1219 Spring Garden Street, Philadelphia, PA 19123",
    side: "bride",
    notes: "Jenna's coworker. Plus one still unnamed as of the last email.",
    message: "",
    guests: [
      { first: "Katie", last: "O'Sullivan", status: "pending", meal: null, dietary: "" },
      { first: "Guest of", last: "Katie O'Sullivan", status: "pending", meal: null, dietary: "" },
    ],
  },
  {
    name: "The Lindqvist Family",
    invite_code: "LIND11",
    address: "Sturegatan 42, 114 36 Stockholm, Sweden",
    side: "groom",
    notes: "Tom's mother's side. Travelling the furthest by a wide margin.",
    message: "",
    guests: [
      { first: "Anders", last: "Lindqvist", status: "pending", meal: null, dietary: "" },
      { first: "Ingrid", last: "Lindqvist", status: "pending", meal: null, dietary: "" },
      { first: "Otto", last: "Lindqvist", status: "pending", meal: null, dietary: "" },
    ],
  },
  {
    name: "Grace & Tomás Ferreira",
    invite_code: "FERR12",
    address: "605 Alder Court, Raleigh, NC 27601",
    side: "bride",
    notes: "Jenna's cousin. Grace is due in June — check on the drive.",
    message:
      "We're in! Grace will be about three months out from the baby so she'll be the one holding a lime seltzer all night. No special treatment needed, just a heads up.",
    guests: [
      { first: "Grace", last: "Ferreira", status: "attending", meal: "chicken", dietary: "No unpasteurized cheese or raw fish — pregnant." },
      { first: "Tomás", last: "Ferreira", status: "attending", meal: "filet", dietary: "" },
    ],
  },
  {
    name: "Walter & Joan Prescott",
    invite_code: "PRES13",
    address: "24 Sagamore Way, Sarasota, FL 34236",
    side: "groom",
    notes: "Tom's great-aunt and uncle. Walter is 84; travel was always going to be the question.",
    message:
      "Our doctor has ruled out the flight, which we are heartbroken about. We will be raising a glass to you both at exactly 4:30 from the porch in Florida. Send pictures, and come see us.",
    guests: [
      { first: "Walter", last: "Prescott", status: "declined", meal: null, dietary: "" },
      { first: "Joan", last: "Prescott", status: "declined", meal: null, dietary: "" },
    ],
  },
  {
    name: "Nathan Reyes",
    invite_code: "REYES14",
    address: "3380 Sunset Boulevard, Apt 12, Los Angeles, CA 90026",
    side: "groom",
    notes: "Tom's brother — best man. Giving the rehearsal dinner toast.",
    message:
      "Best man reporting for duty. I have four minutes of material and I have been told that is three minutes too many. Flying in Wednesday.",
    guests: [
      { first: "Nathan", last: "Reyes", status: "attending", meal: "filet", dietary: "" },
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
 * but most are left unseated so there's something to drag. Matched by full name.
 */
export const initialSeating = {
  "Head Table": ["Nathan Reyes", "Elena Vasquez", "Marcus Webb"],
  "Table 1": ["Sarah Mitchell", "David Mitchell", "Margaret Whitfield"],
  "Kids' Table": ["Emma Mitchell", "Zara Okonkwo", "Kene Okonkwo"],
};
