<template>
    <div v-if="visible" class="modal-backdrop position-fixed top-0 start-0 w-100 h-100"
        style="background-color: rgba(0, 0, 0, 0.4); z-index: 1050;">
        <div class="position-absolute start-50 top-25 translate-middle-x bg-white p-4 rounded shadow"
            style="width: 450px; z-index: 1051;">
            <h5 class="mb-3">Designate the next player</h5>
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-primary flex-fill" style="min-width: 120px; height: 50px;"
                    @click="emitEffect(otherPlayerList[0])">
                    {{ otherPlayerList[0] }}
                </button>
                <button class="btn btn-primary flex-fill" style="min-width: 120px; height: 50px;"
                    @click="emitEffect(otherPlayerList[1])">
                    {{ otherPlayerList[1] }}
                </button>
                <button class="btn btn-primary flex-fill" style="min-width: 120px; height: 50px;"
                    @click="emitEffect(otherPlayerList[2])">
                    {{ otherPlayerList[2] }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    visible: boolean,
    otherPlayerList: string[]
}>()

const emit = defineEmits<{
    (e: 'confirm', parameter: string): void
}>()

function emitEffect(parameter: string) {
    emit('confirm', parameter)
}


</script>