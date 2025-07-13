// @ts-ignore
const airlines = require("airlines-iata-codes");

const allAirlines = Object.entries(airlines).map(([code, data]) => ({
  code,
  name: (data as any).name,
}));

console.log("Total airlines:", allAirlines.length);
console.log(allAirlines); 