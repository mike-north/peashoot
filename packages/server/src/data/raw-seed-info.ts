/**
 * Plant and Seed Packet Data Model
 *
 * This file defines the complete data structure for representing plants, seeds, and their
 * characteristics for garden planning and plant placement optimization.
 *
 * Key Concepts for Non-Gardeners:
 * - Annual: Lives one growing season (e.g., tomatoes, lettuce)
 * - Perennial: Lives multiple years (e.g., fruit trees, asparagus)
 * - Companion Planting: Some plants grow better together, others inhibit each other
 * - Succession Planting: Planting the same crop multiple times for continuous harvest
 * - Hardiness Zone: Geographic regions based on average minimum winter temperatures
 */

export type DateTime = string // ISO 8601

// ============================================================================
// MEASUREMENT UNITS
// ============================================================================

enum TimeUnit {
	days = 'days',
	hours = 'hours',
	minutes = 'minutes',
	seconds = 'seconds',
}

enum TemperatureUnit {
	fahrenheit = 'fahrenheit',
	celsius = 'celsius',
}

type RawDistanceUnit = 'inches' | 'feet' | 'yards' | 'meters' | 'centimeters'

interface Distance {
	value: number
	unit: RawDistanceUnit
}

interface DistanceRange {
	min: Distance
	max: Distance
}

interface Temperature {
	value: number
	unit: TemperatureUnit
}

interface TemperatureRange {
	min: Temperature
	max: Temperature
}

interface TimeDuration {
	value: number
	unit: TimeUnit
}

interface TimeDurationRange {
	min: TimeDuration
	max: TimeDuration
}

/**
 * USDA Hardiness Zones divide North America into regions based on average
 * minimum winter temperatures. Zone 1 is coldest, Zone 11 is warmest.
 * Subzones (a/b) provide finer granularity within each zone.
 */
