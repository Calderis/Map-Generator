const componentToHex = c => {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

const rgbToHex = (r, g, b) => {
  return "#" + componentToHex(Math.round(r)) + componentToHex(Math.round(g)) + componentToHex(Math.round(b));
};
