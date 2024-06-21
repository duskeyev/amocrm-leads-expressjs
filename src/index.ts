import express from 'express';
import { getLeads } from './amocrmService';

const app = express();
const port = 3000;

 app.get('/api/leads', async (req, res) => {
  try {
      const queryString = req.url.split('?')[1] ? `${req.url.split('?')[1]}` : '';

    const leads = await getLeads(queryString);

    res.json(leads);

  } catch (error) {
    res.status(500).send('Server Error');
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
