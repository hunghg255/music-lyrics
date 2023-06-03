const { SearchLyrics } = require('../dist/index.js');

const init = async () => {
  const r = await SearchLyrics('good time owl');

  console.log(r);
};

init();
