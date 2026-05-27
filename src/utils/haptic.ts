/** 触觉/震动反馈封装 */
export function haptic(type: "light" | "medium" | "heavy" = "light") {
  // #ifdef MP-WEIXIN
  if (type === "heavy") {
    wx.vibrateLong({ fail: () => {} });
  } else {
    wx.vibrateShort({ type, fail: () => {} });
  }
  // #endif
}

export function playDone() {
  haptic("medium");
}

export function playMission() {
  haptic("heavy");
}
