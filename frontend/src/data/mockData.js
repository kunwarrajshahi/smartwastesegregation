/**
 * Realistic Mock Data & Evaluation Benchmarks for Smart Waste Segregation
 * Based on the RealWaste dataset (4,752 images across 9 classes) and fine-tuned ResNet18 model.
 * Note: Clearly labeled for demonstration until live database integration is activated.
 */

export const DATASET_METRICS = {
  totalImagesClassified: {
    title: 'Total Images Classified',
    value: '4,752',
    unit: 'samples',
    change: '+12.4%',
    changeType: 'increase',
    period: 'RealWaste dataset',
    progress: 100,
  },
  modelAccuracy: {
    title: 'ResNet18 Test Accuracy',
    value: '74.2%',
    unit: 'top-1',
    change: '77.0% macro prec',
    changeType: 'increase',
    period: '951 test images',
    progress: 74.2,
  },
  totalRecyclableWaste: {
    title: 'Total Recyclable Waste',
    value: '3,420',
    unit: 'kg',
    change: '72.0% of total',
    changeType: 'increase',
    period: 'diverted from landfill',
    progress: 72,
  },
  supportedCategoriesCount: {
    title: 'Supported Waste Classes',
    value: '9',
    unit: 'categories',
    change: '100% active',
    changeType: 'increase',
    period: 'optical recognition',
    progress: 100,
  },
};

/**
 * Weekly Scanning Activity (Scans classified per day)
 */
export const WEEKLY_ACTIVITY = [
  { day: 'Mon', scans: 642, recyclable: 460, compostable: 130, residual: 52 },
  { day: 'Tue', scans: 715, recyclable: 520, compostable: 145, residual: 50 },
  { day: 'Wed', scans: 680, recyclable: 490, compostable: 140, residual: 50 },
  { day: 'Thu', scans: 810, recyclable: 590, compostable: 165, residual: 55 },
  { day: 'Fri', scans: 890, recyclable: 640, compostable: 180, residual: 70 },
  { day: 'Sat', scans: 540, recyclable: 380, compostable: 110, residual: 50 },
  { day: 'Sun', scans: 475, recyclable: 340, compostable: 95, residual: 40 },
];

/**
 * Complete RealWaste Category Distribution (Based on the 4,752 image dataset)
 */
export const CATEGORY_DISTRIBUTION = [
  { name: 'Plastic', key: 'plastic', value: 921, percentage: 19.4, color: '#2563EB', recyclability: 'Recyclable' },
  { name: 'Metal', key: 'metal', value: 790, percentage: 16.6, color: '#D97706', recyclability: 'Recyclable' },
  { name: 'Paper', key: 'paper', value: 501, percentage: 10.5, color: '#0284C7', recyclability: 'Recyclable' },
  { name: 'Misc Trash', key: 'miscellaneous_trash', value: 495, percentage: 10.4, color: '#64748B', recyclability: 'Non-Recyclable' },
  { name: 'Cardboard', key: 'cardboard', value: 461, percentage: 9.7, color: '#3B82F6', recyclability: 'Recyclable' },
  { name: 'Vegetation', key: 'vegetation', value: 435, percentage: 9.2, color: '#15803D', recyclability: 'Compostable' },
  { name: 'Glass', key: 'glass', value: 420, percentage: 8.8, color: '#0D9488', recyclability: 'Recyclable' },
  { name: 'Food Organics', key: 'food_organics', value: 411, percentage: 8.6, color: '#16A34A', recyclability: 'Compostable' },
  { name: 'Textile Trash', key: 'textile_trash', value: 318, percentage: 6.7, color: '#9333EA', recyclability: 'Special' },
];

/**
 * Model Performance Per Category (from evaluation_results/classification_report.txt)
 */
