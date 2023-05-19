# Agent that dashboards like an analyst - Relevance AI

Read our [guide](https://documentation.relevanceai.com/guides/charting-agent) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

Then install the Relevance AI SDK, authenticate and deploy the chains.

```bash
npm install @relevanceai/chain -g
relevance login
relevance deploy
```

Finally, set up a [Planetscale database for free](https://planetscale.com/) and add a `.env` file with:

```
DATABASE_HOST=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_URL=
```

Then run `npm run upload` to populate your database with sample data! It inserts 2000 documents at a time, so you can run it more than once if you want more data.

## Development Server

Start the development server on `http://localhost:3000`

```bash
npm run dev
```
