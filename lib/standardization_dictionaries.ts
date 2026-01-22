// 8 OS Types -> 8 Nature-based Adjective Pairs (for Identity)
export const OS_TYPE_ADJECTIVES: Record<string, [string, string]> = {
    "State Architect": ["Structured", "Architectural"],
    "Silent Sentinel": ["Watchful", "Silent"],
    "Master Builder": ["Rooted", "Rising"],
    "Safe Strategist": ["Still", "Deep"],
    "Fire Converter": ["Blazing", "Radiant"],
    "Emotional Drifter": ["Flowing", "Restless"],
    "Conscious Maintainer": ["Enduring", "Constant"],
    "Passive Floater": ["Dreaming", "Floating"],
};

// 8 OS Types -> 8 Protocol Strategies (for Part 5)
export const OS_TYPE_PROTOCOLS: Record<string, { name: string; focus: string; keyRitual: string }> = {
    "State Architect": {
        name: "The Decompression Protocol",
        focus: "Disengaging the analytical mind to access somatic wisdom.",
        keyRitual: "Non-Sleep Deep Rest (NSDR)"
    },
    "Silent Sentinel": {
        name: "The Connection Protocol",
        focus: "Lowering hyper-vigilance to allow safe, genuine connection.",
        keyRitual: "Gratitude Journaling"
    },
    "Master Builder": {
        name: "The Foundation Protocol",
        focus: "Shifting from endless achievement to deep, restorative grounding.",
        keyRitual: "Tech-Free Nature Walk"
    },
    "Safe Strategist": {
        name: "The Momentum Protocol",
        focus: "Converting analysis paralysis into small, decisive actions.",
        keyRitual: "The 5-Second Rule"
    },
    "Fire Converter": {
        name: "The Cooling Protocol",
        focus: "Balancing intense energy output with deliberate nervous system cooling.",
        keyRitual: "Physiological Sigh"
    },
    "Emotional Drifter": {
        name: "The Anchor Protocol",
        focus: "Stabilizing emotional fluctuations with consistent physical routines.",
        keyRitual: "Box Breathing"
    },
    "Conscious Maintainer": {
        name: "The Spark Protocol",
        focus: "Introducing controlled novelty to break the cycle of sameness.",
        keyRitual: "High Intensity Interval Training (HIIT)"
    },
    "Passive Floater": {
        name: "The Ignition Protocol",
        focus: "Sparking dopamine through micro-wins to overcome inertia.",
        keyRitual: "Morning Sunlight Exposure"
    }
};

export const GAPJA_NOUNS: Record<string, string> = {
    // Wood (Gap/Eul)
    "甲子": "Pine on the Water", "甲戌": "Pine on the Hill", "甲申": "Pine on the Rock",
    "甲午": "Pine in the Sun", "甲辰": "Pine in the Swamp", "甲寅": "Great Forest Pine",
    "乙丑": "Winter Orchid", "乙亥": "Floating Orchid", "乙酉": "Orchid on the Cliff",
    "乙未": "Summer Orchid", "乙巳": "Blooming Orchid", "乙卯": "Garden Orchid",

    // Fire (Byeong/Jeong)
    "丙寅": "Sunrise", "丙子": "Midnight Sun", "丙戌": "Sunset",
    "丙申": "Setting Sun", "丙午": "Midday Sun", "丙辰": "Sun above Clouds",
    "丁卯": "Candle in the Wind", "丁丑": "Lantern in the Snow", "丁亥": "Lighthouse",
    "丁酉": "Starlight", "丁未": "Campfire", "丁巳": "Volcano",

    // Earth (Mu/Gi)
    "戊辰": "Great Mountain", "戊寅": "Forest Mountain", "戊子": "Mountain Lake",
    "戊戌": "Autumn Mountain", "戊申": "Mineral Mountain", "戊午": "Volcanic Mountain",
    "己巳": "Fertile Field", "己卯": "Spring Garden", "己丑": "Winter Garden",
    "己亥": "River Delta", "己酉": "Harvest Field", "己未": "Dry Desert",

    // Metal (Gyeong/Sin)
    "庚午": "Forged Sword", "庚辰": "Raw Ore", "庚寅": "Axe in the Forest",
    "庚子": "Sword in the Water", "庚戌": "Guardian Statue", "庚申": "Iron Monolith",
    "辛未": "Jewel in the Sand", "辛巳": "Gold in the Fire", "辛卯": "Gem on Silk",
    "辛丑": "Pearl in the Mud", "辛亥": "Washed Gem", "辛酉": "Diamond",

    // Water (Im/Gye)
    "壬申": "Spring Water", "壬午": "Lake", "壬辰": "Reservoir",
    "壬寅": "River in the Forest", "壬子": "Ocean", "壬戌": "Mountain Stream",
    "癸酉": "Clear Spring", "癸未": "Summer Rain", "癸巳": "Morning Mist",
    "癸卯": "Dew on Grass", "癸丑": "Frozen Mist", "癸亥": "Winter Rain"
};

// Simplified English Nouns (Mapped from the detailed ones above for shorter Titles)
export const GAPJA_SIMPLE_NOUNS: Record<string, string> = {
    "甲子": "Pine", "甲戌": "Hill Pine", "甲申": "Cliff Pine", "甲午": "Sunlit Pine", "甲辰": "Swamp Pine", "甲寅": "Forest",
    "乙丑": "Winter Flower", "乙亥": "Water Flower", "乙酉": "Cliff Flower", "乙未": "Desert Flower", "乙巳": "Bloom", "乙卯": "Ivy",
    "丙寅": "Dawn", "丙子": "Reflection", "丙戌": "Dusk", "丙申": "Horizon", "丙午": "Blaze", "丙辰": "Cloud Sun",
    "丁卯": "Flame", "丁丑": "Lantern", "丁亥": "Beacon", "丁酉": "Star", "丁未": "Ember", "丁巳": "Torch",
    "戊辰": "Peak", "戊寅": "Woods", "戊子": "Lake Mountain", "戊戌": "Ridge", "戊申": "Ore Mountain", "戊午": "Volcano",
    "己巳": "Field", "己卯": "Garden", "己丑": "Tundra", "己亥": "Delta", "己酉": "Harvest", "己未": "Desert",
    "庚午": "Blade", "庚辰": "Ore", "庚寅": "Axe", "庚子": "Steel", "庚戌": "Guardian", "庚申": "Monolith",
    "辛未": "Gem", "辛巳": "Gold", "辛卯": "Jewel", "辛丑": "Pearl", "辛亥": "Crystal", "辛酉": "Diamond",
    "壬申": "Spring", "壬午": "Lake", "壬辰": "Dam", "壬寅": "River", "壬子": "Ocean", "壬戌": "Stream",
    "癸酉": "Spring", "癸未": "Rain", "癸巳": "Mist", "癸卯": "Dew", "癸丑": "Frost", "癸亥": "Storm"
};