export const MODEL_CLASS_PERFORMANCE = [
  { category: 'Food Organics', precision: 0.93, recall: 0.81, f1: 0.86, samples: 77 },
  { category: 'Metal', precision: 0.88, recall: 0.60, f1: 0.71, samples: 154 },
  { category: 'Cardboard', precision: 0.86, recall: 0.71, f1: 0.78, samples: 91 },
  { category: 'Paper', precision: 0.79, recall: 0.82, f1: 0.80, samples: 107 },
  { category: 'Glass', precision: 0.75, recall: 0.80, f1: 0.77, samples: 88 },
  { category: 'Miscellaneous Trash', precision: 0.74, recall: 0.40, f1: 0.52, samples: 101 },
  { category: 'Vegetation', precision: 0.73, recall: 0.98, f1: 0.83, samples: 95 },
  { category: 'Textile Trash', precision: 0.65, recall: 0.61, f1: 0.63, samples: 57 },
  { category: 'Plastic', precision: 0.62, recall: 0.90, f1: 0.73, samples: 181 },
];

/**
 * Recyclable vs Compostable vs Non-Recyclable Summary
 */
export const RECYCLABILITY_SUMMARY = [
  { name: 'Recyclable Streams', value: 65.0, count: 3093, color: '#2563EB', subtext: 'Plastic, Metal, Paper, Cardboard, Glass' },
  { name: 'Organic Compostable', value: 17.8, count: 846, color: '#16A34A', subtext: 'Food Organics, Vegetation' },
  { name: 'Residual / Special', value: 17.2, count: 813, color: '#64748B', subtext: 'Misc Trash, Textile Wastes' },
];

/**
 * Sample Scans for Initial Preview & Demo History (clearly distinguished as preview data)
 */
