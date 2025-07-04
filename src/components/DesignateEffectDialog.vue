<template>
    <div v-if="visible" class="modal-backdrop position-fixed top-0 start-0 w-100 h-100"
        style="background-color: rgba(0, 0, 0, 0.4); z-index: 1050;">
        <div class="position-absolute start-50 top-25 translate-middle-x bg-white p-4 rounded shadow"
            style="width: 350px; z-index: 1051;">
            <h5 class="mb-3">Designate the next player</h5>
            <div style="max-height: 500px; overflow-y: auto;">
                <div class="d-flex justify-content-end" v-for="player in otherPlayerList" :key="player.accountId">
                    <button class="btn btn-primary flex-fill mt-2" style="min-width: 120px; height: 50px;"
                        @click="emitEffect(player.accountId, player.name)">
                        {{ player.name }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Account } from '@/types/baseType'
const props = defineProps<{
    visible: boolean,
    otherPlayerList: Account[]
}>()

const emit = defineEmits<{
    (e: 'confirm', accountId: string, name: string): void
}>()

function emitEffect(accountId: string, name: string) {
    emit('confirm', accountId, name)
}



</script>