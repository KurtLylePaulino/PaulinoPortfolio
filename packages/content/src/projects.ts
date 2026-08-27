import { projectSchema, type Domain, type Project } from "./schema.js";

const GH = "https://github.com/KurtLylePaulino";
const DOCS = "https://kurtlylepaulino.github.io/FullPortfolio/assets/docs";
const DEMOS = "https://kurtlylepaulino.github.io/FullPortfolio/projects";

const raw = [
  {
    id: "circuit-breakers",
    title: "Circuit Breakers",
    domain: "game",
    year: "2024-2026",
    featured: true,
    award: "Best Thesis, Best Paper, Best Presenter",
    tagline: "A 2D cybersecurity roguelike built in Unity",
    blurb:
      "A 2D roguelike that teaches cybersecurity through play. I was lead author on the paper and ran the numerical balancing across gameplay and the database systems.",
    summary:
      "Circuit Breakers turns cybersecurity concepts into roguelike runs. I owned the thesis and technical documentation, executed the numerical balancing for gameplay and the Firebase-backed database systems, and built features spanning UI, mechanics, and progression. It won Best Thesis, Best Paper, and Best Presenter.",
    stack: ["Unity", "C#", "Firebase", "Firestore"],
    highlights: [
      "Lead author on the award-winning thesis and technical documentation",
      "Numerical balancing across gameplay and database systems",
      "Built features from UI through core mechanics",
      "Firebase auth, stats, and achievements integration",
    ],
    metrics: [
      { label: "Awards", value: "3" },
      { label: "Engine", value: "Unity" },
      { label: "Role", value: "Lead author" },
    ],
    media: "img/projects/circuit-breakers.webp",
    links: [
      { label: "Read the thesis", href: `${DOCS}/IMRAD_FinalManuscript_CircuitBreakers.pdf`, kind: "primary" },
      { label: "Download build", href: "https://drive.google.com/drive/folders/1MR4GVBB7N-VR-IjFD2au542m6tY4nwLT" },
    ],
  },
  {
    id: "fightmap-generator",
    title: "Fightmap Generator",
    domain: "tool",
    year: "2026",
    featured: true,
    tagline: "Procedural battle-map generator with a CLI and a desktop app",
    blurb:
      "A dependency-light procedural generator for top-down tabletop battle maps. Six layout types across three themes, rendered to PNG with seeded, reproducible output.",
    summary:
      "Fightmap Generator builds top-down battle maps from plain algorithms rather than a model. A map is a 2D grid of tile types produced by room placement, corridor carving, and seeded value-noise scatter, then rendered in layers: noise-textured ground, raised objects with drop shadows, warm light glow, and a fog and vignette pass. Six layout archetypes (settlement, arena, dungeon, tomb, forest, wildlands) each render under any of three data-driven themes, giving 18 combinations, and a flood-fill check guarantees no walkable area is ever stranded. One numpy Generator threads through both generation and rendering, so the same seed reproduces byte-identical output. It runs as a CLI or a tkinter desktop app that packages into a standalone Windows executable, backed by a pytest suite covering tile and theme integrity, connectivity, noise determinism, reproducibility, the full type by theme matrix, and the CLI.",
    stack: ["Python", "Pillow", "NumPy", "tkinter", "pytest"],
    highlights: [
      "Six layout types across three themes, 18 combinations, from pure algorithms with no model involved",
      "Seeded numpy RNG threaded through generation and rendering, so one seed reproduces a byte-identical map",
      "Layered renderer: noise-textured ground, raised objects with drop shadows, light glow, fog and vignette",
      "Flood-fill connectivity guarantee, so no walkable region is ever stranded",
      "CLI plus tkinter desktop GUI, packageable to a standalone Windows executable",
    ],
    metrics: [
      { label: "Map types", value: "6" },
      { label: "Combinations", value: "18" },
      { label: "Interface", value: "CLI and GUI" },
    ],
    media: "img/projects/fightmap-generator.webp",
    links: [{ label: "View on GitHub", href: `${GH}/MapGenConcept`, kind: "primary" }],
  },
  {
    id: "canrael-codex",
    title: "The Canrael Codex",
    domain: "web",
    year: "2026",
    featured: true,
    tagline: "Dark-fantasy quote generator and worldbuilding companion",
    blurb:
      "A quote generator and worldbuilding companion for Canrael. 525 hand-written quotes across 8 regions, each region carrying its own ambient score and a concept-art scene gallery.",
    summary:
      "The Canrael Codex is a dark-fantasy quote generator built as a creative-support tool. It draws from 525 hand-written whispers, anonymous voices from across the continents, and filters them by 8 regions, each of which shifts the ambient music to match. A realm scene viewer opens a keyboard-navigable lightbox of concept art, roughly nine scenes per realm and 81 in total. Aged-parchment and silver-blue styling, an ember particle field, region-themed Web Audio ambience, synth sound effects, and keyboard shortcuts. Fully static and responsive with no build step and no dependencies.",
    stack: ["HTML", "CSS", "Vanilla JS", "Web Audio API", "GitHub Pages"],
    highlights: [
      "525 hand-written quotes spanning the world's many voices",
      "Realm scene viewer with a keyboard-navigable gallery of 81 concept-art scenes",
      "8 region filters, each with its own ambient score that shifts on selection",
      "Region-themed Web Audio ambience and synth effects over an ember particle field",
      "Fully responsive with zero dependencies and no build step",
    ],
    metrics: [
      { label: "Quotes", value: "525" },
      { label: "Scenes", value: "81" },
      { label: "Regions", value: "8" },
    ],
    media: "img/projects/canrael-codex.webp",
    demo: `${DEMOS}/canrael-codex/index.html`,
    links: [
      { label: "Open the demo", href: `${DEMOS}/canrael-codex/index.html`, kind: "primary" },
      { label: "View on GitHub", href: `${GH}/canrael-codex` },
    ],
  },
  {
    id: "melanoma-cnn",
    title: "Melanoma Skin Cancer Detection",
    domain: "ml",
    year: "2025",
    featured: false,
    tagline: "Convolutional neural network for dermoscopic image classification",
    blurb:
      "A CNN that classifies dermoscopic images as benign or malignant above 90% accuracy, with experiments comparing optimizers and activation functions.",
    summary:
      "A convolutional neural network built in TensorFlow and Keras that classifies dermoscopic images as benign or malignant above 90% accuracy. I ran several experimental iterations comparing optimizers and activation functions to identify the most stable convergence patterns, documented in the notebook. The shared folder bundles the trained model, saved checkpoints, the dataset, and the base notebooks.",
    stack: ["Python", "TensorFlow", "Keras", "NumPy", "Matplotlib"],
    highlights: [
      "Above 90% classification accuracy on benign against malignant",
      "Comparative experiments across optimizers and activation functions",
      "Convergence-stability analysis used to pick the strongest configuration",
      "Reproducible notebook with saved model checkpoints",
    ],
    metrics: [
      { label: "Accuracy", value: "90% and above" },
      { label: "Task", value: "Binary classification" },
      { label: "Framework", value: "TensorFlow and Keras" },
    ],
    links: [
      { label: "Models and dataset", href: "https://drive.google.com/drive/folders/13oZi_EPwOwdQE_8IwyITkMBv0eWrohD7", kind: "primary" },
      { label: "Download the notebook", href: `${DOCS}/melanoma_model.ipynb` },
    ],
  },
  {
    id: "haiku-daily",
    title: "Haiku Daily",
    domain: "web",
    year: "2025",
    featured: false,
    tagline: "One classical haiku per day over a living sumi-e scene",
    blurb:
      "A living sumi-e night scene that surfaces one public-domain haiku per day, brush-written line by line, with parallax Mt Fuji, fireflies, drifting petals, and a koto soundscape.",
    summary:
      "A zero-dependency static site that surfaces one public-domain haiku per day from the classical masters, chosen deterministically from the calendar date. It opens with a shoji-screen intro over a living sumi-e night scene: parallax Mt Fuji, a glowing moon, drifting cloud and mist, falling sakura petals, fireflies, and swaying paper lanterns, with each haiku brush-written line by line. Audio unlocks on first interaction with a looping koto track and a synthesized fallback, plus quiet synth interface effects that are ducked, rate-limited, and remembered. Keyboard controls throughout, and a reduced-motion fallback.",
    stack: ["HTML", "CSS", "Vanilla JS", "Web Audio API", "GitHub Pages"],
    highlights: [
      "Deterministic daily haiku chosen from the calendar date",
      "Living sumi-e scene with parallax Mt Fuji, fireflies, petals, and lanterns",
      "Looping koto track with a synthesized koto and shakuhachi fallback",
      "Shoji-screen intro with character-by-character brush calligraphy",
      "Keyboard controls and a reduced-motion fallback",
    ],
    metrics: [
      { label: "Dependencies", value: "0" },
      { label: "Build step", value: "None" },
      { label: "Audio", value: "Web Audio" },
    ],
    media: "img/projects/haiku-daily.webp",
    demo: `${DEMOS}/haiku-daily/index.html`,
    links: [
      { label: "Open the demo", href: `${DEMOS}/haiku-daily/index.html`, kind: "primary" },
      { label: "View on GitHub", href: `${GH}/HaikuDaily` },
    ],
  },
  {
    id: "jianghu-proverbs",
    title: "Jianghu Proverbs",
    domain: "web",
    year: "2025",
    featured: false,
    tagline: "200 attributed Chinese proverbs on a living wuxia scroll",
    blurb:
      "A living wuxia silk-scroll that rolls a random Chinese proverb from 200 classics, with animated scenery, looping music, a synthesized Web Audio soundscape, and brush-on-screen calligraphy.",
    summary:
      "A single-page static site staged as a living wuxia scene: a hanging silk scroll on aged rice paper, swaying red lanterns, parallax mountains with a distant pagoda, a breathing moon, and falling plum-blossom petals. It rolls a random proverb from 200 classics across 79 sources, including Confucius, Laozi, Sun Tzu, and Li Bai, with original text, pinyin, English, and full attribution. Each draw slashes a glint across the paper, brush-writes the proverb character by character, and stamps an index seal. A click-to-enter gate unlocks a looping erhu-style track and a fully synthesized soundscape of temple bell, fortune-stick rattle, sword glint, brush ticks, and seal thunk, all generated live with no sound files.",
    stack: ["HTML", "CSS", "Vanilla JS", "Web Audio API", "GitHub Pages"],
    highlights: [
      "200 attributed proverbs across 79 sources",
      "Looping music plus a fully synthesized Web Audio soundscape with no sound files",
      "Animated scenery: parallax mountains, swaying lanterns, petals, breathing moon",
      "Cinematic opening sequence with character-by-character brush calligraphy",
      "Keyboard controls and a reduced-motion fallback",
    ],
    metrics: [
      { label: "Proverbs", value: "200" },
      { label: "Sources", value: "79" },
      { label: "Audio", value: "Web Audio" },
    ],
    media: "img/projects/jianghu-proverbs.webp",
    demo: `${DEMOS}/jianghu-proverbs/index.html`,
    links: [
      { label: "Open the demo", href: `${DEMOS}/jianghu-proverbs/index.html`, kind: "primary" },
      { label: "View on GitHub", href: `${GH}/jianghu-proverbs` },
    ],
  },
  {
    id: "library-system",
    title: "Library Management System",
    domain: "web",
    year: "2024",
    featured: false,
    tagline: "Multi-role library platform with activity logging",
    blurb:
      "A library platform tracking books, users, and activity across Admin, Librarian, and Borrower roles, with activity logging and transaction records.",
    summary:
      "A web platform that tracks books, users, and activity across three roles: Admin, Librarian, and Borrower. I built the CRUD systems, the user-activity logging, and the transaction records, and designed the interactions and feedback flows between all three user types.",
    stack: ["HTML", "CSS", "JavaScript"],
    highlights: [
      "Three role types: Admin, Librarian, and Borrower",
      "Full CRUD for books and users",
      "User-activity logging and transaction records",
      "Cross-role interaction and feedback flows",
    ],
    metrics: [
      { label: "Roles", value: "3" },
      { label: "Domain", value: "CRUD" },
    ],
    links: [
      { label: "View on GitHub", href: `${GH}/Finals-Project-Webdev-LIBRARYMANAGEMENT`, kind: "primary" },
    ],
  },
];

/** Parsed at module load, so bad data fails the build rather than a page. */
export const projects: Project[] = raw.map((entry) => projectSchema.parse(entry));

export const featuredProjects: Project[] = projects.filter((p) => p.featured);

export function projectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** Derived from the data so a new domain needs no code change. */
export function domainsInUse(): Domain[] {
  return [...new Set(projects.map((p) => p.domain))];
}
