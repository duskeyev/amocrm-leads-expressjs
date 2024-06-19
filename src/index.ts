import express from 'express';
import { getLeads } from './amocrmService';

const app = express();
const port = 3000;

 app.get('/api/leads', async (req, res) => {
  try {
    const query = req.query.query as string;
    const leads = await getLeads(query);
    res.json(leads);

  } catch (error) {
    res.status(500).send('Server Error');
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
