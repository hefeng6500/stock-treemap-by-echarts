<template>
  <div id="app">
    <div id="main"></div>
    <!-- <Demo /> -->
  </div>
</template>

<script>
import Demo from "./demo";
import * as echarts from "echarts";
import { getLevelOption, convertData, formatOriginData } from "./utils";
import { colorMap } from "./const/index";
// import data from "./json/disk.tree.json";

import marketValue from "./json/market-value.json";
import riseAndFallValue from "./json/rise-and-fall.json";

export default {
  name: "App",
  components: {
    Demo,
  },
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
          text: "Disk Usage",
          left: "center",
        },

        tooltip: {
          formatter: function (info) {
            var value = info.value;

            if (!Array.isArray(value)) {
              return;
            }
            var treePathInfo = info.treePathInfo;
            var treePath = [];
            for (var i = 1; i < treePathInfo.length; i++) {
              treePath.push(treePathInfo[i].name);
            }
            return [
              '<div class="tooltip-title">' +
                echarts.format.encodeHTML(treePath.join("/")) +
                "</div>",
              "净值：" + echarts.format.addCommas(value[0].toFixed(2)),
            ].join("");
          },
        },

        series: [
          {
            type: "treemap",
            name: "name test",
            // visualDimension: 1,
            // colorMappingBy: "value",
            // visibleMin: 16, // 如果某个节点的矩形的面积，小于这个数值（单位：px平方），这个节点就不显示。
            // childrenVisibleMin: 16,
            label: {
              show: true,
              formatter: function (params) {
                const { data = {} } = params;
                const { name, value } = data;

                if (!Array.isArray(value)) {
                  return;
                }
                const [, riseAndFall] = value;
                const riseAndFallText =
                  riseAndFall > 0 ? `+${riseAndFall}` : `${riseAndFall}`;

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
            },
            itemStyle: {
              borderColor: "black",
            },
            // visualMin: visualMin,
            // visualMax: visualMax,
            visualDimension: 2,
            // levels: getLevelOption(),
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
.test {
  color: #942e38;
  color: #269f3c;
  color: #aaa;
}
</style>

<style>
body {
  padding: 0;
  margin: 0;
}
</style>
