const express = require('express');
const wol = require('wol');

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/wakeup', (req, res) => {
  wol.wake('74:56:3C:36:FA:29', (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Failed to wake up device');
    }

    res.send('Wakeup signal sent!');
  });
});

app.listen(PORT, () => {
  console.log(`Server started on http://0.0.0.0:${PORT}`);
});
