<script setup lang="ts">
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

const props = defineProps<{
    chartConfig: ChartConfiguration & { original_query?: string };
}>();

const canvas = ref();

onMounted(() => {
    new Chart(canvas.value, props.chartConfig);
});
</script>

<template>
    <h4 class="font-semibold mb-2">
        {{ chartConfig.original_query || 'Chart' }}
    </h4>
    <canvas ref="canvas" class="w-full h-auto"></canvas>
</template>
