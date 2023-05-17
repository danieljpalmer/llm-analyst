<script setup lang="ts">
const {
    isLoading,
    naturalLanguageQueries,
    sqlQueries,
    chartConfigs,
    generateDashboard,
} = useDashboardGenerator();
</script>

<template>
    <div class="w-full max-w-screen-lg flex flex-col">
        <button
            @click="generateDashboard"
            class="border border-gray-300 rounded p-2 font-semibold"
        >
            {{ isLoading ? 'Loading...' : 'Generate dashboard' }}
        </button>

        <ul v-auto-animate class="mt-4 flex flex-col space-y-4">
            <li
                class="w-full p-2 bg-gray-50 font-medium text-center"
                v-for="query in naturalLanguageQueries"
                :key="query"
            >
                {{ query }}
            </li>
            <li
                class="w-full p-2 bg-indigo-50 font-medium text-center"
                v-for="query in sqlQueries"
                :key="query.nlQuery"
            >
                {{ query.sqlQuery }}
            </li>
            <div class="py-6" v-for="(config, idx) in chartConfigs" :key="idx">
                <Chart :chart-config="config" />
            </div>
        </ul>
    </div>
</template>
