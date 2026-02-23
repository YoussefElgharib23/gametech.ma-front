<script setup lang="ts">
interface Props {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}

const props = withDefaults(defineProps<Props>(), {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

const timeLeft = ref({
  days: props.days,
  hours: props.hours,
  minutes: props.minutes,
  seconds: props.seconds
})

let interval: ReturnType<typeof setInterval> | null = null

const updateTimer = () => {
  if (timeLeft.value.seconds > 0) {
    timeLeft.value.seconds--
  } else if (timeLeft.value.minutes > 0) {
    timeLeft.value.minutes--
    timeLeft.value.seconds = 59
  } else if (timeLeft.value.hours > 0) {
    timeLeft.value.hours--
    timeLeft.value.minutes = 59
    timeLeft.value.seconds = 59
  } else if (timeLeft.value.days > 0) {
    timeLeft.value.days--
    timeLeft.value.hours = 23
    timeLeft.value.minutes = 59
    timeLeft.value.seconds = 59
  } else {
    if (interval) {
      clearInterval(interval)
    }
  }
}

onMounted(() => {
  interval = setInterval(updateTimer, 1000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})

const formatTime = (value: number): string => {
  return value.toString().padStart(2, "0")
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs text-brand-dark-950">Se termine dans</span>
    <div class="flex items-center gap-1">
      <div
        class="bg-white rounded px-2 py-1 text-sm font-semibold text-brand-dark-950 min-w-[2rem] text-center"
      >
        {{ formatTime(timeLeft.days) }}
      </div>
      <span class="text-brand-dark-950">:</span>
      <div
        class="bg-white rounded px-2 py-1 text-sm font-semibold text-brand-dark-950 min-w-[2rem] text-center"
      >
        {{ formatTime(timeLeft.hours) }}
      </div>
      <span class="text-brand-dark-950">:</span>
      <div
        class="bg-white rounded px-2 py-1 text-sm font-semibold text-brand-dark-950 min-w-[2rem] text-center"
      >
        {{ formatTime(timeLeft.minutes) }}
      </div>
      <span class="text-brand-dark-950">:</span>
      <div
        class="bg-white rounded px-2 py-1 text-sm font-semibold text-brand-dark-950 min-w-[2rem] text-center"
      >
        {{ formatTime(timeLeft.seconds) }}
      </div>
    </div>
  </div>
</template>
