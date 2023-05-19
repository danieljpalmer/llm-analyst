<script setup lang="ts">
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

const props = defineProps<{
    chartConfig: ChartConfiguration & {
        original_query?: string;
        summary?: string;
    };
    large?: boolean;
}>();

const canvas = ref();

onMounted(() => {
    new Chart(canvas.value, props.chartConfig);
});
</script>

<template>
    <h4
        class="font-semibold mb-1"
        :class="{
            'text-2xl': large,
        }"
    >
        {{ chartConfig.original_query || 'Chart' }}
    </h4>
    <h5
        class="mb-2 text-gray-500"
        :class="large ? 'mt-1 text-lg leading-8' : 'text-sm'"
    >
        {{ chartConfig.summary }}
    </h5>
    <canvas ref="canvas" class="w-full h-auto"></canvas>
</template>
