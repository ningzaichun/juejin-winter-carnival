import { IMsg } from "@/types/article";
import { RequestError } from "./error";

export function fetchData({ url = "", userId = "", data = {} }): Promise<{
  [key: string]: any;
}> {
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
      onload: function ({ status, response }) {
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

export async function fetchMsgList(
  userId: string,
  startTimeStamp: number,
  endTimeStamp: number,
  requestData = {}
) {
  return await request();

  async function request(
    cursor = "0",
    dailyTopics: IMsg[] = []
  ): Promise<IMsg[]> {
    return fetchData({
      url: "https://api.juejin.cn/content_api/v1/short_msg/query_list",
      userId,
      data: { sort_type: 4, limit: 30, cursor, ...requestData },
    }).then(({ data, has_more, cursor, count }) => {
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
