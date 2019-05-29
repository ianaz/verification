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
<div class="verification-item" :class="{expanded: showAdvancedInfo}">
  <div class="item-header" @click="showAdvancedInfo = false">
    <div class="icon">
      <slot name="icon"></slot>
    </div>
    <div class="title">
      <div class="filename">{{ verificationItem.name }}</div>
    </div>
  </div>
  <div class="item-body">
    <div class="status">
      <slot name="title"></slot>
    </div>
    <transition name="expand" mode="out-in">
      <div class="loading-spinner" key="spinner" v-if="verificationItem.loaded !== true">
        <vue-simple-spinner></vue-simple-spinner>
      </div>
      <div class="verification-info" key="info" v-else>
        <div class="issuer_name"
             v-if="verificationItem.issuerName">
          <h3>{{ $t('verification.result.meta.issuer') }}</h3>
          {{ verificationItem.issuerName }}
        </div>
        <div class="hash"
             v-if="verificationItem.issuer">
          <h3>{{ $t('verification.result.meta.issuerAddress') }}</h3>
          <span class="content">{{ verificationItem.issuer }}</span>
        </div>
        <div class="registration_date"
             v-if="verificationItem.registrationBlock">
          <h3>{{ $t('verification.result.meta.registrationDate') }}</h3>
          {{ moment.unix(verificationItem.registrationBlock.timestamp).format('MMMM Do YYYY, h:mm:ss a') }}
        </div>
        <div class="revocationDate"
             v-if="verificationItem.revocationBlock">
          <h3>{{ $t('verification.result.meta.revocationDate') }}</h3>
          {{ moment.unix(verificationItem.revocationBlock.timestamp).format('MMMM Do YYYY, h:mm:ss a') }}
        </div>
      </div>
    </transition>
    <div class="description">
      <slot name="description"></slot>
    </div>
  </div>
  <div class="item-footer">
      <button v-if="showAdvancedInfo === false"
              class="btn btn-link advanced-toggler"
              @click.prevent="showAdvancedInfo = true">
        <i class="toggler mdi mdi-chevron-up mdi-24px"></i>
        <span>{{ $t('verification.result.expertInfo.show') }}</span>
      </button>
      <div v-else key="opened">
        <button key="closed"
                class="btn btn-link advanced-toggler"
                @click.prevent="showAdvancedInfo = !showAdvancedInfo">
          <span>{{ $t('verification.result.expertInfo.hide') }}</span>
          <i class="toggler mdi mdi-chevron-down mdi-24px"></i>
        </button>
        <slot name="advanced" class="footer-content">
          <div class="advanced-info">
            <div class="hash" v-if="verificationItem.issuer">
              <h3 class="advanced_info--title">{{ $t('verification.result.meta.issuerAddress') }}</h3>
              <span class="content">{{ verificationItem.issuer }}</span>
            </div>
            <div class="hash" v-if="verificationItem.hash">
              <h3 class="advanced_info--title">{{ $t('verification.result.meta.fingerprint') }}</h3>
              <span class="content">{{ verificationItem.hash }}</span>
            </div>
            <div class="hash" v-if="verificationItem.registrationEvent">
              <h3 class="advanced_info--title">{{ $t('verification.result.meta.registrationTransaction') }}</h3>
              <span class="content">{{ verificationItem.registrationEvent.transactionHash}}</span>
            </div>
            <div class="hash" v-if="verificationItem.revocationEvent">
              <h3 class="advanced_info--title">{{ $t('verification.result.meta.revocationTransaction') }}</h3>
              <span class="content">{{ verificationItem.registrationEvent.transactionHash}}</span>
            </div>
          </div>
        </slot>
      </div>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import Spinner from 'vue-simple-spinner'

export default {
  name: 'layout-verification-item',
  props: ['verificationItem'],
  components: {
    'vue-simple-spinner': Spinner,
  },
  data () {
    return {
      showAdvancedInfo: false,
      moment,
    }
  },
}
</script>
