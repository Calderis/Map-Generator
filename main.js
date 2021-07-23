const TILE_WIDTH = 1;
const TILE_HEIGHT = 1;

// const

const fade = (startColor, endColor, steps, step) => {
  const scale = step / steps,
  r = startColor.r + scale * (endColor.r - startColor.r),
  b = startColor.b + scale * (endColor.b - startColor.b),
  g = startColor.g + scale * (endColor.g - startColor.g);

  return [r, g, b].map(Math.round);
};

const waterStart = { r: 10, g : 20, b: 40 };
const waterEnd = { r: 39, g : 50, b: 63 };
const grassStart = { r: 22, g : 38, b: 3 };
const grassEnd = { r: 67, g : 100, b: 18 };
const mtnEnd = { r: 60, g : 56, b: 31 };
const mtnStart = { r: 67, g : 80, b: 18 };
const rocamtStart = { r: 90, g : 90, b: 90 };
const rocamtEnd = { r: 130, g : 130, b: 130 };

const cursor = document.getElementById("cursor");
const humidityCursor = document.getElementById("humidityCursor");

const ARRAY_WIDTH = DEFAULT_WORLD_HEIGHT * DEFAULT_WORLD_HEIGHT * 4;

let coldestPoint = World[0];
let hottestPoint = World[0];

const drawMap = () => {
  const canvas = document.getElementById("mapCanvas");
  const temperatureCanvas = document.getElementById("temperatureCanvas");
  const humidityCanvas = document.getElementById("humidityCanvas");

  const ctx = canvas.getContext("2d");
  const ctx2 = temperatureCanvas.getContext("2d");
  const ctx3 = humidityCanvas.getContext("2d");

  const tempImg = ctx.createImageData(DEFAULT_WORLD_HEIGHT, DEFAULT_WORLD_HEIGHT);
  const humidityImg = ctx.createImageData(DEFAULT_WORLD_HEIGHT, DEFAULT_WORLD_HEIGHT);
  const heightImg = ctx.createImageData(DEFAULT_WORLD_HEIGHT, DEFAULT_WORLD_HEIGHT);

  let colorFill = Array(3);
  let tempFill = Array(3);
  let humidityFill = Array(3);

  World.forEach((tile, index) => {
    if (tile.temperature < coldestPoint.temperature) coldestPoint = tile;
    if (tile.temperature > hottestPoint.temperature) hottestPoint = tile;
    if (tile.altitude < SEA_LEVEL) {
      colorFill = fade(waterStart, waterEnd, SEA_LEVEL, tile.altitude);
    } else if (tile.altitude < 85) {
      const biome = biomeTypes[tile.humidityRegion][tile.temperatureRegion];
      colorFill = fade(biome.fromColor, biome.toColor, 85 - SEA_LEVEL, tile.altitude - SEA_LEVEL);
      // colorFill = fade(grassStart, grassEnd, 85 - SEA_LEVEL, tile.altitude - SEA_LEVEL);
    } else if (tile.altitude < 95) {
      colorFill = fade(mtnStart, mtnEnd, 15, tile.altitude - 70);
    } else colorFill = fade(rocamtStart, rocamtEnd, 5, tile.altitude - 95);

    heightImg.data[index * 4] = colorFill[0];
    heightImg.data[index * 4 + 1] = colorFill[1];
    heightImg.data[index * 4 + 2] = colorFill[2];
    heightImg.data[index * 4 + 3] = 255;

    tempFill = fade({ r: 0, g: 255, b: 253 }, { r: 250, g: 7, b: 26 }, 100, tile.temperature + 50);
    tempImg.data[index * 4] = tempFill[0];
    tempImg.data[index * 4 + 1] = tempFill[1];
    tempImg.data[index * 4 + 2] = tempFill[2];
    tempImg.data[index * 4 + 3] = 255;

    humidityFill = fade({ r: 234, g: 234, b: 226 }, { r: 0, g: 50, b: 84 }, 100, tile.humidity);
    humidityImg.data[index * 4] = humidityFill[0];
    humidityImg.data[index * 4 + 1] = humidityFill[1];
    humidityImg.data[index * 4 + 2] = humidityFill[2];
    humidityImg.data[index * 4 + 3] = 255;
  });

  ctx.putImageData(heightImg, 0, 0);
  ctx2.putImageData(tempImg, 0, 0);
  ctx3.putImageData(humidityImg, 0, 0);
}

cursor.addEventListener("change", event => temperatureCanvas.style.opacity = event.target.value);
humidityCursor.addEventListener("change", event => humidityCanvas.style.opacity = event.target.value);
humidityCanvas.addEventListener("click", event => {
  console.log(`x: ${event.layerX}, y: ${event.layerY}`, World[event.layerX + event.layerY * DEFAULT_WORLD_HEIGHT]);
});

drawMap();
console.log("Temperature record", coldestPoint, hottestPoint);
