<template>
    <div v-if="visible" class="modal-backdrop position-fixed top-0 start-0 w-100 h-100"
        style="background-color: rgba(0, 0, 0, 0.4); z-index: 1050;">
        <div class="position-absolute start-50 top-25 translate-middle-x bg-white p-4 rounded shadow"
            style="width: 450px; z-index: 1051;">
            <h5 class="mb-3">{{ cardName }} Effect</h5>
            <p class="mb-4">Do you want to add {{ cardValue }} or subtract {{ cardValue }} score?</p>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-danger flex-fill" style="min-width: 120px;" @click="emitEffect(1)">
                    Add {{ cardValue }}
                </button>
                <button class="btn btn-success flex-fill" style="min-width: 120px;" @click="emitEffect(-1)">
                    Subtract {{ cardValue }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    visible: boolean
    category: String
}>()

const emit = defineEmits<{
    (e: 'confirm', parameter: number): void
}>()

function emitEffect(parameter: number) {
    emit('confirm', parameter)
}

// 根據 category 計算顯示的文字
const cardName = computed(() => {
    switch (props.category) {
        case 'add_or_sub_twenty':
            return 'QUEEN';
        case 'add_or_sub_ten':
            return 'TEN';
        default:
            return 'Unknown Card';
    }
});

const cardValue = computed(() => {
    switch (props.category) {
        case 'add_or_sub_twenty':
            return '20';
        case 'add_or_sub_ten':
            return '10';
        default:
            return '0';
    }
});
</script>