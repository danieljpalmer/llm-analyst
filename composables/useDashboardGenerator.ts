import { Client } from '@relevanceai/chain';
import nlQueryGenerator from '~/chains/nl-query-generator';
import sqlQueryGenerator from '~/chains/sql-query-generator';
import chartGenerator from '~/chains/chart-generator';

import { ChartConfiguration } from 'chart.js';
import { PROJECT, REGION } from '~/demo-config';

export default function () {

    const client = new Client({
        region: REGION,
        project: PROJECT,
    });

    const naturalLanguageQueries = ref<string[]>([]);

    const {
        data: databaseSchema,
        pending: isDatabaseSchemaPending,
    } = useFetch('/api/schema', {
        method: 'GET',
    });

    const TABLE_NAME = ref<string>(databaseSchema?.value?.[0]?.name ?? '');
    const TABLE_COLUMNS = computed(() => databaseSchema.value?.find(t => t.name === TABLE_NAME.value)?.fields.map(field => {
        const parsed = JSON.parse(JSON.stringify(field));
        return {
            column: parsed.name,
            type: parsed.type
        }
    }) ?? []);

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
    const hasStarted = ref(false);
    const isLoadingCharts = ref(false);

    async function generateDashboard() {
        try {
            isLoading.value = true;
            hasStarted.value = true;

            if (!databaseSchema.value?.[0]?.name) return;           

            /** NATURAL LANGUAGE QUERIES */
            const { queries } = await client.runChain<typeof nlQueryGenerator>('nl-query-generator', {
                tableName: TABLE_NAME.value,
                tableColumns: TABLE_COLUMNS.value,
                amountToGenerate: 10,
            });

            naturalLanguageQueries.value = queries;

            /** SQL QUERIES */
            for (const query of naturalLanguageQueries.value) {
                try {
                    const { sqlQuery } = await client.runChain<typeof sqlQueryGenerator>('sql-query-generator',{
                    tableName: TABLE_NAME.value,
                    tableColumns: TABLE_COLUMNS.value,
                    naturalLanguageQuery: query
                });
                
                sqlQueries.value.push({
                    sqlQuery,
                    nlQuery: query
                });
                } catch (e) {}
            }

                        
            /** LOAD CHARTS */
            isLoadingCharts.value = true;

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
            
            chartConfigs.value = settledPromises.map((promise) => {
                try {
                    if (promise.status === 'rejected') {
                        return {} as ChartConfiguration;
                    } else {
                        return JSON.parse(promise.value.chartConfiguration) as ChartConfiguration;
                    }
                } catch (e) {                    
                    return {} as ChartConfiguration;
                }
            }).filter(config => !!config?.type);

            
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
            isLoadingCharts.value = false;
        }
    }

    return {
        TABLE_NAME,
        TABLE_COLUMNS,
        databaseSchema,
        isDatabaseSchemaPending,
        hasStarted,
        isLoading,
        isLoadingCharts,
        naturalLanguageQueries: staggeredUiQueries,
        sqlQueries,
        chartConfigs,
        generateDashboard
    }
}