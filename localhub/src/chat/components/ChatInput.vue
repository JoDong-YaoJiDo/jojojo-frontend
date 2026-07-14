<script setup>

import { ref } from "vue";

const emit = defineEmits(["send"]);

const message = ref("");

function submit(){

    if(!message.value.trim()) return;

    emit("send", message.value);

    message.value="";
}

</script>

<template>

<div class="input-area">

<input

v-model="message"

@keyup.enter="submit"

placeholder="메시지를 입력하세요."

/>

<button @click="submit">

전송

</button>

</div>

</template>

<style scoped>

.input-area{

display:flex;

gap:10px;

}

input{

flex:1;

padding:12px;

border-radius:10px;

border:1px solid #ddd;

}

button{

padding:12px 18px;

border:none;

background:#4f46e5;

color:white;

border-radius:10px;

cursor:pointer;

}

</style>