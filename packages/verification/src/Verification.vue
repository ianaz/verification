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
<div id="certifaction-verification">
  <div class="verification">
    <div class="verification-demo" v-if="demo !== false">
      <div class="sample-docs papers">
        <h3>{{ $t('verification.demo.title') }}</h3>
        <span class="text-muted"><small>{{ $t('verification.demo.clickToVerify') }}</small></span>
        <div class="docs">
          <div class="paperbox text-center">
            <div class="paper paper-verified" @click="demoVerified" @dragstart="draggingDemoDoc = 'verified'"
                 @dragend="draggingDemoDoc = undefined"
                 draggable>
              <i class="mdi mdi-shield-check mdi-18px"></i>
              <div class="lines">
                <div class="line-short"></div>
                <div class="line-long"></div>
                <div class="line-long"></div>
                <div class="line-short"></div>
              </div>
            </div>
            <div class="paper paper-unverified mt-2" @click="demoUnverified"
                 @dragend="draggingDemoDoc = undefined"
                 @dragstart="draggingDemoDoc = 'unverified'" draggable>
              <i class="mdi mdi-alert-circle-outline"></i>
              <div class="lines">
                <div class="line-short"></div>
                <div class="line-long"></div>
                <div class="line-long"></div>
                <div class="line-long"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <verification-drop-box @filesDropped="verify"/>
    <div class="verification-item-list">
      <verification-item v-for="verificationItem in filteredVerificationItems"
                         :verificationItem="verificationItem"/>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import './assets/styles/styles.scss'
import VerificationItem from './components/verification-items/VerificationItem'
import VerificationDropBox from './components/VerificationDropBox'
import client from './lib/contract-adapter'
import VERIFICATION_TYPES from './lib/verification-types'
import hashingService from './lib/hashing-service'

function mapVerificationItemType (item) {
  if (item.issuer === null) {
    return VERIFICATION_TYPES.V_NOT_FOUND
  }
  if (item.revoked === true) {
    return VERIFICATION_TYPES.V_REVOKED
  }
  if (item.issuer_verified === true) {
    return VERIFICATION_TYPES.V_VERIFIED
  }
  return VERIFICATION_TYPES.V_SELF_DECLARED
}

