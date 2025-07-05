export class ColorManager {
  #colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright'
  ];
  #colorIndex = 0;

  getNextColor() {
    const color = this.#colors[this.#colorIndex % this.#colors.length];
    this.#colorIndex++;
    return color;
  }
}
