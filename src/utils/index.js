export function getLevelOption() {
  return [
    {
      itemStyle: {
        borderWidth: 3,
        gapWidth: 3,
      },
    },
    {
      color: ["#942e38", "#aaa", "#269f3c"],
      colorMappingBy: "value",
      itemStyle: {
        gapWidth: 1,
      },
    },
    {
      color: ["#942e38", "#aaa", "#269f3c"],
      colorMappingBy: "value",
      itemStyle: {
        gapWidth: 1,
      },
    },
    {
      color: ["#942e38", "#aaa", "#269f3c"],
      colorMappingBy: "value",
      itemStyle: {
        gapWidth: 1,
      },
    },
  ];
}

export function formatOriginData(marketValue, value) {
  const { data: map } = value;
  const backtrack = (data, level, path, map) => {
    let visualDimension = [0, 0];

    if (!data.length) {
      return [0, 0];
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const { name, scale } = item;
      const value = map[name];

      item.value = [scale, value];
      item.path = path ? `${path}/${item.name}` : item.name;

      // 先递归计算每一只股票的涨跌幅，插入到对应属性中
      const [scaleValue, riseAndFallValue] = backtrack(
        item.children,
        level + 1,
        item.path,
        map
      );

      // 回溯：
      // 1.求第一层级行业的整体值
      if (level === 0) {
        item.value = [scaleValue, riseAndFallValue];
      } else if (level === 1) {
        // 2. 求第二层级行业的整体值
        item.value = [scaleValue, riseAndFallValue];
      }

      visualDimension[0] += item.value[0] || 0;
      visualDimension[1] += item.value[1] || 0;
    }

    return visualDimension;
  };

  backtrack(marketValue.children, 0, "", map);

  return marketValue.children;
}

export function convertData(originList, level) {
  if (!originList?.length) {
    return;
  }

  for (let i = 0; i < originList.length; i++) {
    const item = originList[i];
    const margin = item.value[1] || 0;
    let precent = getPrecent(margin);

    if (level === 2) {
      if (margin > 0) {
        item.itemStyle = {
          color: `hsl(0, 100%, ${precent})`,
        };
      } else if (margin < 0) {
        item.itemStyle = {
          color: `hsl(120, 100%, ${precent})`,
        };
      } else {
        item.itemStyle = {
          color: "#aaa",
        };
      }
    }

    convertData(item.children, level + 1);
  }
}

export function getPrecent(value) {
  const absValue = Math.abs(value);

  if (absValue >= 4) {
    return `50%`;
  }

  const res = 80 - 10 * absValue + "%";
  // console.log("res", res);
  return res;
}
