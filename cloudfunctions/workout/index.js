// cloudfunctions/workout/index.js
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const REC = "workout_records";
const CAR = "cardio_records";

function startOfWeek(d = new Date()) {
  const day = d.getDay() || 7;
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(d.getDate() - day + 1);
  return r.getTime();
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { code: 401, msg: "未登录", data: null };

  const action = event.action;
  try {
    if (action === "today") {
      const r = await db
        .collection(REC)
        .where({ userId: OPENID, date: event.date })
        .limit(1)
        .get();
      return { code: 0, data: r.data[0] || null };
    }

    if (action === "save") {
      const now = Date.now();
      const find = await db
        .collection(REC)
        .where({ userId: OPENID, date: event.date })
        .limit(1)
        .get();
      const payload = {
        workoutType: event.workoutType,
        title: event.title || "",
        exercises: event.exercises,
        completed: !!event.completed,
        duration: event.duration | 0,
        updatedAt: now,
      };
      if (find.data.length) {
        const id = find.data[0]._id;
        await db.collection(REC).doc(id).update({ data: payload });
        return { code: 0, data: { _id: id, ...find.data[0], ...payload } };
      }
      const doc = {
        userId: OPENID,
        date: event.date,
        createdAt: now,
        ...payload,
      };
      const add = await db.collection(REC).add({ data: doc });
      return { code: 0, data: { _id: add._id, ...doc } };
    }

    if (action === "month") {
      // event.yearMonth: 'YYYY-MM'
      const prefix = event.yearMonth;
      const r = await db
        .collection(REC)
        .where({ userId: OPENID, date: db.RegExp({ regexp: "^" + prefix }) })
        .orderBy("date", "asc")
        .limit(100)
        .get();
      return { code: 0, data: r.data };
    }

    if (action === "stats") {
      const weekStart = startOfWeek();
      const [w, all, cardio] = await Promise.all([
        db
          .collection(REC)
          .where({
            userId: OPENID,
            createdAt: _.gte(weekStart),
            completed: true,
          })
          .count(),
        db
          .collection(REC)
          .where({ userId: OPENID, completed: true })
          .field({ date: true })
          .limit(1000)
          .get(),
        db
          .collection(CAR)
          .where({ userId: OPENID })
          .field({ duration: true })
          .limit(1000)
          .get(),
      ]);
      const days = new Set(all.data.map((x) => x.date)).size;
      const minutes = cardio.data.reduce((n, x) => n + (x.duration | 0), 0);
      return {
        code: 0,
        data: { weekCount: w.total, totalDays: days, cardioMinutes: minutes },
      };
    }

    return { code: 400, msg: "unknown action", data: null };
  } catch (e) {
    return { code: 500, msg: e.message, data: null };
  }
};
