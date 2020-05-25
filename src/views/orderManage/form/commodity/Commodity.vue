<template>
  <a-form @submit="handleSubmit" :form="form">
    <a-form-item
      label="商品编号"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
      <a-input
        ref="code"
        @change="e => getByCode(e.target.value)"
        v-decorator="[
          'code',
          {rules: [{ required: true, message: '请输入商品编号' }]}
        ]"
        placeholder="请输入商品编号" />
    </a-form-item>
    <a-form-item
      label="数量"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-input-number
        :min="1"
        :max="10000"
        style="width: 100%"
        v-decorator="[
          'quantity',
          {initialValue: 1, rules: [{ required: true, message: '请输入数量' }]}
        ]"
        placeholder="请输入数量" />
    </a-form-item>
    <a-form-item
      label="中文名"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
      <a-input
        v-if="admin"
        v-decorator="[
          'cName'
        ]"
        placeholder="请输入名称" />
      <a-input
        v-else
        v-decorator="[
          'cName',
          {rules: [{ required: true, message: '请输入名称' }]}
        ]"
        placeholder="请输入名称" />
    </a-form-item>
    <a-form-item
      label="日文名"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
      <a-input
        v-if="admin"
        v-decorator="[
          'jName'
        ]"
        placeholder="请输入名称" />
      <a-input
        v-else
        v-decorator="[
          'jName',
          {rules: [{ required: true, message: '请输入名称' }]}
        ]"
        placeholder="请输入名称" />
    </a-form-item>
    <a-form-item
      label="价格（日元）"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-input-number
        v-if="admin"
        :max="10000"
        style="width: 100%"
        v-decorator="[
          'jPrice'
        ]" />
      <a-input-number
        v-else
        :max="10000"
        style="width: 100%"
        v-decorator="[
          'jPrice',
          {rules: [{ required: true, message: '请输入价格（日元）' }]}
        ]" />
    </a-form-item>
    <a-form-item
      label="品牌"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
      <a-input
        v-if="admin"
        v-decorator="[
          'brand'
        ]"
        placeholder="请输入品牌" />
      <a-input
        v-else
        v-decorator="[
          'brand',
          {rules: [{ required: true, message: '请输入品牌' }]}
        ]"
        placeholder="请输入品牌" />
    </a-form-item>
    <a-form-item
      label="品性"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
      <a-input
        v-if="admin"
        v-decorator="[
          'nature',
        ]"
        placeholder="请输入品性" />
      <a-input
        v-else
        v-decorator="[
          'nature',
          {rules: [{ required: true, message: '请输入品性' }]}
        ]"
        placeholder="请输入品性" />
    </a-form-item>
    <a-form-item
      label="净重"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-input-number
        v-if="admin"
        :max="10000"
        style="width: 100%"
        v-decorator="[
          'weight'
        ]"
        placeholder="请输入净重" />
      <a-input-number
        v-else
        :max="10000"
        style="width: 100%"
        v-decorator="[
          'weight',
          {rules: [{ required: true, message: '请输入净重' }]}
        ]"
        placeholder="请输入净重" />
    </a-form-item>
    <a-form-item
      label="单位"
      :labelCol="{lg: {span: 7}, sm: {span: 7}}"
      :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
    >
      <a-input
        v-if="admin"
        v-decorator="[
          'unit',
        ]"
        placeholder="请输入单位" />
      <a-input
        v-else
        v-decorator="[
          'unit',
          {rules: [{ required: true, message: '请输入单位' }]}
        ]"
        placeholder="请输入单位" />
    </a-form-item>
  </a-form>
</template>

<script>
import { fetch, urls } from '@/api'
import debounce from 'lodash/debounce'

export default {
  name: 'Commodity',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: String,
      required: true
    }
  },
  data () {
    this.getByCode = debounce(this.getByCode, 800)
    return {
      admin: localStorage.getItem('LOGISTIC_ADMIN') === '1',
      // form
      form: this.$form.createForm(this)
    }
  },

  mounted () {
    const { form: { resetFields } } = this
    resetFields()
    this.$nextTick(() => {
      this.$refs.code.focus()
    })
  },
  methods: {
    getByCode (code) {
      fetch(urls.order.getByCode, { code }).then(res => {
        if (res.data.errorCode === 0) {
          const data = res.data.responseBody || {}
          const { cName, jName, jPrice, brand, nature, weight, unit } = data
          const { form: { setFieldsValue } } = this
          setFieldsValue({
            cName, jName, jPrice, brand, nature, weight, unit
          })
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    // handler
    handleSubmit (flag) {
      const { form: { resetFields, validateFields } } = this
      validateFields((err, values) => {
        if (!err) {
          this.$emit('input', true)
          values.orderId = this.orderId
          fetch(urls.order.addCommodity, values).then(res => {
            if (res.data.errorCode === 0) {
              this.$message.success('新增商品成功')
              this.$emit('addSuccess', flag)
              resetFields()
              this.$nextTick(() => {
                this.$refs.code.focus()
              })
            } else {
              this.$message.error(res.data.message)
            }
          }).finally(() => {
            this.$emit('input', false)
          })
        }
      })
    }
  }
}
</script>
