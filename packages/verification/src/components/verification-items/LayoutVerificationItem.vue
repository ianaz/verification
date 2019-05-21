<!--
  - Copyright (c) 2019 BlockFactory AG
  -
  - Permission is hereby granted, free of charge, to any person obtaining a copy
  - of this software and associated documentation files (the "Software"), to deal
  - in the Software without restriction, including without limitation the rights
  - to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  - copies of the Software, and to permit persons to whom the Software is
  - furnished to do so, subject to the following conditions:
  -
  - The above copyright notice and this permission notice shall be included in all
  - copies or substantial portions of the Software.
  -
  - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  - IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  - FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  - AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  - LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  - OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  - SOFTWARE.
  -->

<template>
<div class="verification-item">
  <div class="item-header">
    <div class="icon">
      <slot name="icon"></slot>
    </div>
    <div class="title">
      <div class="filename">{{ verificationItem.name }}</div>
      <slot name="title"></slot>
    </div>
  </div>
  <div class="item-body">
    <div class="description">
      <slot name="description"></slot>
    </div>
    <div class="issuer"
         v-if="verificationItem.issuerName">
      <h3>Issuer</h3>
      {{ verificationItem.issuerName }}
    </div>
    <div class="issuer"
         v-if="verificationItem.issuer">
      <h3>Issuer address</h3>
      {{ verificationItem.issuer }}
    </div>
    <div class="registration_date"
         v-if="verificationItem.registrationBlock">
      <h3>Registration date</h3>
      {{ verificationItem.registrationBlock.timestamp}}
    </div>
    <div class="revocationDate"
         v-if="verificationItem.revocationBlock">
      <h3>Revocation date</h3>
      {{ verificationItem.revocationBlock.timestamp}}
    </div>
  </div>
  <div class="item-footer">
    <button v-if="showAdvancedInfo"
            class="btn btn-link advanced-toggler"
            @click="showAdvancedInfo = !showAdvancedInfo">
      <span>Hide expert info</span>
      <i class="toggler mdi mdi-chevron-up-circle-outline mdi-24px"></i>
    </button>
    <button v-else
            class="btn btn-link advanced-toggler"
            @click="showAdvancedInfo = true">
      <span>Show expert info</span>
      <i class="toggler mdi mdi-chevron-down-circle-outline mdi-24px"></i>
    </button>
    <slot name="advanced" class="advanced" v-if="showAdvancedInfo === true">
      <div v-if="verificationItem.issuer">
        <h3 class="advanced_info--title">Issuer address</h3>
        {{ verificationItem.issuer }}
      </div>
      <div v-if="verificationItem.hash">
        <h3 class="advanced_info--title">File hash value</h3>
        {{ verificationItem.hash }}
      </div>
      <div v-if="verificationItem.registrationBlock">
        <h3 class="advanced_info--title">Registered at</h3>
        {{ verificationItem.registrationBlock.timestamp }}
      </div>
      <div v-if="verificationItem.registrationEvent">
        <h3 class="advanced_info--title">Registration transaction</h3>
        {{ verificationItem.registrationEvent.transactionHash}}
      </div>
      <div v-if="verificationItem.revocationEvent">
        <h3 class="advanced_info--title">Revocation transaction</h3>
        {{ verificationItem.registrationEvent.transactionHash}}
      </div>
      <div v-if="verificationItem.hash">
        <h3 class="advanced_info--title">File hash value</h3>
        {{ verificationItem.hash }}
      </div>
    </slot>
  </div>
</div>
</template>

<script>
export default {
  name: 'layout-verification-item',
  props: ['verificationItem'],
  data () {
    return {
      showAdvancedInfo: false,
    }
  },
}
</script>
