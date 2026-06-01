// cloudfunctions/template/index.js
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const COL = "workout_templates";

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { code: 401, msg: "未登录", data: null };

  try {
    if (event.action === "list") {
      const r = await db
        .collection(COL)
        .where({ userId: OPENID })
        .orderBy("createdAt", "asc")
        .limit(50)
        .get();
      return { code: 0, data: r.data };
    }

    if (event.action === "save") {
      const tpl = event.template || {};
      const now = Date.now();
      const payload = {
        name: tpl.name || "我的训练计划",
        days: tpl.days || {},
        active: !!tpl.active,
        updatedAt: now,
      };

      if (tpl._id) {
        // 更新（仅限本人）
        const exist = await db
          .collection(COL)
          .doc(tpl._id)
          .get()
          .catch(() => null);
        if (!exist || !exist.data || exist.data.userId !== OPENID) {
          return { code: 403, msg: "无权限", data: null };
        }
        await db.collection(COL).doc(tpl._id).update({ data: payload });
        return { code: 0, data: { ...exist.data, ...payload } };
      }

      const doc = { userId: OPENID, createdAt: now, ...payload };
      const add = await db.collection(COL).add({ data: doc });
      return { code: 0, data: { _id: add._id, ...doc } };
    }

    if (event.action === "delete") {
      const exist = await db
        .collection(COL)
        .doc(event.id)
        .get()
        .catch(() => null);
      if (!exist || !exist.data || exist.data.userId !== OPENID) {
        return { code: 403, msg: "无权限", data: null };
      }
      await db.collection(COL).doc(event.id).remove();
      return { code: 0, data: { ok: true } };
    }

    if (event.action === "setActive") {
      // 先全部取消，再激活目标
      await db
        .collection(COL)
        .where({ userId: OPENID, active: true })
        .update({ data: { active: false } });
      const exist = await db
        .collection(COL)
        .doc(event.id)
        .get()
        .catch(() => null);
      if (!exist || !exist.data || exist.data.userId !== OPENID) {
        return { code: 403, msg: "无权限", data: null };
      }
      await db
        .collection(COL)
        .doc(event.id)
        .update({ data: { active: true } });
      return { code: 0, data: { ok: true } };
    }

    return { code: 400, msg: "unknown action", data: null };
  } catch (e) {
    return { code: 500, msg: e.message, data: null };
  }
};
