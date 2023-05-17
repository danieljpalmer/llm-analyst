import { Client } from '@relevanceai/chain';
import nlQueryGenerator from '~/chains/nl-query-generator';
import sqlQueryGenerator from '~/chains/sql-query-generator';
import chartGenerator from '~/chains/chart-generator';
import fixJson from '~/chains/fix-json';

import { ChartConfiguration } from 'chart.js';
import { PROJECT, REGION } from '~/relevance-config';
import { TABLE_NAME, TABLE_COLUMNS } from '~/definitions';

export default function () {

    const client = new Client({
        region: REGION,
        project: PROJECT,
    });

    const naturalLanguageQueries = ref<string[]>([]);

    // for frontend effect
    const staggeredUiQueries = ref<string[]>([]);
    watch(naturalLanguageQueries, (queries) => {
        queries.forEach((query, idx) => setTimeout(() => staggeredUiQueries.value.push(query), 1000 * idx));
    });
    
    const sqlQueries = ref<{
        nlQuery: string;
        sqlQuery: string;
    }[]>([]);
    const chartConfigs = ref<ChartConfiguration[]>([]);

    const isLoading = ref(false);

    async function generateDashboard() {
        try {
            isLoading.value = true;

            const { queries } = await client.runChain<typeof nlQueryGenerator>('nl-query-generator',{
                tableName: TABLE_NAME,
                tableColumns: TABLE_COLUMNS,
                amountToGenerate: 6,
                ignoreQuestions: []
            });

            naturalLanguageQueries.value = queries;

            for (const query of naturalLanguageQueries.value) {
                try {
                    const { sqlQuery } = await client.runChain<typeof sqlQueryGenerator>('sql-query-generator',{
                    tableName: TABLE_NAME,
                    tableColumns: TABLE_COLUMNS,
                    naturalLanguageQuery: query
                });
                
                sqlQueries.value.push({
                    sqlQuery,
                    nlQuery: query
                });
                } catch (e) {}
            }

            async function generateChart({
                sqlQuery,
                nlQuery
            }: {
                    sqlQuery: string;
                    nlQuery: string;
            }) {
                    try {
                        const { data } = await useFetch('/api/query', {
                            method: 'POST',
                            key: sqlQuery,
                            body: {
                                query: sqlQuery
                            }
                        });
                        
                        console.log('query data:', data.value, Math.random())

                    const { chartConfiguration } = await client.runChain<typeof chartGenerator>('chart-generator',{
                        results: data?.value as Record<any, any>[] ?? [],
                        naturalLanguageQuery: nlQuery
                    });

                    return {
                        chartConfiguration,
                        query: nlQuery
                    };
                } catch (e) {
                    return {
                        chartConfiguration: '',
                        query: nlQuery
                    };
                }
            };

            const promises = sqlQueries.value.map(generateChart);

            const settledPromises = await Promise.allSettled(promises);

            const brokenJson = [] as string[];
            
            chartConfigs.value = settledPromises.map((promise) => {
                try {
                    if (promise.status === 'rejected') {
                        return {} as ChartConfiguration;
                    } else {
                        return JSON.parse(promise.value.chartConfiguration) as ChartConfiguration;
                    }
                } catch (e) {
                    if (promise.status === 'fulfilled') {
                        // push to our chain that tries to fix broken json
                        brokenJson.push(promise.value.chartConfiguration);
                    }
                    
                    return {} as ChartConfiguration;
                }
            }).filter(config => !!config?.type);
            
            async function fixBrokenJson(broken: string) {
                const { fixedJsonString } = await client.runChain<typeof fixJson>('fix-json',{
                    brokenJsonString: broken
                });

                return JSON.parse(fixedJsonString);
            }
            
            // sounds like it should be a Fall Out Boy album
            const brokenPromises = brokenJson.map(fixBrokenJson);
            
            // poorly received follow up album
            const settledBrokenPromises = await Promise.allSettled(brokenPromises);

            settledBrokenPromises.forEach(result => {
                if (result.status === 'fulfilled') {
                    chartConfigs.value.push(result.value);
                };
            })
        } catch (error) {
            console.log('request error', error)
            console.log(error);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading,
        naturalLanguageQueries: staggeredUiQueries,
        sqlQueries,
        chartConfigs,
        generateDashboard
    }
}