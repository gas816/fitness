// cloudfunctions/cardio/index.js
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const COL = "cardio_records";

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { code: 401, msg: "未登录", data: null };

  try {
    if (event.action === "save") {
      const doc = {
        userId: OPENID,
        type: event.type,
        duration: event.duration | 0,
        intensity: event.intensity | 0,
        remark: event.remark || "",
        date: event.date,
        createdAt: Date.now(),
      };
      const add = await db.collection(COL).add({ data: doc });
      return { code: 0, data: { _id: add._id, ...doc } };
    }

    if (event.action === "byDate") {
      const r = await db
        .collection(COL)
        .where({ userId: OPENID, date: event.date })
        .orderBy("createdAt", "desc")
        .get();
      return { code: 0, data: r.data };
    }

    if (event.action === "month") {
      const r = await db
        .collection(COL)
        .where({
          userId: OPENID,
          date: db.RegExp({ regexp: "^" + event.yearMonth }),
        })
        .orderBy("date", "asc")
        .limit(100)
        .get();
      return { code: 0, data: r.data };
    }

    return { code: 400, msg: "unknown action", data: null };
  } catch (e) {
    return { code: 500, msg: e.message, data: null };
  }
};
