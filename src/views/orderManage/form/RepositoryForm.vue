<template>
  <a-spin :spinning="subLoading">
    <a-form @submit="handleSubmit" :form="form" class="form">
      <a-row class="form-row" :gutter="16">
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item
            label="箱号">
            <a-input
              placeholder="请输入箱号"
              v-decorator="[
                'box'
              ]" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="16">
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item
            label="收件人">
            <a-input
              placeholder="请输入收件人"
              v-decorator="[
                'name'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item
            label="电话">
            <a-input
              placeholder="请输入电话"
              v-decorator="[
                'phone'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item
            label="身份证号">
            <a-input
              placeholder="请输入身份证号"
              v-decorator="[
                'idCard'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item
            v-show="$route.query.uuid"
            label="邮件单号">
            <a-input
              disabled
              v-decorator="[
                'postNum'
              ]" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row class="form-row" :gutter="16">
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item :colon="false">
            <span slot="label">
              详细地址:
            </span>
            <a-textarea
              rows="4"
              placeholder="请输入详细地址信息，如道路、门牌号、小区、楼栋号、单元等信息"
              v-decorator="[
                'address'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item>
            <span slot="label">
              智能填写
              <a-tooltip title="输入完成后按回车键生成数据">
                <a-icon style="cursor: pointer" type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-textarea
              rows="4"
              @pressEnter="smartFill"
              placeholder="粘贴地址信息，可自动识别并填写如：物小流，188********，广东省 广东市 xx区 xx街道 xxxxx"
              v-model="smartAddress">
            </a-textarea></a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="16">
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item label="毛重">
            <a-input-number
              style="width: 100%"
              placeholder="请输入毛重"
              v-decorator="[
                'weight'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item label="长">
            <a-input-number
              style="width: 100%"
              placeholder="请输入长"
              v-decorator="[
                'length'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item label="宽">
            <a-input-number
              style="width: 100%"
              placeholder="请输入宽"
              v-decorator="[
                'width'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item label="高">
            <a-input-number
              style="width: 100%"
              placeholder="请输入高"
              v-decorator="[
                'height'
              ]" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" >
        <a-col :lg="6" :md="6" :sm="24">
          <a-form-item label="体积重" v-show="$route.query.uuid">
            <a-input-number
              disabled
              style="width: 100%"
              v-decorator="[
                'bulky'
              ]" />
          </a-form-item>
        </a-col>
        <a-col :offset="22">
          <a-form-item>
            <a-button type="primary" htmlType="submit" >提交</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-spin>
</template>

<script>
import { fetch, urls } from '@/api'
import { mapActions } from 'vuex'

export default {
  name: 'RepositoryForm',
  props: {
    selectBatch: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      city: '请选择',
      addInp: false,
      mask: false,
      form: this.$form.createForm(this),

      subLoading: false,
      smartAddress: ''
    }
  },
  methods: {
    ...mapActions(['getOrder']),
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          const uuid = this.$route.query.uuid
          this.subLoading = true
          const param = { ...values }
          // param.address = this.city + param.address
          const url = uuid ? urls.order.update : urls.order.add
          const logisticsId = this.$route.query.logisticsId || this.selectBatch
          if (uuid) {
            param.uuid = uuid
          } else {
            param.logisticsId = logisticsId
          }
          fetch(url, param).then(res => {
            if (res.data.errorCode === 0) {
              this.$message.success(uuid ? '修改订单成功' : '新增订单成功')
              this.getOrder(logisticsId)
              this.$emit('addSuccess')
            } else {
              this.$message.error(res.data.message)
            }
          }).finally(() => {
            this.subLoading = false
          })
        }
      })
    },
    smartFill () {
      if (this.smartAddress === '') return
      const data = this.smartParse(this.smartAddress)
      const { name, phone, address, province, city, county } = data
      const { form: { setFieldsValue } } = this
      let citys = `${province || ''}${city || ''}${county || ''}${address || ''}`
      if (citys === 'undefined') citys = ''
      setFieldsValue({
        name,
        phone,
        address: citys
      })
      this.city = citys
    }
  }
}
</script>

<style scoped>
>>>.ant-form-item-label {
  overflow: inherit;
}
.translate-more {
  transform: translateX(260px);
}
.translate {
  transform: translateX(130px);
}
</style>
