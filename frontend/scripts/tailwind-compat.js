const tailwindcss = require('tailwindcss');

module.exports = function tailwindCompat(configOrPath) {
  const tw = tailwindcss(configOrPath);
  const twFn = tw.plugins.find((p) => typeof p === 'function');
  return {
    postcssPlugin: 'tailwind-compat',
    plugins: [
      async function (root, result) {
        const file = root.source?.input?.file;
        if (file && (file.includes('node_modules') || file.includes('@videojs'))) {
          return;
        }
        return twFn(root, result);
      },
    ],
  };
};

module.exports.postcss = true;
