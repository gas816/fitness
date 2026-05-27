import { ref } from "vue";

/** 训练推进流程封装：完成一组的视觉/动画/状态总控制 */
export function useWorkoutFlow() {
  const popKey = ref(0);
  const cardOut = ref(false);
  const missionOverlay = ref(false);

  function triggerSetPop() {
    popKey.value += 1; // 用 key 重置动画
  }

  async function playExerciseOut(): Promise<void> {
    cardOut.value = true;
    await new Promise((r) => setTimeout(r, 520));
    cardOut.value = false;
  }

  function showMission() {
    missionOverlay.value = true;
  }
  function hideMission() {
    missionOverlay.value = false;
  }

  return {
    popKey,
    cardOut,
    missionOverlay,
    triggerSetPop,
    playExerciseOut,
    showMission,
    hideMission,
  };
}
