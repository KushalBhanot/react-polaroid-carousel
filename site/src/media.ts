// Free stock media for the demo. Photos: Unsplash License. Videos: Pexels License.
// Photographer credits live in site/CREDITS.md and the page footer.

const photo = (name: string) => `photos/${name}.webp`;

export const travel = [
  { src: photo("travel-beach"), alt: "Waves rolling onto a beach at golden hour", caption: "first swim of summer" },
  { src: photo("travel-lake"), alt: "Turquoise lake under snowy mountains", caption: "lake mornings" },
  { src: photo("travel-van"), alt: "Yellow camper van on a desert road", caption: "road trip!" },
  { src: photo("travel-city"), alt: "City skyline glittering at night", caption: "city lights" },
  { src: photo("travel-balloons"), alt: "Hot air balloons in a clear blue sky", caption: "up, up and away" },
];

export const products = [
  { src: photo("product-sunglasses"), alt: "Black club-style sunglasses on a white backdrop", name: "Club Shades", price: "$85" },
  { src: photo("product-watch"), alt: "Silver chronograph watch with a brown leather strap", name: "Field Chrono", price: "$340" },
  { src: photo("product-headphones"), alt: "Black wireless over-ear headphones", name: "Quiet Pro", price: "$279" },
  { src: photo("product-bag"), alt: "Woven brown leather tote bag", name: "Weave Tote", price: "$195" },
];

export const story = [
  { src: photo("story-hands"), alt: "A couple holding hands", caption: "where it started · 2019" },
  { src: photo("story-ring"), alt: "Two gold wedding bands", caption: "she said yes · 2023" },
  { src: photo("story-hill"), alt: "Bride and groom walking on a hill", caption: "the big day · 2025" },
  { src: photo("story-cake"), alt: "Four-tier white wedding cake with roses", caption: "cake first, always" },
  { src: photo("story-cheers"), alt: "Glasses on a wedding reception table", caption: "cheers to forever" },
];

export const homes = [
  { src: photo("home-exterior"), alt: "Modern white house with a pool", aspectRatio: "4 / 3", label: "Exterior · pool and garden" },
  { src: photo("home-living"), alt: "Bright living room with a grey sofa", aspectRatio: "4 / 3", label: "Living room · 32 m²" },
  { src: photo("home-kitchen"), alt: "White kitchen with an island and bar stools", aspectRatio: "4 / 3", label: "Kitchen · island seating" },
  { src: photo("home-bedroom"), alt: "Calm bedroom with a bedside lamp", aspectRatio: "4 / 3", label: "Main bedroom · 18 m²" },
];

export const recipe = [
  { src: photo("food-salad"), alt: "Colorful salad bowl", caption: "1 · prep the greens" },
  { src: photo("food-pasta"), alt: "Spaghetti twirled on a fork", caption: "2 · twirl the pasta" },
  { src: photo("food-cake"), alt: "Layered chocolate cherry cake", caption: "3 · dessert time" },
  { src: photo("food-latte"), alt: "Latte art being poured", caption: "4 · coffee to finish" },
];

// Sample testimonials for a made-up café, to show the layout. Not real reviews.
export const people = [
  {
    src: photo("person-1"),
    name: "Maya",
    role: "Regular since 2021",
    quote: "The oat flat white is the reason I get out of bed on Mondays.",
  },
  {
    src: photo("person-2"),
    name: "Daniel",
    role: "Works from the corner table",
    quote: "Fast wifi, kind baristas, and a playlist I keep asking about.",
  },
  {
    src: photo("person-3"),
    name: "Sofia",
    role: "Weekend brunch crew",
    quote: "Come for the pastries, stay because nobody rushes you out.",
  },
];

export const clips = [
  { src: "videos/waves.mp4", poster: "videos/waves.webp", alt: "Ocean waves breaking", caption: "salt air" },
  { src: "videos/coffee.mp4", poster: "videos/coffee.webp", alt: "Coffee being poured into a mug", caption: "slow mornings" },
  { src: "videos/forest.mp4", poster: "videos/forest.webp", alt: "Sunlight through trees in a misty meadow", caption: "golden hour" },
  { src: "videos/surf.mp4", poster: "videos/surf.webp", alt: "Surfers waiting for waves on a calm sea", caption: "waiting for a set" },
];

// A mix of every use case for the hero.
export const hero = [
  { src: photo("travel-van"), alt: "Yellow camper van on a desert road", caption: "road trip!" },
  { src: photo("story-hill"), alt: "Bride and groom walking on a hill", caption: "the big day" },
  { src: photo("food-latte"), alt: "Latte art being poured", caption: "sunday coffee" },
  { src: photo("travel-balloons"), alt: "Hot air balloons in a clear blue sky", caption: "up, up and away" },
  { src: photo("story-ring"), alt: "Two gold wedding bands", caption: "she said yes" },
  { src: photo("travel-lake"), alt: "Turquoise lake under snowy mountains", caption: "lake mornings" },
];

export const credits = {
  unsplash: [
    "oulashin", "vradenburg", "dinoreichmuth", "henning", "sadswim", "kiranck123", "ptaylor_", "ldpeterson11",
    "ikredenets", "jakenackos", "miracletwentyone", "petermiranda", "jeremywongweddings", "sandym10",
    "fotopettine", "thomasw", "photos_by_lanty", "webaliser", "rooke", "naomish", "chris_jolly",
    "picoftasty", "annapelzer", "jacob225", "fahmipaping",
  ],
  pexels: [
    { name: "Ahmed", url: "https://www.pexels.com/video/waves-of-the-ocean-9620654/" },
    { name: "Cup of Couple", url: "https://www.pexels.com/video/pouring-coffee-on-ceramic-cup-6963730/" },
    { name: "Matthias Groeneveld", url: "https://www.pexels.com/video/the-sun-is-shining-through-the-trees-in-the-grass-27100098/" },
    { name: "Neromanova", url: "https://www.pexels.com/video/surfing-20151149/" },
  ],
};
