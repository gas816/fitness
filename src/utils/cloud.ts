/**
 * 云开发初始化与统一调用封装。
 * 仅微信小程序端可用；H5 端会跳过。
 */

const ENV_ID = "cloud1-d3gxzox9cb5b03aab"; // TODO: 替换为你的云开发环境 ID
let inited = false;

export function initCloud() {
  // #ifdef MP-WEIXIN
  if (inited) return;
  if (!wx.cloud) {
    console.error("[cloud] 当前微信基础库不支持云开发，请升级到 2.2.3+");
    return;
  }
  wx.cloud.init({
    env: ENV_ID,
    traceUser: true,
  });
  inited = true;
  // #endif
}

/** 统一云函数调用，自动注入 token / 异常处理 */
export async function callCloud<T = unknown>(
  name: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  // #ifdef MP-WEIXIN
  if (!inited) initCloud();
  try {
    const res = await wx.cloud.callFunction({ name, data });
    const result = res.result as { code: number; msg?: string; data: T };
    if (!result || typeof result.code !== "number") {
      throw new Error(`[${name}] invalid response`);
    }
    if (result.code !== 0) {
      throw new Error(result.msg || `[${name}] code=${result.code}`);
    }
    return result.data;
  } catch (e: any) {
    console.error("[callCloud]", name, e);
    uni.showToast({ icon: "none", title: e?.message || "网络异常" });
    throw e;
  }
  // #endif
  // #ifndef MP-WEIXIN
  // H5 / 其它端走 mock
  console.warn("[callCloud] non-mp env, mock return", name, data);
  return {} as T;
  // #endif
}

/** 直接访问云数据库（仅小程序端） */
export function db() {
  // #ifdef MP-WEIXIN
  if (!inited) initCloud();
  return wx.cloud.database();
  // #endif
  // #ifndef MP-WEIXIN
  throw new Error("cloud db only available in MP-WEIXIN");
  // #endif
}
