<template>
  <div id="app">
    <div id="main"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { convertData, formatOriginData, formatNumberToString } from "./utils";

import marketValue from "./json/market-value.json";
import riseAndFallValue from "./json/rise-and-fall.json";

export default {
  name: "App",
  data() {
    return {
      targetData: [],
    };
  },
  mounted() {
    const targetData = formatOriginData(marketValue, riseAndFallValue);

    this.data = targetData;
    this.drawCanvas();
  },
  methods: {
    drawCanvas() {
      const data = this.data;
      const element = document.getElementById("main");
      const myChart = echarts.init(element);

      convertData(data, 0);

      myChart.setOption({
        title: {
          text: "股票云图",
          left: "center",
        },
        tooltip: {
          formatter: function (info) {
            const value = info.value;

            if (!Array.isArray(value)) {
              return;
            }
            const treePathInfo = info.treePathInfo;
            const treePath = [];

            for (let i = 1; i < treePathInfo.length; i++) {
              treePath.push(treePathInfo[i].name);
            }

            const newValue = echarts.format.addCommas(value[0].toFixed(2));
            let riseAndFall = echarts.format.addCommas(value[1].toFixed(2));

            riseAndFall = formatNumberToString(riseAndFall);

            return `<div class="tooltip-title">
                ${echarts.format.encodeHTML(treePath.join("/"))}
               </div>
               <div>
                净值：${newValue}
               <div>
               <div>
                涨跌幅：${riseAndFall}
               <div>
               `;
          },
        },
        series: [
          {
            type: "treemap",
            colorMappingBy: "value",
            visibleMin: 300,
            label: {
              show: true,
              formatter: function (params) {
                const { data = {} } = params;
                const { name, value } = data;

                if (!Array.isArray(value)) {
                  return;
                }
                const [, riseAndFall] = value;
                let riseAndFallText = null;

                if (!riseAndFall) {
                  riseAndFallText = 0;
                } else {
                  riseAndFallText = formatNumberToString(riseAndFall);
                }
                if (params.treeAncestors.length === 4) {
                  return `${name}\n${riseAndFallText}`;
                } else {
                  return `${name}`;
                }
              },
            },
            upperLabel: {
              show: true,
              height: 20,
              backgroundColor: "#fff",
              borderColor: "#fff",
            },
            itemStyle: {
              borderColor: "black",
            },
            data,
          },
        ],
      });
    },
  },
};
</script>

<style scoped>
#main {
  width: 100%;
  height: 800px;
  border: 1px solid #ddd;
}
</style>
