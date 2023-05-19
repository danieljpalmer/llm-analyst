import { defineChain } from '@relevanceai/chain';

export default defineChain({
  publiclyTriggerable: true,
  params: {
    naturalLanguageQuery: {
      type: 'string'
    },
    tableName: {
      type: 'string'
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
    const { naturalLanguageQuery, tableColumns, tableName } = params;

    const { transformed: joinedColumns } = code({ tableColumns }, ({ tableColumns }) => {

      return tableColumns.reduce((acc, column) => {
        return acc + `${column.column} (${column.type}),`;
      }, 'The SQL table columns are:');

    });

    const preface = `The table name is: ${tableName}. The database columns are: ${joinedColumns}. A user has made this request about a SQL query:`
    
    const { answer: relevantQuerySection } = step('prompt_completion', {
      prompt: `${preface} "${naturalLanguageQuery}". Identify and respond with what part of this request is relevant to generating an SQL query, suitable for a MySQL database.`
    });

    const { answer: rawQuery } = step('prompt_completion', {
      prompt: `${preface} "${relevantQuerySection}". Identify and respond with the SQL query that would satisfy this request. Don't include any explanation of the query, just the query itself. Limit the page size to 10 records. Don't use as a name that is already a column name.`,
      system_prompt: 'You must only return valid SQL. Never provide any explanations or other data.',
    });

    const { transformed: sqlQuery } = code({ rawQuery }, ({ rawQuery }) => {
      // strip of line breaks
      return rawQuery.replace(/(\r\n|\n|\r)/gm, " ");
    });

    return {
      sqlQuery
    }
  }
})