import { defineChain } from '@relevanceai/chain';

export default defineChain({
  publiclyTriggerable: true,
  params: {
    results: {
      type: 'array',
      items: {
        type: 'object'
      }
    },
    naturalLanguageQuery: {
      type: 'string'
    },
  },
  setup({ params, step, code }) {

    const { results, naturalLanguageQuery } = params;

    const { answer: typeOfChart } = step('prompt_completion', {
      prompt: `The user has requested this data: "${naturalLanguageQuery}". These are the types of charts you know how to create: 'bar', 'doughnut', 'line', 'bubble' and 'radar'. This is what the data looks like: ${results[0]}. 

Identify and respond with the type of chart that would be most appropriate for this request.`
    });

    const {
      transformed: exampleCode
    } = code({ typeOfChart }, ({ typeOfChart }) => {

      const examples: Record<string, any> = {
        line: `{
  type: 'line',
  data: data: {
  labels: labels,
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
},
  options: {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true
      }
    }
  }
}`,
        bar: `{
  type: 'bar',
  data: {
  labels: labels,
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)'
    ],
    borderColor: [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
      'rgb(201, 203, 207)'
    ],
    borderWidth: 1
  }]
},
  options: {
    indexAxis: 'y',
  }
};`,
        doughnut: `{
  type: 'doughnut',
  data: {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
},
}`,
        bubble: `{
  datasets: [{
    label: 'First Dataset',
    data: [{
      x: 20,
      y: 30,
      r: 15
    }, {
      x: 40,
      y: 10,
      r: 10
    }],
    backgroundColor: 'rgb(255, 99, 132)'
  }]
}`,
        radar: `{
  type: 'radar',
  data: {
  labels: [
    'Eating',
    'Drinking',
    'Sleeping',
    'Designing',
    'Coding',
    'Cycling',
    'Running'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 90, 81, 56, 55, 40],
    fill: true,
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgb(255, 99, 132)',
    pointBackgroundColor: 'rgb(255, 99, 132)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgb(255, 99, 132)'
  }, {
    label: 'My Second Dataset',
    data: [28, 48, 40, 19, 96, 27, 100],
    fill: true,
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgb(54, 162, 235)',
    pointBackgroundColor: 'rgb(54, 162, 235)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgb(54, 162, 235)'
  }]
},
  options: {
    elements: {
      line: {
        borderWidth: 3
      }
    }
  },
}`
      };

      return examples[typeOfChart] ?? examples.bar;

    });

    const { answer: chartConfiguration } = step('prompt_completion', {
      prompt: `Here is an example ChartJS config:

${exampleCode}
      
Here is some data: ${results}.
      
Create a chartjs.org chart of type ${typeOfChart} that would be appropriate for this data. Create a valid ChartJS config for this chart. Only return the valid JSON config. Don't use more than 5 colours. Make sure to avoid this error: Give the chart a relevant title, based on this title: ${naturalLanguageQuery}. Include a key in the config called "original_query" that contains: ${naturalLanguageQuery}. Include a key called "summary" that includes a summary of the findings of the data, relative to the original query and any recommendations. It should summarise the results. Don't say "The chart shows" in your summary.`,
      system_prompt: 'You are a ChartJS config creator. You are looking at 10 results, based on an SQL query. You must only return valid JSON. Never provide any explanations or other data.'
    });


    const { transformed: cleanedConfiguration } = code({ chartConfiguration }, ({ chartConfiguration }) => {
      // strip of line breaks
      return chartConfiguration.replace(/(\r\n|\n|\r)/gm, " ").replace(/\\/g, '');
    });

    return {
      chartConfiguration: cleanedConfiguration
    }
  }
})


