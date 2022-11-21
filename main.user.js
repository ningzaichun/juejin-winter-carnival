// ==UserScript==
// @name         juejin-winter-carnival
// @namespace    juejin-winter-carnival
// @version      0.0.0
// @include      *
// @run-at       document-end
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @match        juejin.cn
// @connect      juejin.cn
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function () {
  "use strict";
  class RequestError extends Error {
    constructor(message, text) {
      super(message);
      this.text = text ?? message;
    }
  }

  function fetchData(_ref) {
    let { url = "", userId = "", data = {} } = _ref;
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url,
        data: JSON.stringify({
          user_id: userId,
          ...data,
        }),
        responseType: "json",
        headers: {
          "User-agent": window.navigator.userAgent,
          "content-type": "application/json",
          origin: "",
          "Access-Control-Allow-Origin": "*",
        },
        onload: function (_ref2) {
          let { status, response } = _ref2;
          if (status === 200) {
            resolve(response);
          } else {
            console.log("响应体", response);
            reject(
              new RequestError(
                `响应错误：状态码 ${status}`,
                `响应错误：状态码 ${status}，具体信息请见控制台`
              )
            );
          }
        },
        onabort: function () {
          reject(new RequestError("请求中断"));
        },
        onerror: function () {
          reject(new RequestError("请求发送失败"));
        },
        ontimeout: function () {
          reject(new RequestError(`请求超时`));
        },
      });
    });
  }
  async function fetchMsgList(userId, startTimeStamp, endTimeStamp) {
    let requestData =
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    return await request();
    async function request() {
      let cursor =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "0";
      let dailyTopics =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      return fetchData({
        url: "https://api.juejin.cn/content_api/v1/short_msg/query_list",
        userId,
        data: {
          sort_type: 4,
          limit: 30,
          cursor,
          ...requestData,
        },
      }).then((_ref3) => {
        let { data, has_more, cursor, count } = _ref3;
        let lastPublishTime = Infinity;
        if (data) {
          for (const msg of data) {
            const { msg_id, msg_Info, topic, user_interact } = msg;
            // 沸点字数、内容、发布时间、评论、点赞
            const {
              ctime,
              mtime,
              audit_status,
              verify_status,
              digg_count,
              comment_count,
              theme_id,
            } = msg_Info;
            const { title, topic_id } = topic;
            const publishTime = new Date(ctime * 1000).valueOf();
            const modifiedTime = new Date(mtime * 1000).valueOf();
            const verify =
              verify_status === 0
                ? 0
                : audit_status === 2 && verify_status === 1
                ? 1
                : 2;
            if (
              publishTime >= startTimeStamp &&
              publishTime <= endTimeStamp &&
              verify !== 2
            ) {
              dailyTopics.push({
                title: title,
                id: msg_id,
                publishTime,
                modifiedTime,
                digg_count: digg_count - (user_interact.is_digg ? 1 : 0),
                comment_count,
                topic_id,
                theme_id,
              });
            }
          }
        }
        if (
          lastPublishTime > startTimeStamp &&
          has_more &&
          count !== parseInt(cursor, 10)
        ) {
          return request(cursor, dailyTopics);
        } else {
          console.log("msgs====>收集起来的数据===>", dailyTopics);
          return dailyTopics;
        }
      });
    }
  }

  const getUserIdFromPathName = (pathname) => {
    // return pathname?.match(/\/user\/(\d+)(?:\/|$)/)?.[1];
    return pathname?.match(/\/badge\/(\d+)(?:\/|$)/)?.[1];
  };

  const user = {
    id: "",
  };
  function getUserId() {
    return user.id;
  }
  function setUserId(userId) {
    user.id = userId;
  }
  function updateUserId() {
    // const userProfileEl = document.querySelector(
    //   ".user-dropdown-list > .nav-menu-item-group:nth-child(2) > .nav-menu-item > a[href]"
    // );
    const userProfileEl = document.querySelector(
      "#juejin > div.view-container > main > div.view.user-view > div.major-area > a[href]"
    );
    const userId = getUserIdFromPathName(
      userProfileEl?.getAttribute("href") ?? ""
    );
    if (!userId) {
      return;
    }
    setUserId(userId);
  }

  var docLink = "https://juejin.cn/post/7162096952883019783";
  var topics = [
    {
      rule: "规则判断",
      rules: [
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
      ],
    },
  ];
  var startTimeStamp = 1668960000000;
  var endTimeStamp = 1669737600000;
  var rules$1 = [
    {
      title: "进度追踪",
      rewards: [
        {
          name: "第一关",
          days: 1,
        },
        {
          name: "第二关",
          days: 2,
        },
        {
          name: "第三关",
          days: 3,
        },
        {
          name: "第四关",
          days: 4,
        },
        {
          name: "第五关",
          days: 5,
        },
        {
          name: "第六关",
          days: 6,
        },
        {
          name: "第七关",
          days: 7,
        },
        {
          name: "第八关",
          days: 8,
        },
        {
          name: "第九关",
          days: 9,
        },
        {
          name: "第十关",
          days: 10,
        },
      ],
    },
  ];
  var activityData = {
    docLink: docLink,
    topics: topics,
    startTimeStamp: startTimeStamp,
    endTimeStamp: endTimeStamp,
    rules: rules$1,
  };

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
    let breakTopicList = [];
    data.then((topicsList) => {
      //循环判断是否与圈子和话题对应
      let topIndex = 0;
      topicsList.forEach((topic, index) => {
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
})();
