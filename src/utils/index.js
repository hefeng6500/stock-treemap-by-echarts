import { colorMap } from "../const";
var tinycolor = require("tinycolor2");

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

// 转换原始数据，为股票色块添加样式，为行业添加样式
export function convertData(originList, level) {
  if (!originList?.length) {
    return 0;
  }

  let count = 0;
  let totalValue = 0;

  for (let i = 0; i < originList.length; i++) {
    const item = originList[i];
    const marketValue = item.value[0] || 0;
    const margin = item.value[1] || 0;
    const color = getColorHex(margin);

    count += marketValue;
    totalValue += marketValue * margin;

    if (level === 2) {
      item.itemStyle = {
        color,
      };
    }

    // 行业涨跌幅使用【加权平均数】。加权平均数是百分数作为涨跌幅百分比
    const averageValue = convertData(item.children, level + 1);

    if (level === 1 || level === 0) {
      const backgroundColor = getColorHex(averageValue);

      item.upperLabel = {
        backgroundColor,
        color: "#fff",
      };
    }
  }

  // 加权平均数
  const average = totalValue / count;

  return average;
}

export function getColorHex(margin) {
  const data = getColorChunk(margin);
  const { chunk, precent } = data;

  if (!chunk.length) {
    return colorMap["0"];
  }

  const [firstColor, secondColor] = chunk;
  const color = tinycolor
    .mix(firstColor, secondColor, precent * 200)
    .toHexString();

  return color;
}

export function getColorChunk(value) {
  if (!value) {
    return {
      chunk: [],
      precent: 0,
    };
  }

  const map = {
    "-3": [colorMap["-3%"], colorMap["-4%"]],
    "-2": [colorMap["-2%"], colorMap["-3%"]],
    "-1": [colorMap["-1%"], colorMap["-2%"]],
    "-0": [colorMap["0"], colorMap["-1%"]],
    0: [colorMap["0"], colorMap["1%"]],
    1: [colorMap["1%"], colorMap["2%"]],
    2: [colorMap["2%"], colorMap["3%"]],
    3: [colorMap["3%"], colorMap["4%"]],
  };

  if (value >= 4) {
    return {
      chunk: map["3"],
      precent: 1,
    };
  }

  if (value <= -4) {
    return {
      chunk: map["-3"],
      precent: 1,
    };
  }

  const [integerValue, decimalValue] = value.toString().split(".");
  const precent = parseFloat(parseFloat(`0.${decimalValue}`).toFixed(2));

  return {
    chunk: map[integerValue] || [],
    precent,
  };
}

// 为数字添加正负号
export function formatNumberToString(value) {
  if (!value || /[+-]/.test(value)) {
    return value.toString();
  }

  if (value > 0) {
    return `+${value}`;
  } else {
    return `-${value}`;
  }
}
