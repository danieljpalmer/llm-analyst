import { Client } from '@relevanceai/chain';
import sqlQueryGenerator from '~/chains/sql-query-generator';
import chartGenerator from '~/chains/chart-generator';
import fixSql from '~/chains/fix-sql';
import { PROJECT, REGION } from '~/demo-config';

export default function (tableColumns: Ref<{ column: string; type: string; }[]>, tableName: Ref<string>) {
  const client = new Client({
        region: REGION,
        project: PROJECT,
  });
  
  const questionToAsk = ref('');
  const isAskingQuestion = ref(false);
  const isErrored = ref(false);

  const results = ref<{
    chartConfiguration: any;
    nlQuery: string;
  } | null>(null);

  function clearResults() {
    results.value = null;
    questionToAsk.value = '';
  }

  async function askQuestion() {
    try {
      isAskingQuestion.value = true;
      isErrored.value = false;

      const { sqlQuery } = await client.runChain<typeof sqlQueryGenerator>('sql-query-generator',{
          tableName: tableName.value,
          tableColumns: tableColumns.value,
          naturalLanguageQuery: questionToAsk.value
      });
      
      const data = await $fetch('/api/query', {
          method: 'POST',
          key: sqlQuery,
          body: {
              query: sqlQuery
          }
      });


      const { chartConfiguration: config } = await client.runChain<typeof chartGenerator>('chart-generator',{
          results: data as Record<any, any>[] ?? [],
          naturalLanguageQuery: questionToAsk.value
      });

      results.value = {
        chartConfiguration: JSON.parse(config),
        nlQuery: questionToAsk.value
      }
    
    } catch (e) {
      isErrored.value = true;
    } finally {
      isAskingQuestion.value = false;
    }
  };

  return {
    results,
    clearResults,
    isAskingQuestion,
    isErrored,
    questionToAsk,
    askQuestion
  }
}