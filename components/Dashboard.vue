<script setup lang="ts">
import writingAnimation from '~/lottie/man-writing.json';
const {
    TABLE_NAME,
    TABLE_COLUMNS,
    databaseSchema,
    isDatabaseSchemaPending,
    hasStarted,
    isLoadingCharts,
    naturalLanguageQueries,
    sqlQueries,
    chartConfigs,
    generateDashboard,
} = useDashboardGenerator();

const {
    results: questionResults,
    isAskingQuestion,
    questionToAsk,
    clearResults,
    askQuestion,
    isErrored,
} = useAskQuestion(TABLE_COLUMNS, TABLE_NAME);
</script>

<template>
    <div
        v-auto-animate
        class="flex flex-col items-center justify-center w-full text-gray-800 h-full"
    >
        <div v-if="!hasStarted" class="container p-5">
            <h1 class="text-2xl font-semibold flex items-center text-gray-900">
                Magic dashboard demo
            </h1>
            <div class="flex flex-col space-y-5 mt-1.5">
                <p class="leading-7">
                    I've built an LLM powered business analyst to analyse your
                    SQL and generate a dashboard.
                </p>

                <ol
                    class="div flex flex-col space-y-3 list-decimal list-inside text-gray-500 text-sm"
                >
                    <li>Asks questions of data based on SQL schema</li>
                    <li>Generates SQL queries based on thoes questions</li>
                    <li>Queries Planetscale database</li>
                    <li>Creates charts based on the results</li>
                </ol>
            </div>

            <div class="mt-6 flex w-full">
                <select
                    name="database-select"
                    class="w-full p-3 border border-gray-300 rounded w-full focus:outline-none focus:border-indigo-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    v-model="TABLE_NAME"
                >
                    <option disabled>Select database table...</option>
                    <option v-for="table in databaseSchema" :value="table.name">
                        {{ table.name }}
                    </option>
                </select>
            </div>

            <button
                @click="generateDashboard"
                :disabled="isDatabaseSchemaPending"
                class="mt-6 p-3 rounded-md bg-gray-900 disabled:bg-indigo-700 hover:bg-gray-800 hover:text-white transition-colors shadow-sm shadow-indigo-100 text-indigo-50 font-semibold"
            >
                Wake up the AI business analyst
            </button>
        </div>

        <div
            class="container p-6 relative overflow-hidden"
            v-auto-animate
            v-if="hasStarted && !chartConfigs.length"
        >
            <div
                class="h-64 w-full absolute top-0 left-0 bg-gradient-to-b from-white via-white via-85% to-transparent z-10"
            ></div>
            <div class="w-full flex justify-center py-4 relative z-20">
                <client-only>
                    <Lottie
                        :animation-data="writingAnimation"
                        class="w-full h-48"
                    />
                </client-only>
            </div>

            <div class="w-full flex flex-col-reverse overflow-hidden">
                <div class="flex flex-col space-y-4" v-auto-animate>
                    <span class="comment-pill">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            fill="currentColor"
                            class="w-3 mr-1.5 text-gray-400"
                        >
                            <path
                                d="M86.24 26.96A16.67 16.67 0 0 0 70 6.66c-2.55 0-4.95.63-7.12 1.66a19.98 19.98 0 0 0-35.08 5.12c-.38-.02-.74-.1-1.12-.1a16.67 16.67 0 0 0-16.35 19.8 16.6 16.6 0 0 0-6.99 13.52c0 9.21 7.46 16.67 16.67 16.67 3.77 0 7.21-1.3 10-3.42a16.58 16.58 0 0 0 13.34 6.75c2.7 0 5.2-.7 7.46-1.84A16.61 16.61 0 0 0 83.34 60a16.65 16.65 0 0 0 2.9-33.04z"
                            />
                            <path
                                d="M43.33 78.33a8.33 8.33 0 1 1-16.66 0 8.33 8.33 0 0 1 16.66 0M23.33 88.33c0 6.67-10 6.67-10 0 0-6.66 10-6.66 10 0"
                            />
                        </svg>
                        <span class="text-gray-400"
                            >Analysing your SQL schema...</span
                        >
                    </span>
                    <span
                        class="comment-pill"
                        v-for="query in naturalLanguageQueries"
                        :key="query"
                    >
                        {{ query }}
                    </span>
                    <span
                        class="comment-pill"
                        v-for="query in sqlQueries"
                        :key="query.sqlQuery"
                    >
                        <span class="font-mono">{{ query.sqlQuery }}</span>
                    </span>
                    <span class="comment-pill" v-if="isLoadingCharts">
                        <span class="flex items-center text-indigo-600"
                            ><svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 100 100"
                                class="w-3 mr-1.5"
                                fill="currentColor"
                            >
                                <path
                                    d="M40.69 12A3 3 0 0 0 38 15v60a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V15a3 3 0 0 0-3-3H40.69zM44 18h12v54H44zm24.69 17A3 3 0 0 0 66 38v37a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V38a3 3 0 0 0-3-3H68.7zM72 41h12v31H72zM12.7 49A3 3 0 0 0 10 52v23a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V52a3 3 0 0 0-3-3H12.7zM16 55h12v17H16zM7.7 82A3 3 0 0 0 8 88h84a3 3 0 1 0 0-6H7.7z"
                                />
                            </svg>
                            Generating charts...</span
                        >
                    </span>
                </div>
            </div>
        </div>

        <ul
            v-if="chartConfigs.length && !questionResults"
            v-auto-animate
            class="p-6 w-full h-full hide-scroll-bar"
        >
            <div class="flex flex-col max-w-screen-xl mx-auto">
                <div class="w-full flex flex-col mb-8">
                    <h3 class="font-semibold text-xl mb-3">
                        Here are the results! Any questions?
                    </h3>
                    <form
                        @submit.prevent="() => askQuestion()"
                        class="flex flex-col"
                    >
                        <input
                            class="w-full p-3 text-lg border border-gray-300 rounded w-full focus:outline-none focus:border-indigo-600 transition-colors"
                            placeholder="Type question..."
                            v-model="questionToAsk"
                            :disabled="isAskingQuestion"
                        />
                        <p class="text-xs text-gray-400 mt-1.5">
                            {{
                                isAskingQuestion
                                    ? 'Analysing your data...'
                                    : 'Press enter to ask...'
                            }}
                        </p>

                        <div
                            v-if="isErrored"
                            class="mt-4 rounded-lg bg-gray-100 px-3 py-1 font-medium self-start text-gray-800"
                        >
                            Unfortunately, I can't find a good answer to that
                            question in this data. Try something else!
                        </div>
                    </form>
                </div>
                <div class="grid grid-cols-2 gap-8">
                    <div
                        class="p-4 rounded-lg border border-gray-200"
                        v-for="(config, idx) in chartConfigs"
                        :key="idx"
                    >
                        <Chart :chart-config="config" />
                    </div>
                </div>
            </div>
        </ul>

        <div
            v-else-if="questionResults"
            class="p-6 max-w-screen-xl w-full h-full flex flex-col"
        >
            <Chart large :chart-config="questionResults.chartConfiguration" />

            <button
                @click="clearResults"
                class="p-1.5 px-2 rounded border border-gray-200 mx-auto font-medium text-sm mt-6 mx-auto flex items-center"
            >
                <svg
                    class="w-3 h-3 mr-2 text-gray-400"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                >
                    <path
                        fill-rule="evenodd"
                        d="M17.07 6c-.52 0-1.02.21-1.39.59l-9.1 9.1a2 2 0 0 0 0 2.82L38.09 50 6.58 81.5a2 2 0 0 0 0 2.83l9.1 9.1a2 2 0 0 0 2.83 0L50 61.91l31.5 31.5a2 2 0 0 0 2.83 0l9.1-9.1a2 2 0 0 0 0-2.83l-31.5-31.5 31.5-31.47a2 2 0 0 0 0-2.84l-9.1-9.1a2 2 0 0 0-2.83 0l-31.5 31.5-31.47-31.5A2 2 0 0 0 17.06 6z"
                    />
                </svg>
                Close chart
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    @apply w-full max-w-md flex flex-col rounded-lg bg-white border border-gray-100 text-gray-800 shadow-[0px_1px_1px_-1px_rgb(0_0_0_/_0.08),_0px_2px_2px_-1px_rgb(0_0_0_/_0.08),_0px_0px_0px_1px_rgb(0_0_0_/_0.06),_inset_0px_1px_0px_#fff,_inset_0px_1px_2px_1px_#fff,_inset_0px_1px_2px_rgb(0_0_0_/_.06),_inset_0px_-4px_8px_-4px_rgb(0_0_0_/_0.04)];
}

.comment-pill {
    @apply w-full flex items-center px-2.5 py-1.5 border border-gray-200 text-xs text-gray-600 font-medium shadow-[0px_1px_1px_-1px_rgb(0_0_0_/_0.08),_0px_2px_2px_-1px_rgb(0_0_0_/_0.08),_0px_0px_0px_1px_rgb(0_0_0_/_0.06),_inset_0px_1px_0px_#fff,_inset_0px_1px_2px_1px_#fff,_inset_0px_1px_2px_rgb(0_0_0_/_.06),_inset_0px_-4px_8px_-4px_rgb(0_0_0_/_0.04)] bg-gray-50/25 rounded-lg leading-5;
}

.hide-scroll-bar {
    @apply overflow-y-auto;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* Internet Explorer 10+ */
}

.hide-scroll-bar::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
    display: none;
}

select {
    -moz-appearance: none; /* Firefox */
    -webkit-appearance: none; /* Safari and Chrome */
    appearance: none;
}
</style>
