// cloudfunctions/login/index.js
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const USERS = "users";

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { code: 401, msg: "无法获取 openid", data: null };

  const now = Date.now();
  const action = event.action || "login";

  try {
    if (action === "update") {
      const update = {};
      if (event.nickname) update.nickname = event.nickname;
      if (event.avatar) update.avatar = event.avatar;
      update.lastLoginAt = now;
      await db
        .collection(USERS)
        .where({ openid: OPENID })
        .update({ data: update });
      const res = await db
        .collection(USERS)
        .where({ openid: OPENID })
        .limit(1)
        .get();
      return { code: 0, data: res.data[0] };
    }

    // 默认 login：upsert
    const exist = await db
      .collection(USERS)
      .where({ openid: OPENID })
      .limit(1)
      .get();
    if (exist.data.length) {
      const u = exist.data[0];
      const patch = { lastLoginAt: now };
      if (event.nickname) patch.nickname = event.nickname;
      if (event.avatar) patch.avatar = event.avatar;
      await db.collection(USERS).doc(u._id).update({ data: patch });
      return { code: 0, data: { user: { ...u, ...patch }, isNew: false } };
    }

    const doc = {
      openid: OPENID,
      nickname: event.nickname || "战士-" + OPENID.slice(-4),
      avatar: event.avatar || "",
      createdAt: now,
      lastLoginAt: now,
    };
    const add = await db.collection(USERS).add({ data: doc });
    return { code: 0, data: { user: { _id: add._id, ...doc }, isNew: true } };
  } catch (e) {
    return { code: 500, msg: e.message, data: null };
  }
};
