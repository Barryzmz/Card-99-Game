<template>
  <div
    class="modal fade"
    id="rulesModal"
    tabindex="-1"
    aria-labelledby="rulesModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="rulesModalLabel">Rules of the Game</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>當前分數累計超過99時，則該玩家淘汰。</p>
          <ul>
            <li><strong>黑桃A：</strong>歸零（將當前分數設為0）。</li>
            <li><strong>A（其他花色）：</strong>加 1。</li>
            <li><strong>4：</strong>迴轉（如本來是順時針出牌改成逆時針出牌）。</li>
            <li><strong>5：</strong>指定（出牌者指定一位玩家出牌，不加減數字）。</li>
            <li><strong>10：</strong>可選擇加 10 或減 10。</li>
            <li><strong>J：</strong>跳過一輪（Pass）。</li>
            <li><strong>Q：</strong>可選擇加 20 或減 20。</li>
            <li><strong>K：</strong>將當前分數設為99。</li>
            <li>
              <strong>普通牌（除上述功能牌之外）：</strong>牌面點數加到當前分數。
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>