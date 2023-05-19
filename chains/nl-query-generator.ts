import { defineChain } from "@relevanceai/chain";

export default defineChain({
  publiclyTriggerable: true,
  params: {
    amountToGenerate: {
      type: 'number',
    },
    tableName: {
      type: 'string',
    },
    tableColumns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          column: {
            type: 'string'
          },
          type: {
            type: 'string'
          }
        }
      }
    }
  },
  setup({ params, step, code }) {

    const { tableName, tableColumns, amountToGenerate } = params;
    
    const { transformed: joinedColumns } = code({ tableColumns }, ({ tableColumns }) => {

      return tableColumns.reduce((acc, column) => {
        return acc + `${column.column} (${column.type}),`;
      }, 'The SQL table columns are:');

    });

    const { answer: queriesString } = step('prompt_completion', {
      prompt: `You are looking at the SQL table called: ${tableName}.
${joinedColumns}.

Give me a JSON array of the top ${amountToGenerate} questions you might want to ask of this table. They should be about varying topics. They shouldn't be answerable with only one thing.`,

      system_prompt: `You are a business analyst. You must respond with good questions to ask of your SQL database. You should respond with ${amountToGenerate} options always. You should respond in the format: [question].`
    });
    
    const { transformed: arrayQueries } = code({ queriesString }, ({ queriesString }) => {
      let queries = [];
      try {
       queries = JSON.parse(queriesString);
      } catch (e) { };

      return queries;
    });

    return {
      queries: arrayQueries
    }
  }
});