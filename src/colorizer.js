const ANSI_CODES = {
  red: { open: 31, close: 39 },
  green: { open: 32, close: 39 },
  yellow: { open: 33, close: 39 },
  blue: { open: 34, close: 39 },
  magenta: { open: 35, close: 39 },
  cyan: { open: 36, close: 39 },
  redBright: { open: 91, close: 39 },
  greenBright: { open: 92, close: 39 },
  yellowBright: { open: 93, close: 39 },
  blueBright: { open: 94, close: 39 },
  gray: { open: 90, close: 39 },
  bold: { open: 1, close: 22 }
};

function build(stack) {
  const builder = (...args) => {
    const str = args.join(' ');
    if (!str) return '';

    const open = stack.map(name => `\x1b[${ANSI_CODES[name].open}m`).join('');
    const close = stack.map(name => `\x1b[${ANSI_CODES[name].close}m`).join('');
    return open + str + close;
  };

  Object.keys(ANSI_CODES).forEach(name => {
    Object.defineProperty(builder, name, {
      get() {
        return build([...stack, name]);
      }
    });
  });

  return builder;
}

const colorizer = build([]);

export default colorizer;
