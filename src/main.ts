import style from "./styles/global.module.css";
import logo from "./images/tampermonkey.svg";
import { renderIcon } from "./svg/sprite";
import t from "./locales";
import { fetchMsgList } from "./utils/fetch";
import { getUserId, updateUserId } from "./utils/user";
import activityData from "./activity.json";
import { IMsg } from "./types/article";
import { map } from "jquery";

interface ITopics {
  title: string;
  rewards: {
    name?: string;
    count?: number;
    days?: number;
    text?: string;
  }[];
}
// const container = document.createElement("div");
// container.classList.add(style.container);

// const imgEl = document.createElement("img");
// imgEl.setAttribute("src", logo);
// imgEl.classList.add(style.logo);
// container.appendChild(imgEl);

// const mainEl = document.createElement("main");
// mainEl.innerHTML =
//   `<h1>${t("title").toUpperCase()}</h1>` +
//   `<ul class=${style.supports}>
//   ${[
//     "support-es",
//     "support-css",
//     "support-static",
//     "support-svg-sprite",
//     "support-locale",
//     "support-plugin",
//   ]
//     .map(
//       (key) => `<li>${renderIcon("check", style.check).outerHTML}${t(key)}</li>`
//     )
//     .join("\n")}
//   </ul>
//   `;
// container.appendChild(mainEl);

// const getItButton = document.createElement("div");
// getItButton.textContent = t("got-it");
// getItButton.classList.add(style.button);
// container.appendChild(getItButton);
// getItButton.addEventListener("click", () => {
//   container.classList.add(style.hide);
// });

// document.body.appendChild(container);
const rules = [
  {
    topicId: "6824710202655244301",
    themeId: "7050065626651426848",
    topic_title: "技术交流圈",
  },
  {
    topicId: "6931179346187321351",
    themeId: "7007350865879105548",
    topic_title: "理财交流圈",
  },
  {
    topicId: "7007325324648120359",
    themeId: "7163537723913928744",
    topic_title: "体育运动俱乐部",
  },
  {
    topicId: "7007325324648120359",
    themeId: "7163537723913928744",
    topic_title: "舌尖上的沸点",
  },
  {
    topicId: "6824710202562969614",
    themeId: "7166515295786369056",
    topic_title: "今天学到了",
  },
  {
    topicId: "6931915139369140224",
    themeId: "7160505361525374976",
    topic_title: "搞笑段子",
  },
  {
    topicId: "6931914335023267853",
    themeId: "7166516951349460995",
    topic_title: "游戏玩家俱乐部",
  },
  {
    topicId: "6824710202248396813",
    themeId: "7007348215943004195",
    topic_title: "读书会",
  },
  {
    topicId: "6931915440545333259",
    themeId: "7166514905103892520",
    topic_title: "值得收藏的歌曲",
  },
  {
    topicId: "6824710202810433549",
    themeId: "7007351518756077581",
    topic_title: "代码人生",
  },
];
function start() {
  const { startTimeStamp, endTimeStamp } = activityData;
  updateUserId();
  const myUserId = getUserId();
  let data = fetchMsgList(myUserId, startTimeStamp, endTimeStamp);
  let breakTopicList: string[] = [];
  data.then((topicsList) => {
    //循环判断是否与圈子和话题对应
    let topIndex = 0;
    topicsList.forEach((topic) => {
      const { topic_id, theme_id, title } = topic;
      if (
        topic_id == rules[topIndex].topicId &&
        theme_id == rules[topIndex].themeId
      ) {
        topIndex++;
        breakTopicList.push(title);
      }
      topIndex = 0;
      console.log(
        "最后达标的数据breakTopicList====>",
        JSON.stringify(breakTopicList)
      );
    });
  });
}

setTimeout(start, 500);
