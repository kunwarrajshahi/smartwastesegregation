/**
 * EcoSort AI Design System Tokens
 * Defines reusable colors, typography, and complete metadata for all 9 RealWaste categories.
 */

export const COLORS = {
  background: '#F7FAF8',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F2',
  surfaceMuted: '#E8EFEA',
  border: '#E2E8F0',
  borderSubtle: '#EDF2EE',

  // Primary Forest Green Palette
  forest: {
    50: '#F0F7F3',
    100: '#DDEFE4',
    200: '#BDDFC9',
    300: '#91C8A5',
    400: '#5EAB7C',
    500: '#3D8F5C',
    600: '#2C7247',
    700: '#1E5A37',
    800: '#154429', // Main primary brand color
    900: '#0E301D',
    950: '#071C10',
  },

  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

/**
 * 9 Standard RealWaste Dataset Categories
 * Includes disposal guidelines, recyclability classification, bin types, and color styling.
 */
export const WASTE_CATEGORIES = {
  cardboard: {
    id: 'cardboard',
    name: 'Cardboard',
    label: 'Cardboard',
    recyclability: 'Recyclable',
    recyclabilityType: 'recyclable',
    binName: 'Blue Recycling Bin',
    binColor: '#2563EB',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
    description: 'Corrugated boxes, packaging cartons, paperboard boxes, shipping containers.',
    disposalGuide: 'Flatten boxes to save space. Remove heavy plastic packing tape and shipping labels if feasible. Keep dry.',
    environmentalTip: 'Recycling 1 ton of cardboard saves 9 cubic yards of landfill space and 46 gallons of oil.',
    sampleImages: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    ],
  },
  food_organics: {
    id: 'food_organics',
    name: 'Food Organics',
    label: 'Food Organics',
    recyclability: 'Compostable',
    recyclabilityType: 'compostable',
    binName: 'Green Compost Bin',
    binColor: '#16A34A',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
    description: 'Fruit peels, vegetable trimmings, coffee grounds, eggshells, leftover food scraps.',
    disposalGuide: 'Deposit into organic compost receptacle or municipal green bin. Remove any plastic stickers, twist ties, or produce netting.',
    environmentalTip: 'Composting food organics reduces methane greenhouse emissions from landfills and produces nutrient-rich soil.',
    sampleImages: [
      'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=600&auto=format&fit=crop&q=80',
    ],
  },
  glass: {
    id: 'glass',
    name: 'Glass',
    label: 'Glass',
    recyclability: 'Recyclable',
    recyclabilityType: 'recyclable',
    binName: 'Teal Glass Bin',
    binColor: '#0D9488',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    dot: 'bg-teal-600',
    description: 'Clear, green, and amber beverage bottles, food jars, condiment containers.',
    disposalGuide: 'Rinse out remaining contents. Remove metal lids and bottle caps (recycle separately in metal stream). Do not break glass.',
    environmentalTip: 'Glass is 100% recyclable and can be recycled endlessly without any loss in purity or quality.',
    sampleImages: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    ],
  },
  metal: {
    id: 'metal',
    name: 'Metal',
    label: 'Metal',
    recyclability: 'Recyclable',
    recyclabilityType: 'recyclable',
    binName: 'Yellow Metal Bin',
    binColor: '#D97706',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-600',
    description: 'Aluminum beverage cans, tin food cans, clean aluminum foil, aerosol cans (empty).',
    disposalGuide: 'Rinse cans clean. Push lid inside or recycle detached. Ensure aerosol cans are completely discharged.',
    environmentalTip: 'Recycling aluminum cans saves 95% of the energy needed to make new cans from raw bauxite ore.',
    sampleImages: [
      'https://images.unsplash.com/photo-1574974671999-24b7dfa1593f?w=600&auto=format&fit=crop&q=80',
    ],
  },
  miscellaneous_trash: {
    id: 'miscellaneous_trash',
    name: 'Miscellaneous Trash',
    label: 'Misc Trash',
    recyclability: 'Non-Recyclable',
    recyclabilityType: 'non_recyclable',
    binName: 'Grey Landfill Bin',
    binColor: '#64748B',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
    description: 'Soiled packaging, plastic straws, styrofoam cups, composite multi-layer snack wrappers.',
    disposalGuide: 'Place in designated general residual waste bin. Bag tightly to prevent litter dispersal.',
    environmentalTip: 'Minimize single-use plastics and non-recyclable composite packaging whenever reusable alternatives exist.',
    sampleImages: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    ],
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    label: 'Paper',
    recyclability: 'Recyclable',
    recyclabilityType: 'recyclable',
    binName: 'Blue Paper Bin',
    binColor: '#0284C7',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    dot: 'bg-sky-600',
    description: 'Office printer paper, newspapers, magazines, brochures, paper envelopes, paper bags.',
    disposalGuide: 'Keep clean and dry. Do not recycle paper contaminated with grease or food oils (e.g. greasy pizza box liners).',
    environmentalTip: 'Recycling 1 ton of office paper saves 17 trees, 7,000 gallons of water, and 4,100 kilowatt-hours of electricity.',
    sampleImages: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    ],
  },
  plastic: {
    id: 'plastic',
    name: 'Plastic',
    label: 'Plastic',
    recyclability: 'Recyclable',
    recyclabilityType: 'recyclable',
    binName: 'Blue Plastics Bin',
    binColor: '#2563EB',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    dot: 'bg-indigo-600',
    description: 'PET water bottles, HDPE milk jugs, detergent containers, plastic tubs (resin codes #1, #2, #5).',
    disposalGuide: 'Empty liquids completely, rinse, and replace the cap. Avoid recycling plastic bags in standard curbside bins.',
    environmentalTip: 'Recycled PET flakes are pelletized to make new beverage containers, fleece garments, and durable textiles.',
    sampleImages: [
      'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
    ],
  },
  textile_trash: {
    id: 'textile_trash',
    name: 'Textile Trash',
    label: 'Textile Trash',
    recyclability: 'Special Disposal',
    recyclabilityType: 'special',
    binName: 'Purple Textile Depot',
    binColor: '#9333EA',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dot: 'bg-purple-600',
    description: 'Old clothing, worn fabrics, shoes, rags, polyester sheets, damaged garments.',
    disposalGuide: 'Clean and dry textiles should be deposited at clothing donation bins or textile fiber reclamation centers.',
    environmentalTip: 'Textile recovery keeps synthetic non-biodegradable fibers out of landfills and reduces raw cotton irrigation demand.',
    sampleImages: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
    ],
  },
  vegetation: {
    id: 'vegetation',
    name: 'Vegetation',
    label: 'Vegetation',
    recyclability: 'Compostable',
    recyclabilityType: 'compostable',
    binName: 'Green Yard Waste Bin',
    binColor: '#15803D',
    bg: 'bg-forest-50',
    text: 'text-forest-800',
    border: 'border-forest-200',
    dot: 'bg-forest-600',
    description: 'Fallen leaves, garden clippings, grass trimmings, small branches, weeds, plant prunings.',
    disposalGuide: 'Collect into yard debris bags or unlined green bin. Keep free of stones, treated lumber, plastic mulch, or trash.',
    environmentalTip: 'Municipal yard waste is shredded into organic mulch and commercial compost for local agriculture and parks.',
    sampleImages: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    ],
  },
};

