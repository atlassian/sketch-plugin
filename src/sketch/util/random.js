export const randomInt = x => Math.floor(Math.random() * x);
export const randomChoice = a => a[randomInt(a.length)];
export const randomExponential = mean => Math.floor(-Math.log(Math.random()) / (1 / mean));
