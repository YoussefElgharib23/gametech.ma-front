<script setup lang="ts"></script>

<template>
  <div class="flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden opacity-60 relative">
    <div class="absolute inset-0 flex items-center justify-center z-10 group">
      <div class="text-center max-w-[180px] px-3">
        <p class="text-sm font-semibold text-brand-dark-950 leading-tight">
          Découvrir plus
          <span class="whitespace-nowrap">d’offres</span>
        </p>
        <p class="mt-1 text-[11px] text-neutral-300 leading-snug">Promotions, nouveautés et best-sellers.</p>

        <div class="relative w-6 h-6 mx-auto overflow-hidden">
          <!-- Arrow leaving -->
          <div
            class="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:translate-x-3 group-hover:opacity-0">
            <UIcon name="i-lucide-arrow-right" class="text-brand-dark-950 text-2xl" />
          </div>

          <!-- Arrow entering -->
          <div
            class="absolute inset-0 flex items-center justify-center transition-all duration-300 -translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
            <UIcon name="i-lucide-arrow-right" class="text-brand-dark-950 text-2xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Faded Product Image -->
    <div class="p-4 flex items-center justify-center bg-neutral-50 min-h-[200px] opacity-30">
      <UIcon name="i-lucide-image" class="text-neutral-400 text-4xl" />
    </div>

    <!-- Faded Content -->
    <div class="px-4 text-xs text-neutral-600 uppercase text-center opacity-30">16GB/512GB</div>

    <div class="px-4 py-2 opacity-30">
      <span class="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded uppercase">EN STOCK</span>
    </div>

    <div class="px-4 pb-2 opacity-30">
      <h3 class="text-sm font-medium text-brand-dark-950">Product Title</h3>
    </div>

    <div class="px-4 pb-2 opacity-30">
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold text-brand-dark-950">7 199 MAD</span>
        <span class="text-sm text-neutral-500 line-through">(old price)</span>
      </div>
      <div class="text-xs text-secondary-600 font-medium">En Promo</div>
    </div>
  </div>
</template>