/**
 * Normalizes input category strings to keys in WASTE_CATEGORIES
 */
export function normalizeCategoryKey(cat) {
  if (!cat) return 'miscellaneous_trash';
  const clean = String(cat).trim().toLowerCase().replace(/[\s-]+/g, '_');

  if (WASTE_CATEGORIES[clean]) return clean;

  // Aliases & shortcuts
  if (clean.includes('cardboard')) return 'cardboard';
  if (clean.includes('food') || clean.includes('organic')) return 'food_organics';
  if (clean.includes('glass')) return 'glass';
  if (clean.includes('metal')) return 'metal';
  if (clean.includes('misc') || clean.includes('trash') || clean.includes('landfill')) return 'miscellaneous_trash';
  if (clean.includes('paper')) return 'paper';
  if (clean.includes('plastic')) return 'plastic';
  if (clean.includes('textile')) return 'textile_trash';
  if (clean.includes('vegetation') || clean.includes('yard')) return 'vegetation';

  return 'miscellaneous_trash';
}

export const STATUS_TYPES = {
  verified: {
    label: 'Verified',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  flagged: {
    label: 'Flagged for Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  processing: {
    label: 'Analyzing',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500 animate-pulse',
  },
  diverted: {
    label: 'Diverted',
    bg: 'bg-forest-50',
    text: 'text-forest-800',
    border: 'border-forest-200',
    dot: 'bg-forest-600',
  },
};