export const INITIAL_PREDICTION_HISTORY = [
  {
    id: 'SCN-1089',
    filename: 'water_bottle_pet.jpg',
    item: 'Clear PET Water Bottle',
    category: 'plastic',
    confidence: 0.9638,
    timestamp: '2026-10-31 01:54',
    timeAgo: '4 mins ago',
    fileSize: '1.4 MB',
    destinationBin: 'Blue Plastics Bin',
    disposalGuide: 'Empty liquid, rinse clean, replace screw cap.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Plastic', confidence: 0.9638 },
      { category: 'Glass', confidence: 0.0210 },
      { category: 'Paper', confidence: 0.0080 },
    ],
  },
  {
    id: 'SCN-1088',
    filename: 'amazon_shipping_box.png',
    item: 'Corrugated Shipping Carton',
    category: 'cardboard',
    confidence: 0.9412,
    timestamp: '2026-10-31 01:42',
    timeAgo: '16 mins ago',
    fileSize: '2.1 MB',
    destinationBin: 'Blue Recycling Bin',
    disposalGuide: 'Flatten flat to save volume. Remove packing tape.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Cardboard', confidence: 0.9412 },
      { category: 'Paper', confidence: 0.0450 },
      { category: 'Miscellaneous Trash', confidence: 0.0080 },
    ],
  },
  {
    id: 'SCN-1087',
    filename: 'apple_core_banana_peels.jpg',
    item: 'Fresh Fruit Kitchen Waste',
    category: 'food_organics',
    confidence: 0.9855,
    timestamp: '2026-10-31 01:28',
    timeAgo: '30 mins ago',
    fileSize: '890 KB',
    destinationBin: 'Green Compost Bin',
    disposalGuide: 'Deposit into organic food scraps bucket. Remove any plastic stickers.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Food Organics', confidence: 0.9855 },
      { category: 'Vegetation', confidence: 0.0120 },
      { category: 'Miscellaneous Trash', confidence: 0.0015 },
    ],
  },
  {
    id: 'SCN-1086',
    filename: 'crushed_aluminum_can.jpg',
    item: 'Aluminum Soda Can',
    category: 'metal',
    confidence: 0.9720,
    timestamp: '2026-10-31 00:58',
    timeAgo: '1 hour ago',
    fileSize: '1.1 MB',
    destinationBin: 'Yellow Metal Bin',
    disposalGuide: 'Rinse out soda residue. Can be compacted.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1574974671999-24b7dfa1593f?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Metal', confidence: 0.9720 },
      { category: 'Plastic', confidence: 0.0190 },
      { category: 'Miscellaneous Trash', confidence: 0.0050 },
    ],
  },
  {
    id: 'SCN-1085',
    filename: 'olive_oil_glass_jar.png',
    item: 'Amber Glass Bottle',
    category: 'glass',
    confidence: 0.9510,
    timestamp: '2026-10-31 00:34',
    timeAgo: '1.5 hours ago',
    fileSize: '1.8 MB',
    destinationBin: 'Teal Glass Bin',
    disposalGuide: 'Rinse thoroughly. Recycle metal lid separately.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Glass', confidence: 0.9510 },
      { category: 'Plastic', confidence: 0.0380 },
      { category: 'Miscellaneous Trash', confidence: 0.0070 },
    ],
  },
  {
    id: 'SCN-1084',
    filename: 'garden_fallen_leaves.jpg',
    item: 'Dry Garden Foliage & Twigs',
    category: 'vegetation',
    confidence: 0.9670,
    timestamp: '2026-10-30 23:45',
    timeAgo: '2 hours ago',
    fileSize: '2.5 MB',
    destinationBin: 'Green Yard Waste Bin',
    disposalGuide: 'Collect into unlined yard waste bin for municipal mulching.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Vegetation', confidence: 0.9670 },
      { category: 'Food Organics', confidence: 0.0240 },
      { category: 'Miscellaneous Trash', confidence: 0.0060 },
    ],
  },
  {
    id: 'SCN-1083',
    filename: 'office_reports_printout.png',
    item: 'Printed Office Paper Stack',
    category: 'paper',
    confidence: 0.9320,
    timestamp: '2026-10-30 22:15',
    timeAgo: '4 hours ago',
    fileSize: '1.2 MB',
    destinationBin: 'Blue Paper Bin',
    disposalGuide: 'Keep dry. Remove metal binder clips.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Paper', confidence: 0.9320 },
      { category: 'Cardboard', confidence: 0.0510 },
      { category: 'Miscellaneous Trash', confidence: 0.0120 },
    ],
  },
  {
    id: 'SCN-1082',
    filename: 'styrofoam_takeout_tray.jpg',
    item: 'Greasy Polystyrene Container',
    category: 'miscellaneous_trash',
    confidence: 0.8920,
    timestamp: '2026-10-30 21:00',
    timeAgo: '5 hours ago',
    fileSize: '950 KB',
    destinationBin: 'Grey Landfill Bin',
    disposalGuide: 'Non-recyclable contaminated foam. Bag securely in landfill waste.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Miscellaneous Trash', confidence: 0.8920 },
      { category: 'Plastic', confidence: 0.0820 },
      { category: 'Cardboard', confidence: 0.0180 },
    ],
  },
  {
    id: 'SCN-1081',
    filename: 'cotton_tshirt_rag.jpg',
    item: 'Worn Denim Fabric Fragment',
    category: 'textile_trash',
    confidence: 0.9150,
    timestamp: '2026-10-30 19:30',
    timeAgo: '7 hours ago',
    fileSize: '1.7 MB',
    destinationBin: 'Purple Textile Depot',
    disposalGuide: 'Clean dry textiles belong in fiber donation or reclamation drop-boxes.',
    isSample: true,
    sampleImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&auto=format&fit=crop&q=80',
    topPredictions: [
      { category: 'Textile Trash', confidence: 0.9150 },
      { category: 'Miscellaneous Trash', confidence: 0.0620 },
      { category: 'Paper', confidence: 0.0180 },
    ],
  },
];

/**
 * 9 Test Preset Samples for Quick 1-Click Classification in Waste Detection
 */
