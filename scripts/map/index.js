const DEFAULT_WORLD_HEIGHT = 2048;
const SEA_LEVEL = 40;

const iceType = { name: "ice", fromColor: { r: 255, g: 255, b: 255 }, toColor: { r: 235, g: 240, b: 240 } };
const desertType = { name: "desert", fromColor: { r: 217, g: 194, b: 104 }, toColor: { r: 239, g: 214, b: 114 } };
const savannaType = { name: "savanna", fromColor: { r: 168, g: 202, b: 92 }, toColor: { r: 186, g: 224, b: 103 } };
const tropicalRainforestType = { name: "tropical rainforest", fromColor: { r: 53, g: 112, b: 14 }, toColor: { r: 76, g: 158, b: 21 } };
const tundraType = { name: "tundra", fromColor: { r: 82, g: 120, b: 99 }, toColor: { r: 109, g: 161, b: 132 } };
const temperateRainforestType = { name: "temperate rainforest", fromColor: { r: 21, g: 65, b: 32 }, toColor: { r: 35, g: 110, b: 54 } };
const grasslandType = { name: "grassland", fromColor: { r: 149, g: 221, b: 77 }, toColor: { r: 162, g: 240, b: 84 } };
const seasonalForestType = { name: "seasonal forest", fromColor: { r: 62, g: 91, b: 26 }, toColor: { r: 90, g: 133, b: 38 } };
const borealForestType = { name: "boreal forest", fromColor: { r: 85, g: 103, b: 51 }, toColor: { r: 126, g: 153, b: 77 } };
const woodlandType = { name: "woodland", fromColor: { r: 124, g: 168, b: 75 }, toColor: { r: 161, g: 217, b: 98 } };
const waterType = { name: "water", fromColor: { r: 0, g: 0, b: 113 }, toColor: { r: 37, g: 43, b: 188 } };
const mountainType = { name: "moutain", fromColor: { r: 111, g: 111, b: 111 }, toColor: { r: 200, g: 200, b: 200 } };

const biomeTypes = [
  [iceType, tundraType, grasslandType, desertType, desertType, desertType],
  [iceType, tundraType, grasslandType, desertType, desertType, desertType],
  [iceType, tundraType, woodlandType, woodlandType, savannaType, savannaType],
  [iceType, tundraType, borealForestType, woodlandType, savannaType, savannaType],
  [iceType, tundraType, borealForestType, seasonalForestType, tropicalRainforestType, tropicalRainforestType ],
  [iceType, tundraType, borealForestType, temperateRainforestType, tropicalRainforestType, tropicalRainforestType]
];

const temperatureBiomeIndex = temperature => {
  if (temperature < -10) return 0;
  else if (temperature < 0) return 1;
  else if (temperature < 25) return 2;
  else if (temperature < 33) return 3;
  else if (temperature < 45) return 4;
  else return 5;
}

const defaultMapTile = {
  name: "empty",
  temperature: 20,
  temperatureRegion: 0,
  humidity: 0,
  humidityRegion: 0,
  altitude: 0,
  x: 0,
  y: 0
};

const initEmptyWorld = () => {
  return Array(DEFAULT_WORLD_HEIGHT * DEFAULT_WORLD_HEIGHT)
    .fill(null)
    .map((x, i) => ({
      ...defaultMapTile,
      x: i % DEFAULT_WORLD_HEIGHT,
      y: Math.floor(i / DEFAULT_WORLD_HEIGHT)
    }))
};

let World = initEmptyWorld();
const getMapTile = (x, y) => World[x + y * DEFAULT_WORLD_HEIGHT];

const initHeightMap = (world, roughness = 1) => {
  const map = terrainGeneration(DEFAULT_WORLD_HEIGHT, {
    roughness : 8,
    unitSize : 1,
    smoothness : 0.1,
    smoothIterations : 0
  });
  const moisture = terrainGeneration(DEFAULT_WORLD_HEIGHT, {
    roughness : 12,
    unitSize : 1,
    smoothness : 0.3,
    smoothIterations : 0
  });

  for (let i = 0; i < DEFAULT_WORLD_HEIGHT; i += 1) {
    for (let j = 0; j < DEFAULT_WORLD_HEIGHT; j += 1) {
      const altitude = map[i][j] * 100; // altitude in percent: 0 is the deepest place and 100 the highest
      const humidity = moisture[i][j] * 100; // moisture in percent: 0 driest place and 100 the most humide
      getMapTile(i, j).altitude = altitude;
      getMapTile(i, j).humidity = humidity;
      // Tru curves at https://www.desmos.com/calculator
      // 10 - 0.015x^{2} = + 10° at 50%
      getMapTile(i, j).temperature += 10 - 0.015 * Math.pow(j * 100 / DEFAULT_WORLD_HEIGHT - 50, 2);
      // Alternate temperature around Mountain and sea
      // getMapTile(i, j).temperature += (altitude - SEA_LEVEL) - Math.pow(0.01 * (altitude - SEA_LEVEL), 2) - 15;
      const x = altitude - 100 + SEA_LEVEL - 10;
      getMapTile(i, j).temperature -= altitude / 120 * x;
      getMapTile(i, j).temperatureRegion = temperatureBiomeIndex(getMapTile(i, j).temperature);
      getMapTile(i, j).humidityRegion = Math.round(humidity * 5 / 100);
    }
  }
  return world;
};

console.time("Init world height");
World = initHeightMap(World);
console.timeEnd("Init world height");
