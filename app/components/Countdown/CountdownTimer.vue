<script setup lang="ts">
interface Props {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const props = withDefaults(defineProps<Props>(), {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});

const timeLeft = ref({
  days: props.days,
  hours: props.hours,
  minutes: props.minutes,
  seconds: props.seconds,
});

let interval: ReturnType<typeof setInterval> | null = null;

const updateTimer = () => {
  if (timeLeft.value.seconds > 0) {
    timeLeft.value.seconds--;
  } else if (timeLeft.value.minutes > 0) {
    timeLeft.value.minutes--;
    timeLeft.value.seconds = 59;
  } else if (timeLeft.value.hours > 0) {
    timeLeft.value.hours--;
    timeLeft.value.minutes = 59;
    timeLeft.value.seconds = 59;
  } else if (timeLeft.value.days > 0) {
    timeLeft.value.days--;
    timeLeft.value.hours = 23;
    timeLeft.value.minutes = 59;
    timeLeft.value.seconds = 59;
  } else if (interval) {
    clearInterval(interval);
  }
};

onMounted(() => {
  interval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

const units = computed(() => [
  { label: "jours", value: timeLeft.value.days },
  { label: "heurs", value: timeLeft.value.hours },
  { label: "min", value: timeLeft.value.minutes },
  { label: "sec", value: timeLeft.value.seconds },
]);
</script>

<template>
  <div
    class="inline-flex items-stretch gap-1 sm:gap-2 text-neutral-900"
    role="timer"
    aria-live="polite"
  >
    <template v-for="(unit, i) in units" :key="unit.label">
      <span
        v-if="i"
        class="flex items-center justify-center px-0.5 sm:px-1 text-2xl sm:text-3xl font-medium text-neutral-500 select-none"
        aria-hidden="true"
        >:</span
      >
      <div
        class="bg-neutral-200/80 border border-neutral-300/80 rounded-lg flex flex-col items-center justify-center min-w-14 sm:min-w-16 py-2 px-2 sm:py-2.5 sm:px-3"
      >
        <span
          class="countdown font-mono text-3xl sm:text-4xl tabular-nums leading-none"
        >
          <span
            :style="{ '--value': unit.value, '--digits': 2 }"
            :aria-label="pad2(unit.value)"
          >
            {{ pad2(unit.value) }}
          </span>
        </span>
        <span
          class="text-[10px] sm:text-xs font-medium mt-1 sm:mt-1.5 uppercase tracking-wider opacity-80"
          >{{ unit.label }}</span
        >
      </div>
    </template>
  </div>
</template>

<style scoped>
.countdown {
  display: inline-flex;
}

.countdown > * {
  visibility: hidden;
  --value-v: mod(max(0, var(--value)), 1000);
  --value-hundreds: round(to-zero, var(--value-v) / 100, 1);
  --value-tens: round(to-zero, mod(var(--value-v), 100) / 10, 1);
  --value-ones: mod(var(--value-v), 100);
  --show-hundreds: clamp(
    clamp(0, var(--digits, 1) - 2, 1),
    var(--value-hundreds),
    1
  );
  --show-tens: clamp(
    clamp(0, var(--digits, 1) - 1, 1),
    var(--value-tens) + var(--show-hundreds),
    1
  );
  --first-digits: round(to-zero, var(--value-v) / 10, 1);
  height: 1em;
  width: calc(1ch + var(--show-tens) * 1ch + var(--show-hundreds) * 1ch);
  direction: ltr;
  transition: width 0.4s ease-out 0.2s;
  display: inline-block;
  position: relative;
  overflow-y: clip;
}

.countdown > :before,
.countdown > :after {
  visibility: visible;
  --tw-content: "00\a 01\a 02\a 03\a 04\a 05\a 06\a 07\a 08\a 09\a 10\a 11\a 12\a 13\a 14\a 15\a 16\a 17\a 18\a 19\a 20\a 21\a 22\a 23\a 24\a 25\a 26\a 27\a 28\a 29\a 30\a 31\a 32\a 33\a 34\a 35\a 36\a 37\a 38\a 39\a 40\a 41\a 42\a 43\a 44\a 45\a 46\a 47\a 48\a 49\a 50\a 51\a 52\a 53\a 54\a 55\a 56\a 57\a 58\a 59\a 60\a 61\a 62\a 63\a 64\a 65\a 66\a 67\a 68\a 69\a 70\a 71\a 72\a 73\a 74\a 75\a 76\a 77\a 78\a 79\a 80\a 81\a 82\a 83\a 84\a 85\a 86\a 87\a 88\a 89\a 90\a 91\a 92\a 93\a 94\a 95\a 96\a 97\a 98\a 99\a";
  content: var(--tw-content);
  font-variant-numeric: tabular-nums;
  white-space: pre;
  text-align: end;
  direction: rtl;
  transition:
    all 1s cubic-bezier(1, 0, 0, 1),
    width 0.2s ease-out 0.2s,
    opacity 0.2s ease-out 0.2s;
  position: absolute;
  overflow-x: clip;
}

.countdown > :before {
  width: calc(1ch + var(--show-hundreds) * 1ch);
  top: calc(var(--first-digits) * -1em);
  opacity: var(--show-tens);
  inset-inline-end: 0;
}

.countdown > :after {
  width: 1ch;
  top: calc(var(--value-ones) * -1em);
  inset-inline-start: 0;
}
</style>