export const SAMPLE_DETECTION_PRESETS = [
  {
    id: 'sample-cardboard',
    name: 'Cardboard Packaging',
    category: 'cardboard',
    filename: 'cardboard.jpg',
    confidence: 0.94,
    fileSize: '45 KB',
    imageUrl: '/samples/cardboard.jpg',
    material: 'Corrugated Fiberboard',
  },
  {
    id: 'sample-food',
    name: 'Food Organics',
    category: 'food_organics',
    filename: 'food_organics.jpg',
    confidence: 0.93,
    fileSize: '52 KB',
    imageUrl: '/samples/food_organics.jpg',
    material: 'Biodegradable Organic Kitchen Waste',
  },
  {
    id: 'sample-glass',
    name: 'Glass Container',
    category: 'glass',
    filename: 'glass.jpg',
    confidence: 0.85,
    fileSize: '48 KB',
    imageUrl: '/samples/glass.jpg',
    material: 'Soda-Lime Silica Glass',
  },
  {
    id: 'sample-metal',
    name: 'Metal Can',
    category: 'metal',
    filename: 'metal.jpg',
    confidence: 0.88,
    fileSize: '41 KB',
    imageUrl: '/samples/metal.jpg',
    material: 'Recyclable Aluminum/Tin Alloy',
  },
  {
    id: 'sample-trash',
    name: 'Miscellaneous Trash',
    category: 'miscellaneous_trash',
    filename: 'miscellaneous_trash.jpg',
    confidence: 0.74,
    fileSize: '39 KB',
    imageUrl: '/samples/miscellaneous_trash.jpg',
    material: 'Residual Non-Recyclable Waste',
  },
  {
    id: 'sample-paper',
    name: 'Office Paper',
    category: 'paper',
    filename: 'paper.jpg',
    confidence: 0.79,
    fileSize: '44 KB',
    imageUrl: '/samples/paper.jpg',
    material: 'Bleached Cellulose Paper',
  },
  {
    id: 'sample-plastic',
    name: 'Plastic Container',
    category: 'plastic',
    filename: 'plastic.jpg',
    confidence: 0.82,
    fileSize: '46 KB',
    imageUrl: '/samples/plastic.jpg',
    material: 'Polyethylene / Polymer Packaging',
  },
  {
    id: 'sample-textile',
    name: 'Textile Waste',
    category: 'textile_trash',
    filename: 'textile_trash.jpg',
    confidence: 0.65,
    fileSize: '55 KB',
    imageUrl: '/samples/textile_trash.jpg',
    material: 'Woven Natural/Synthetic Fibers',
  },
  {
    id: 'sample-vegetation',
    name: 'Garden Vegetation',
    category: 'vegetation',
    filename: 'vegetation.jpg',
    confidence: 0.83,
    fileSize: '58 KB',
    imageUrl: '/samples/vegetation.jpg',
    material: 'Organic Yard Trimmings & Foliage',
  },
];

export const SAMPLE_DETECTION_ITEMS = SAMPLE_DETECTION_PRESETS;
export const MOCK_SCANS = INITIAL_PREDICTION_HISTORY;
export const INITIAL_STATS = DATASET_METRICS;
export const HOURLY_SEGREGATION_DATA = WEEKLY_ACTIVITY;
export const ACCURACY_TREND_DATA = [
  { day: 'Mon', accuracy: 73.8, confidence: 75.2 },
  { day: 'Tue', accuracy: 74.1, confidence: 76.0 },
  { day: 'Wed', accuracy: 74.5, confidence: 76.4 },
  { day: 'Thu', accuracy: 74.2, confidence: 76.1 },
  { day: 'Fri', accuracy: 74.8, confidence: 77.0 },
  { day: 'Sat', accuracy: 74.0, confidence: 75.9 },
  { day: 'Sun', accuracy: 74.2, confidence: 76.5 },
];