type USDAHardinessZone =
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13}${'a' | 'b' | ''}`

// ============================================================================
// PLANT CHARACTERISTICS
// ============================================================================

/**
 * Plant lifespan determines how long a plant lives and when it reproduces
 */
enum PlantLifespan {
	annual = 'annual', // Lives one growing season, dies after producing seeds
	biennial = 'biennial', // Lives two years: grows first year, flowers/seeds second year
	perennial = 'perennial', // Lives multiple years, can produce for many seasons
}

/**
 * Storage structures are specialized plant parts that store energy/nutrients.
 * These affect how plants are propagated and planted.
 */
enum PlantStorageStructure {
	bulb = 'bulb', // Onions, tulips - layered storage structure
	tuber = 'tuber', // Potatoes - swollen underground stem
	rhizome = 'rhizome', // Ginger, iris - horizontal underground stem
	corm = 'corm', // Gladiolus - solid underground stem base
	crown = 'crown', // Strawberries, rhubarb - growing point at soil level
	roots = 'roots', // Conventional root system
}

/**
 * How plants are typically reproduced/started
 */
enum PlantPropagationMethod {
	seed = 'seed', // Grown from seeds
	vegetative = 'vegetative', // Grown from plant parts (cuttings, divisions)
	grafted = 'grafted', // Two plants joined together (common for fruit trees)
}

/**
 * Physical growth patterns that affect garden layout and support needs
 */
enum PlantGrowthHabit {
	bush = 'bush', // Compact, self-supporting shrub form
	vine = 'vine', // Long stems that need support but don't climb actively
	tree = 'tree', // Woody trunk with branching canopy
	groundcover = 'groundcover', // Spreads horizontally along ground
	upright = 'upright', // Grows straight up, columnar form
	rosette = 'rosette', // Leaves arranged in circular pattern from center
	climbing = 'climbing', // Actively climbs supports using tendrils/twining
	trailing = 'trailing', // Spreads along ground or hangs down
}

/**
 * How quickly plants reach maturity - affects garden planning timelines
 */
enum PlantGrowthRate {
	slow = 'slow', // Takes longer to establish and mature
	moderate = 'moderate', // Average growth speed
	fast = 'fast', // Quickly reaches full size
}

/**
 * Plant family names used for companion planting relationships.
 * These represent common groupings that gardeners use when planning
 * which plants grow well together or should be kept apart.
 */
enum PlantFamily {
	buttercups = 'buttercups',
	irises = 'irises',
	begonias = 'begonias',
	arums = 'arums',
	cannas = 'cannas',
	ranunculuses = 'ranunculuses',
	daisies = 'daisies',
	peonies = 'peonies',
	snapdragons = 'snapdragons',
	geraniums = 'geraniums',
	grasses = 'grasses',

	// Vegetables
	tomatoes = 'tomatoes',
	peppers = 'peppers',
	beans = 'beans',
	peas = 'peas',
	corn = 'corn',
	squash = 'squash',
	pumpkins = 'pumpkins',
	cucumbers = 'cucumbers',
	carrots = 'carrots',
	onions = 'onions',
	garlic = 'garlic',
	shallots = 'shallots',
	leeks = 'leeks',
	lettuce = 'lettuce',
	spinach = 'spinach',
	radishes = 'radishes',
	beets = 'beets',
	potatoes = 'potatoes',
	sweetPotatoes = 'sweet potatoes',
	turnips = 'turnips',
	rutabagas = 'rutabagas',

	// Brassicas (cabbage family)
	brassicas = 'brassicas',
	cabbage = 'cabbage',
	broccoli = 'broccoli',
	cauliflower = 'cauliflower',
	kale = 'kale',
	kohlrabi = 'kohlrabi',
	mustard = 'mustard',
	arugula = 'arugula',

	// Nightshades (Solanaceae)
	nightshades = 'nightshades',
	eggplant = 'eggplant',

	// Cucurbits (squash family)
	cucurbits = 'cucurbits',
	watermelons = 'watermelons',
	cantaloupes = 'cantaloupes',

	// Alliums (onion family)
	alliums = 'alliums',

	// Legumes (nitrogen fixers)
	legumes = 'legumes',

	// Herbs and aromatics
	basil = 'basil',
	parsley = 'parsley',
	chives = 'chives',
	dill = 'dill',
	sage = 'sage',
	oregano = 'oregano',
	rosemary = 'rosemary',
	thyme = 'thyme',
	cilantro = 'cilantro',
	mint = 'mint',
	lavender = 'lavender',
	aromaticHerbs = 'aromatic herbs',

	// Flowers and beneficial plants
	marigolds = 'marigolds',
	nasturtiums = 'nasturtiums',
	sunflowers = 'sunflowers',
	roses = 'roses',
	calendula = 'calendula',
	cosmos = 'cosmos',
	zinnias = 'zinnias',

	// Grains and grasses
	grains = 'grains',
	wheat = 'wheat',
	oats = 'oats',

	// Fruit trees and berries
	apples = 'apples',
	cherries = 'cherries',
	apricots = 'apricots',
	figs = 'figs',
	berries = 'berries',
	strawberries = 'strawberries',
	blueberries = 'blueberries',
	raspberries = 'raspberries',
	blackberries = 'blackberries',

	// Other important plants
	fennel = 'fennel',
	asparagus = 'asparagus',
	parsnips = 'parsnips',
	melons = 'melons',
	walnutTrees = 'walnut trees',
	poleBeans = 'pole beans',
	celery = 'celery',
	okra = 'okra',
	artichokes = 'artichokes',
	rhubarb = 'rhubarb',

	// Cover crops and green manures
	clover = 'clover',
	buckwheat = 'buckwheat',

	// Special values
	noneKnown = 'none known',
}

/**
 * Physical support structures needed for healthy growth
 */
enum SupportNeeds {
	none = 'none', // Self-supporting
	stakes = 'stakes', // Single vertical pole (tomatoes, young trees)
	trellis = 'trellis', // Grid or lattice structure (peas, cucumbers)
	cage = 'cage', // Cylindrical wire support (tomatoes, peppers)
	arbor = 'arbor', // Overhead structure (grapes, large vines)
	fence = 'fence', // Linear support structure (beans, climbing roses)
}

// ============================================================================
// ENVIRONMENTAL PREFERENCES
// ============================================================================

/**
 * Light requirements - critical for photosynthesis and plant health
 */
enum LightPreference {
	fullSun = 'full-sun', // 6+ hours direct sunlight daily
	partialSun = 'partial-sun', // 3-6 hours direct sunlight daily
	shade = 'shade', // Less than 3 hours direct sunlight daily
}

/**
 * Water needs affect irrigation planning and plant grouping
 */
enum WaterNeeds {
	low = 'low', // Drought tolerant, infrequent watering
	moderate = 'moderate', // Regular watering, can handle some dry periods
	high = 'high', // Needs frequent watering, doesn't tolerate drought
	consistent = 'consistent', // Needs steady moisture, no wet/dry cycles
}

/**
 * Soil texture affects drainage, nutrient retention, and root penetration
 */
enum SoilTexture {
	sandy = 'sandy', // Large particles, drains quickly, low nutrient retention
	silt = 'silt', // Medium particles, good water/nutrient retention
	clay = 'clay', // Small particles, slow drainage, high nutrient retention
	loamy = 'loamy', // Ideal mix of sand/silt/clay
	rocky = 'rocky', // Well-draining, good for Mediterranean plants
}

/**
 * How quickly water moves through soil - affects plant health and watering
 */
enum DrainagePreference {
	wellDraining = 'well-draining', // Water moves through quickly
	moistureRetentive = 'moisture-retentive', // Holds water longer
	wet = 'wet', // Tolerates standing water
	dry = 'dry', // Prefers dry conditions
}

/**
 * Soil acidity/alkalinity affects nutrient availability to plants
 * pH scale: 0-14, where 7 is neutral, <7 is acidic, >7 is alkaline
 */
enum PhPreference {
	acidic = 'acidic', // pH 5.5-6.5 (blueberries, azaleas)
	neutral = 'neutral', // pH 6.0-7.0 (most vegetables)
	alkaline = 'alkaline', // pH 7.0-8.0 (lavender, clematis)
	adaptable = 'adaptable', // Tolerates wide pH range
}

/**
 * Organic matter content affects soil fertility and structure
 */
enum OrganicMatterPreference {
	low = 'low', // Minimal organic content needed
	moderate = 'moderate', // Average organic content
	high = 'high', // Rich, composted soil preferred
	veryHigh = 'very-high', // Heavily amended, very fertile soil
}

/**
 * Nutrient requirements affect fertilization and companion planting
 */
enum NutrientNeeds {
	light = 'light', // Low fertilizer needs
	moderate = 'moderate', // Average fertilizer needs
	heavy = 'heavy', // High fertilizer needs (corn, tomatoes)
}

/**
 * Root depth affects water/nutrient competition and companion planting
 */
enum RootDepth {
	shallow = 'shallow', // 0-12 inches (lettuce, herbs)
	medium = 'medium', // 12-24 inches (beans, carrots)
	deep = 'deep', // 24+ inches (tomatoes, fruit trees)
}

/**
 * How aggressively plants compete for resources - affects spacing
 */
enum CompetitiveNature {
	aggressive = 'aggressive', // Spreads rapidly, crowds out other plants
	moderate = 'moderate', // Normal competition level
	gentle = 'gentle', // Doesn't compete strongly, easily overwhelmed
}

// ============================================================================
// TIMING AND SEASONS
// ============================================================================

/**
 * Planting seasons based on temperature and frost patterns
 */
enum PlantingSeason {
	earlySpring = 'early-spring', // Cool weather, possible light frost
	spring = 'spring', // Mild weather, frost danger past
	lateSpring = 'late-spring', // Warm weather, soil warmed up
	summer = 'summer', // Hot weather, for heat-loving plants
	fall = 'fall', // Cooling weather, for cool-season crops
	winter = 'winter', // Cold weather, limited growing (greenhouses)
}

/**
 * How plants are started in the garden
 */
enum PlantingMethod {
	directSow = 'direct-sow', // Seeds planted directly in garden
	transplant = 'transplant', // Started indoors, then moved to garden
	both = 'both', // Can be done either way
}

// ============================================================================
// HARVEST AND PRODUCTION
// ============================================================================

/**
 * How plants are harvested affects garden planning and succession planting
 */
enum HarvestMethod {
	cutAndComeAgain = 'cut-and-come-again', // Harvest leaves/stems, plant regrows
	singleHarvest = 'single-harvest', // Harvest once, plant is done
	continuous = 'continuous', // Ongoing harvest over long period
	periodic = 'periodic', // Multiple harvests at intervals
}

/**
 * Which parts of the plant are edible
 */
enum EdiblePart {
	leaves = 'leaves', // Lettuce, spinach, herbs
	fruit = 'fruit', // Tomatoes, peppers, apples
	root = 'root', // Carrots, radishes, potatoes
	flower = 'flower', // Broccoli, cauliflower, squash blossoms
	stem = 'stem', // Celery, asparagus, rhubarb
	seed = 'seed', // Beans, peas, sunflower seeds
}

/**
 * Primary purpose/function of plants in the garden ecosystem
 */
enum PlantFunction {
	food = 'food', // Produces edible parts
	pollinator = 'pollinator', // Attracts bees, butterflies for pollination
	pestRepellent = 'pest-repellent', // Deters harmful insects
	nitrogenFixer = 'nitrogen-fixer', // Adds nitrogen to soil (legumes)
	groundCover = 'ground-cover', // Prevents weeds, erosion
	windbreak = 'windbreak', // Protects other plants from wind
	ornamental = 'ornamental', // Grown for beauty/aesthetics
}

// ============================================================================
// SEED SPECIFIC INFORMATION
// ============================================================================

/**
 * Special treatments some seeds need before planting to germinate properly
 */
enum SeedTreatment {
	scarification = 'scarification', // Scratch/nick hard seed coat
	stratification = 'stratification', // Cold treatment to break dormancy
	soaking = 'soaking', // Soak in water to soften seed coat
}

// ============================================================================
// CONSOLIDATED INTERFACES
// ============================================================================

/**
 * All spacing requirements for optimal plant growth and garden layout
 */
interface PlantSpacing {
	minimum: Distance // Closest plants can be without competing
	optimal: Distance // Best spacing for healthy growth
	rowSpacing?: Distance // Space between rows if planted in rows
	thinning?: DistanceRange // Final spacing after thinning seedlings
	canIntercrop?: boolean // Can other plants be grown between these
}

interface USDAHardinessZoneRange {
	min: USDAHardinessZone
	max: USDAHardinessZone
}
interface USDAHardinessZoneRangeMap {
	oneSeason?: USDAHardinessZone | USDAHardinessZoneRange // Annual plants, or range where perennial plants will be ok for only one season
	multiSeason?: USDAHardinessZone | USDAHardinessZoneRange // Range where perennial plants will be ok for multiple seasons
}

/**
 * Environmental conditions the plant needs to thrive
 */
interface EnvironmentalRequirements {
	light: LightPreference // How much sunlight needed
	water: WaterNeeds // Irrigation requirements

	// Climate tolerance information
	hardiness?: {
		usdaZone: USDAHardinessZoneRangeMap
		frostHardy?: boolean // Can survive light frost
		heatTolerant?: boolean // Handles high temperatures well
		coolSeasonHardy?: boolean // Prefers cool weather
	}

	// Soil preferences
	soil?: {
		texture?: SoilTexture // Physical soil composition
		drainage?: DrainagePreference // Water drainage needs
		ph?: PhPreference // Acidity/alkalinity preference
		organicMatter?: OrganicMatterPreference // Fertility requirements
	}

	// Temperature requirements for different growth stages
	temperatureRanges?: {
		transplant?: TemperatureRange // Safe temperature for moving outdoors
		ideal?: TemperatureRange // Optimal growing temperature
		soilMin?: Temperature // Minimum soil temperature for planting
	}
}

/**
 * Physical growth characteristics that affect garden design
 */
interface GrowthCharacteristics {
	lifespan: PlantLifespan // How long the plant lives
	habit: PlantGrowthHabit // Physical growth pattern
	rate?: PlantGrowthRate // How quickly it grows
	matureSize: {
		// Full-grown dimensions
		height: DistanceRange // How tall it gets
		spread: DistanceRange // How wide it spreads
	}
	rootDepth: RootDepth // How deep roots go
	supportNeeds: SupportNeeds // What structures it needs for support
}

/**
 * Resource consumption patterns for garden planning
 */
interface ResourceRequirements {
	nutrients: NutrientNeeds // Fertilizer requirements
	competitiveNature: CompetitiveNature // How aggressively it competes
}

/**
 * When and how to plant
 */
interface PlantingInfo {
	method: PlantingMethod // Direct sow vs transplant
	timing?: {
		seasons?: PlantingSeason[] // Which seasons to plant
		weeksBeforeLastFrost?: number // Timing relative to last frost
		weeksAfterLastFrost?: number // Timing relative to last frost
	}
	seedDepth?: Distance | DistanceRange // How deep to plant seeds
	germinationDuration?: TimeDuration // How long until seeds sprout
	daysToGermination?: TimeDurationRange // Range of germination time
}

/**
 * Information about harvesting and food production (only for edible plants)
 */
interface ProductionInfo {
	producesFruit: boolean // Whether it produces edible parts
	edibleParts?: EdiblePart[] // Which parts are edible
	harvestDuration?: TimeDuration // Time from planting to harvest
	harvestMethod?: HarvestMethod // How to harvest
	harvestWindow?: TimeDuration // How long harvest period lasts

	// Succession planting for continuous harvest
	successionPlanting?: {
		recommended?: boolean // Should you plant multiple times
		intervalWeeks?: number // Weeks between plantings
		maxSuccessions?: number // Maximum number of plantings
		seasonalLimitations?: PlantingSeason[] // Which seasons work
	}
}

/**
 * What role the plant plays in the garden ecosystem
 */
interface PlantFunctions {
	primary: PlantFunction // Main purpose (food, pollinator, etc.)
	secondary?: PlantFunction[] // Additional benefits
	beneficialInsects?: boolean // Attracts helpful insects
	pollinatorValue?: boolean // Important for pollinating other plants
}

/**
 * Companion planting relationships - which plants help or hurt each other
 */
interface CompanionPlanting {
	goodCompanions?: string[] // Plants that grow well together
	badCompanions?: string[] // Plants that should be kept apart
	allelopathicEffects?: string[] // Chemicals this plant releases that affect others
}

/**
 * Information specific to seed packets (not live plants)
 */
interface SeedPacketInfo {
	seedCount?: number // Number of seeds in packet
	ntWeightInOz?: number // Net weight of seeds in ounces
	viabilityYears?: number // How many years seeds stay viable
	germinationRate?: number // Percentage of seeds expected to sprout
	treatmentRequired?: SeedTreatment[] // Special treatments needed before planting
	storageRequirements?: string // How to store unused seeds
}

/**
 * Plant care and maintenance information
 */
interface PlantCareInfo {
	commonPests?: string[] // Insects/animals that commonly attack
	commonDiseases?: string[] // Diseases this plant is prone to
	organicTreatments?: string[] // Natural pest/disease control methods
	vulnerabilityPeriods?: PlantingSeason[] // When plant is most susceptible
}

// ============================================================================
// SAFETY AND TOXICITY
// ============================================================================

/**
 * Toxicity levels for safety planning around children, pets, and livestock
 */
enum ToxicityLevel {
	safe = 'safe', // Non-toxic, safe if consumed
	mildlyToxic = 'mildly-toxic', // May cause mild stomach upset
	moderatelyToxic = 'moderately-toxic', // Can cause significant illness
	highlyToxic = 'highly-toxic', // Dangerous, can cause serious harm/death
	unknown = 'unknown', // Toxicity level not established
}

/**
 * Which parts of the plant may be toxic (important for plants with mixed safety)
 */
enum PlantPart {
	wholePlant = 'whole-plant', // Entire plant
	leaves = 'leaves', // Foliage
	stems = 'stems', // Stems and branches
	roots = 'roots', // Root system
	flowers = 'flowers', // Blooms
	fruits = 'fruits', // Fruits/berries
	seeds = 'seeds', // Seeds/nuts
	sap = 'sap', // Plant sap/latex
	bark = 'bark', // Tree bark
	greenParts = 'green-parts', // Green/unripe parts (potatoes, tomatoes)
}

/**
 * Safety information for plants around humans and animals
 */
interface ToxicityInfo {
	// Human safety
	humanToxicity?: {
		level: ToxicityLevel
		toxicParts?: PlantPart[] // Which parts are toxic
		symptoms?: string[] // Common symptoms if consumed
		notes?: string // Additional safety information
	}

	// Animal safety
	petToxicity?: {
		dogs?: ToxicityLevel // Toxicity to dogs
		cats?: ToxicityLevel // Toxicity to cats
		toxicParts?: PlantPart[] // Which parts are toxic to pets
		symptoms?: string[] // Symptoms in pets
	}

	// Livestock safety (for farm/rural settings)
	livestockToxicity?: {
		level?: ToxicityLevel
		affectedAnimals?: string[] // Which livestock are affected
		toxicParts?: PlantPart[]
	}

	// Contact safety
	skinContact?: {
		irritant?: boolean // Causes skin irritation
		allergen?: boolean // Common allergen
		severity?: ToxicityLevel // How severe contact reactions are
	}
}

interface RGBColor {
	red: number
	green: number
	blue: number
}

interface SeedPacketPresentation {
	accentColor: RGBColor
	iconPath: string
}

// ============================================================================
// MAIN DATA STRUCTURE
// ============================================================================

/**
 * Complete information about a plant variety, typically from a seed packet
 * or plant tag. This model supports garden planning and plant placement
 * optimization by capturing all relevant growing characteristics.
 *
 * The structure is designed to handle different plant types:
 * - Food crops (vegetables, fruits, herbs)
 * - Ornamental plants (flowers, decorative plants)
 * - Functional plants (nitrogen fixers, pest repellents)
 * - Trees and perennials
 *
 * Not all fields will be available for every plant - optional sections
 * allow for incomplete data while still being useful for garden planning.
 */
export interface RawSeedPacketInfo {
	// ========================================================================
	// CORE IDENTIFICATION
	// ========================================================================
	id: string // Unique identifier for this plant variety
	commonName: string // Name most people know (e.g., "Tomato")
	latinName?: string // Scientific name (e.g., "Solanum lycopersicum")
	description?: string // Additional details about this variety
	plantFamily: PlantFamily // Plant family for companion planting relationships
	presentation: SeedPacketPresentation
	// ========================================================================
	// PROPAGATION METHOD
	// ========================================================================
	propagationMethod: PlantPropagationMethod // How this plant is typically started
	storageStructure?: PlantStorageStructure // Special storage organs if any

	// ========================================================================
	// REQUIRED CHARACTERISTICS (needed for garden planning)
	// ========================================================================
	spacing: PlantSpacing // How much space it needs
	environmental: EnvironmentalRequirements // Climate and soil needs
	growth: GrowthCharacteristics // Size and growth pattern
	resources: ResourceRequirements // Nutrient and competition info
	planting: PlantingInfo // When and how to plant
	functions: PlantFunctions // Role in garden ecosystem

	// ========================================================================
	// OPTIONAL INFORMATION (varies by plant type and available data)
	// ========================================================================
	production?: ProductionInfo // Harvest info (for food plants)
	companions?: CompanionPlanting // Companion planting relationships
	seedPacketInfo?: SeedPacketInfo // Seed-specific information
	care?: PlantCareInfo // Pest/disease management

	// ========================================================================
	// COMMERCIAL INFORMATION
	// ========================================================================
	seedSource?: string // Company/supplier name
	plantingInstructions?: string // Detailed growing instructions
	sellBy?: DateTime // Expiration date for seeds

	// ========================================================================
	// SAFETY AND TOXICITY
	// ========================================================================
	toxInfo?: ToxicityInfo // Safety information about the plant
}

export interface RawSeedPacketInfoCollection {
	seedPackets: RawSeedPacketInfo[]
}