export default {
  name: 'bf-verification',
  props: {
    demo: {
      required: false,
      type: Boolean,
    },
  },
  components: {
    VerificationItem,
    VerificationDropBox,
  },
  data () {
    return {
      verificationItems: [],
      draggingDemoDoc: undefined,
      draggingOver: false,
    }
  },
  computed: {
    filteredVerificationItems () {
      return this.verificationItems.map(item => {
        if (item.hash === undefined) {
          return {
            hashed: false,
          }
        }
        return {
          hashed: true,
          type: mapVerificationItemType(item),
          ...item,
        }
      })
    },
  },
  methods: {
    async verify (files) {
      this.verificationItems = []
      try {
        for (const file of files) {
          this.verificationItems.push({file, name: file.name})
        }
        this.verificationItems.forEach(async (item, i) => {
          const hash = await hashingService.hashFile(item.file)
          const verification = await client.verifyFile(hash)
          Vue.set(this.verificationItems, i, {...this.verificationItems[i], hash, ...verification})

          if (verification.issuer !== null) {
            let [registrationEvent, registrationBlock] = await Promise.all(
              [client.getRegistrationEvent(hash), client.getRegistrationTxBlock(hash)],
            )

            Vue.set(this.verificationItems, i, {...this.verificationItems[i], registrationEvent, registrationBlock})

            if (verification.revoked === true) {
              let [revocationEvent, revocationBlock] = await Promise.all(
                [client.getRevocationEvent(hash), client.getRevocationTxBlock(hash)],
              )
              Vue.set(this.verificationItems, i, {...this.verificationItems[i], revocationEvent, revocationBlock})
            }
          }

          Vue.set(this.verificationItems[i], 'loaded', true)
        })
      } catch (e) {
        console.log(e)
      }
    },
    drop () {
      if (this.draggingDemoDoc) {
        switch (this.draggingDemoDoc) {
          case 'verified':
            this.demoVerified()
            break
          case 'unverified':
            this.demoUnverified()
            break
        }
      }
    },
    demoVerified () {
      this.verificationItems = []
      this.verificationItems.unshift({
          'hashed': true,
          'type': 3,
          'name': this.$t('verification.demo.doc1Filename'),
          'hash': '0x33e63485a8594ee7d1cfbb418a6f5acf7532faca38aa8a36b23eec8f6a53d179',
          'issuer': '0xD0f6C73Bf87d1A00797A8A1DF2dF0Dad89D2411f',
          'issuerName': 'Test University',
          'issuerImg': null,
          'issuerVerified': true,
          'revoked': false,
          'expiry': null,
          'registrationEvent': {
            'address': '0xEc70947Cbb9bbF8b94AcAECa861dDbC933B3C789',
            'blockHash': '0x960a78d637f7b7aae0146d3be54159b1e8a96079ea4b34e60dae74d9350730f0',
            'blockNumber': 5236245,
            'logIndex': 19,
            'removed': false,
            'transactionHash': '0x2cbc8c13f003fce83f5828ad979d7deddfa1b3ebec65edbb2db822f9d5e74d5c',
            'transactionIndex': 22,
            'id': 'log_0x33c9d7c1d61de510127524493d3c2e1124488539f76497961a0f074a13572b8f',
            'returnValues': {
              '0': '0x33e66485a8594ee7d1cfbb418a6f5acf7532faca38aa8a36b23eec8f6a53d179',
              'hash': '0x33e66485a8594ee7d1cfbb418a6f5acf7532faca38aa8a36b23eec8f6a53d179',
            },
            'event': 'FileRegisteredEvent',
            'signature': '0x98b03391b6b42a1d067881e3d2a22b2091e0412a0e2c40cf687d1c036beb6e11',
            'raw': {
              'data': null,
              'topics': [
                '0x98b03391b6b42a1d067881e3d2a22b2091e0412a0e2c40cf687d1c036beb6e11',
                '0x33e66485a8594ee7d1cfbb418a6f5acf7532faca38aa8a36b23eec8f6a53d179'],
            },
          },
          'registrationBlock': {
            'difficulty': '2674211505',
            'extraData': '0xd883010817846765746888676f312e31312e35856c696e7578',
            'gasLimit': 8007840,
            'gasUsed': 3399537,
            'hash': '0x960a78d637f7b7aae0146d3be54159b1e8a96079ea4b34e60dae74d9350730f0',
            'logsBloom': '0x00000103000200000000000104000000002048000080000000000004000000200004006000000000000000000001200000004040002040040001040002200000010000000028000000a0820821001000002000004000800400000008400000000100000002000004000000000000080080800440000340000002011000000000002000000000000000000000002000000010022000c0000000200000000000080a008402010000c000010000020004000000000000001000000000010002000200000002000401000162000080000000008030810000000002030000000021000010080041000000040010001120000004000000000040000000000000208000',
            'miner': '0x5699b1a504f139100B889C7280074C028eb318bB',
            'mixHash': '0xb6980183aab23b67cb24f27063c8821b6fb711bdf09154c8a4c09b011ac896f7',
            'nonce': '0x3e60c1ff045afbc5',
            'number': 5236245,
            'parentHash': '0xc9bb5f9db1dc477ceb283921822dabc9c7e4cf2ae524fb9f4db95457eb61b664',
            'receiptsRoot': '0x6cc3a7d53693ca3a2cc3c5edc48cad981376c8013781c1414678fa939b786c8e',
            'sha3Uncles': '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
            'size': 13866,
            'stateRoot': '0x55c8e0ac421669779b4b8b9b9b8ba579ae5f24d1ecb64b98485271636dee07e4',
            'timestamp': 1553015795,
            'totalDifficulty': '18622392379037540',
            'transactions': [
              '0x9a292973e4455c60186ffbeaa0328a0cb6553de6afec39c6d7effe3baced2e6c',
              '0x23fcbec8ff50e2395784d7e5273d457ae73114b3f279b437b94c11f0c0618c9c',
              '0x707ff314b4ebaf49eb661ef903f974f9998d77c07358d2106eee9deebd5abc84',
              '0x83114bef1f79948116e28369741ae436e236dd624f5231a6515c7652be975ef8',
              '0x7bca60f7b334ee76f447062c81fec2f55821bd480e8c9a3963a0b35f00f5062c',
              '0x45f2cd69fc1db51697b46a42eb7ef6cf1eb3d7edfd810ae7ab5581fe15ce9b1c',
              '0x0701ccc7afe99960d54b4b2b66144d4066b1bb8f6975e10394e2eefaa3521bce',
              '0x13dd6891959bc7e537885fd4dd621b82a0c5fe1217951728f40633a8631708fc',
              '0x09919da08ce0abf03423690614cfcd34830752bb4a977c74e02162423a66aa7d',
              '0x53f8b0f53e20253a94ee6654da61c4da0c881909f9e2fb20eefb2cf48d560c84',
              '0xcfe5a576aa1e81ab6432f386d665bd328137cd4a7bc883356bcc0589f1785d8f',
              '0x2e91e2e22607edc7a25d7a3d3406f958e79d989a448924570f9d82bd57672e8d',
              '0x563bee1dd00295927b78eac0b16b65d9d33917a982f63e64db8e7bb4f6496051',
              '0x0fb3d51217c0765159120479b27fe34883f1052b2528d4514a901cf61883a232',
              '0xcbdbd859e71cee1a6ef6da23f4359f8d1d8e6a7e10f01e79fb4cefb0c78570d5',
              '0xe612cb615469f57ab7336d5d0dac9e4da10d347f92652a111b0dd483a2a0a4bf',
              '0x7d8f7adafdfd24d446e3eb3e94174e3e95fbf5a7d0a8bd1efc4afc644dad1835',
              '0x2df10ae92750d7dba6c659364c27611ecc54ceecb077ec27c3cd7c0594ad9b32',
              '0xf0a80feff6d6dbb153fa9135c2df0a8af03591e1208cdab399c46ae3f843a517',
              '0x8931c214b001123bd933b0f988b77f89ab3dfdec64e3bab46af940e2badea24e',
              '0x0eecf7a0937189dde39ff800ad1efbbcd4fc0659a0049ed8729e6e4f28dfddd3',
              '0xaef8119fd35324087ef52393d6aae449c81e61b3622a114c569e3d66a9293f81',
              '0x2cbc8c13f003fce83f5828ad979d7deddfa1b3ebec65edbb2db822f9d5e74d5c',
              '0x8b682b82c41996d6f540d8dd5c89ef40fc420b0d614359ead7ca25c06779c783',
              '0x4f27371cb4715b8a23eae8a85a773c9b3ea6cdd1f3161fe4fba50acf0011ae16',
              '0xa78690ee580b98b9abe7a797b36a28dd78537c28180345708de753ba21f8e380',
              '0x547a56c6abfb37a35f095d265d169ce9500b53adc2e56ae789fd56449503a2df',
              '0x7bbec418da5d19636599103fdcc6cbb03e96cb03f110135c961edf013bc2197f',
              '0xd6a88ffa2a338bc86151e4f521f98c90d1f7cf16be9409e1d78582732738f60d',
              '0x9c28da9e542bb5597f4cc6d711dc2e70c559a959cc23f2ec4d1bf1c75db08960',
              '0x956f963cdbf4d03ecf369ee3562a0134bb4cf7dd9a1879fd088cba187a6e22c4',
              '0x2153cc91115c7eb64610a5a47faa2f646c7ddfc2987841c540e0cead2da4b58f',
              '0x26028d8c68e8f22579693a3d5156f395a36980cb8300a652069361d47db00620',
              '0x3a20c7487783824aba018ff6d11b2c66ce39398eccd2b93a6900e0ecf609cafc'],
            'transactionsRoot': '0xe90747133aca5a61c0225d0f90eb43e5e34da2b38d902f33529d75734dffcce5',
            'uncles': [],
          },
          'loaded': true,
        })
    },
    demoUnverified () {
      this.verificationItems = []
      this.verificationItems.unshift({
        'name': this.$t('verification.demo.docUnverifiedFilename'),
        'hash': '0x8db3dfe7de59e35f5f8be5fde6da543b57ccc017388def7c0a1db7af24db4abf',
        'issuer': null,
        'issuerName': null,
        'issuerImg': null,
        'issuerVerified': false,
        'revoked': false,
        'expiry': null,
        'loaded': true,
      })
    },
  },
}
</script>
