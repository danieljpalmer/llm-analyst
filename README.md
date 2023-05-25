# Friendly LLM agent that dashboards like an analyst

This works on any SQL database! You might need to play with the prompts in the `chains` folder to get it working best for your use case. The world is your oyster!

I wrote a guide about [how it works](https://documentation.relevanceai.com/guides/charting-agent) on my company blog.

https://github.com/bartvdbraak/llm-analyst/assets/3996360/21327653-723a-4742-aee0-b71d64e33725

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

This uses Relevance AI to deploy and run the LLM chains. Then install the Relevance AI SDK, authenticate and deploy the chains. [Docs for Relevance AI](https://documentation.relevanceai.com).

```bash
npm install @relevanceai/chain -g
relevance login
relevance deploy
```

`relevance deploy` will deploy the chains in this repo into hosted APIs that the frontend chain client can run. Note, you will have to add your LLM (such as Open AI) key into Relevance - you can run `relevance keys` to bring up the page to do this.

Also add your Relevance region and project to the `demo-config.ts` file to power the frontend chain client.

```
export const REGION = '';
export const PROJECT = '';
```

Finally, set up an SQL database (I used a [Planetscale database for free](https://planetscale.com/)) and add a `.env` file with:

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
